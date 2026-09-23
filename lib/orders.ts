import {randomBytes} from 'node:crypto';
import {z} from 'zod';
import {db,transaction,audit,changeStock} from './db.ts';
import {getProduct} from './products.ts';
import {deliveryFor} from './store-settings.ts';
export type OrderItem={id:string;size:string;quantity:number;name:string;price:number;color:string};
export type Order={id:string;request_key:string;customer:string;phone:string;address:string;zone:string;zone_label:string;note:string;items:OrderItem[];subtotal:number;delivery:number;discount:number;advance:number;total:number;status:string;created_at:string;version:number;source:string;courier?:Courier};
export type Courier={order_id:string;state:string;consignment_id:string|null;tracking_code:string|null;delivery_status:string|null;message:string;updated_at:string};
export const orderSchema=z.object({
 requestKey:z.string().uuid(),customer:z.string().trim().min(2).max(100),phone:z.string().trim().regex(/^(?:\+?88)?01[3-9]\d{8}$/,'Enter a valid Bangladesh mobile number'),address:z.string().trim().min(10).max(500),zone:z.string().min(1).max(30),note:z.string().trim().max(500).default(''),items:z.array(z.object({id:z.string(),size:z.string(),quantity:z.number().int().min(1).max(100)})).min(1).max(50)
});
const adminSchema=orderSchema.extend({version:z.number().int().optional(),discount:z.number().int().min(0).max(10000000).default(0),advance:z.number().int().min(0).max(10000000).default(0),delivery:z.number().int().min(0).max(10000).optional()});
export function getOrder(id:string):Order|undefined{const row=db().prepare('SELECT * FROM orders WHERE id=?').get(id);if(!row)return;const courier=db().prepare('SELECT * FROM courier WHERE order_id=?').get(id);return {...row,items:JSON.parse(String(row.items)),courier:courier?{...courier}:undefined} as unknown as Order;}
export function listOrders(page=1,q='',status='All'){
 const params:(string|number)[]=[];const where:string[]=[];
 if(q){where.push('(id LIKE ? OR customer LIKE ? OR phone LIKE ?)');params.push(...Array(3).fill('%'+q.slice(0,100)+'%'));}
 if(status!=='All'){where.push('status=?');params.push(status);}
 const clause=where.length?' WHERE '+where.join(' AND '):'';
 const total=Number(db().prepare('SELECT COUNT(*) AS n FROM orders'+clause).get(...params)!.n);
 const ids=db().prepare('SELECT id FROM orders'+clause+' ORDER BY rowid DESC LIMIT 20 OFFSET ?').all(...params,(Math.max(1,page)-1)*20);
 return {orders:ids.map(r=>getOrder(String(r.id))!),total,page};
}
function reserve(items:z.infer<typeof orderSchema>['items'],reason:string,old:OrderItem[]=[],admin=false){
 const merged=new Map<string,{id:string;size:string;quantity:number}>();
 for(const item of items){const key=item.id+':'+item.size;merged.set(key,{...item,quantity:item.quantity+(merged.get(key)?.quantity||0)});}
 return [...merged.values()].map(item=>{
  const product=getProduct(item.id),previous=old.find(i=>i.id===item.id&&i.size===item.size);
  if(item.quantity>(admin?100:10))throw new Error('Quantity exceeds the allowed limit.');
  if(!product||(!previous&&(product.deleted||!product.active||!product.sizes.includes(item.size))))throw new Error('A selected product or size is no longer available.');
  if(previous&&(product.deleted||!product.active||!product.sizes.includes(item.size))&&item.quantity>previous.quantity)throw new Error('Cannot increase a retired product. Choose an available product.');
  changeStock(item.id,item.size,-item.quantity,reason);
  return {...item,name:previous?.name||product.name,price:previous?.price??product.price,color:previous?.color||product.color};
 });
}
export function createOrder(raw:unknown,admin=false){
 const input=adminSchema.parse(raw);
 return transaction(()=>{
  const previous=db().prepare('SELECT id,total FROM orders WHERE request_key=?').get(input.requestKey);
  if(previous)return {id:String(previous.id),total:Number(previous.total)};
  const id='EV-'+randomBytes(5).toString('hex').toUpperCase();
  const items=reserve(input.items,'Order '+id,[],admin),zone=deliveryFor(input.zone);
  const subtotal=items.reduce((s,i)=>s+i.price*i.quantity,0),delivery=admin?(input.delivery??zone.fee):zone.fee,discount=admin?input.discount:0,advance=admin?input.advance:0,total=subtotal+delivery-discount;
  if(total<0||advance>total)throw new Error('Discount or advance exceeds the order total.');
  const expected=(raw as {expectedTotal?:number}).expectedTotal;
  if(!admin&&expected!==undefined&&expected!==total)throw new Error('A price or delivery charge has changed. Refresh checkout to review the new total.');
  db().prepare('INSERT INTO orders (id,request_key,customer,phone,address,zone,zone_label,note,items,subtotal,delivery,discount,advance,total,source) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id,input.requestKey,input.customer,input.phone.replace(/^\+?88/,''),input.address,input.zone,zone.name,input.note,JSON.stringify(items),subtotal,delivery,discount,advance,total,admin?'Admin':'Website');
  audit('Order created',id,admin?'Manual order':'Website order');return {id,total};
 });
}
export function editOrder(id:string,raw:unknown){const input=adminSchema.parse(raw);return transaction(()=>{
 const old=getOrder(id);if(!old)throw new Error('Order not found.');
 if(old.version!==input.version)throw new Error('This order changed in another tab. Refresh before saving.');
 if(!['Pending','Confirmed'].includes(old.status)||old.courier&&old.courier.state!=='failed')throw new Error('This order is locked after courier submission or dispatch. Resolve the parcel with Steadfast before changing delivery details.');
 for(const i of old.items)changeStock(i.id,i.size,i.quantity,'Edit reversal '+id);
 const items=reserve(input.items,'Order edited '+id,old.items,true),zone=input.zone===old.zone?{name:old.zone_label||old.zone,fee:old.delivery}:deliveryFor(input.zone);
 const subtotal=items.reduce((s,i)=>s+i.price*i.quantity,0),delivery=input.delivery??zone.fee,total=subtotal+delivery-input.discount;
 if(total<0||input.advance>total)throw new Error('Discount or advance exceeds the order total.');
 db().prepare('UPDATE orders SET customer=?,phone=?,address=?,zone=?,zone_label=?,note=?,items=?,subtotal=?,delivery=?,discount=?,advance=?,total=?,version=version+1 WHERE id=?').run(input.customer,input.phone.replace(/^\+?88/,''),input.address,input.zone,zone.name,input.note,JSON.stringify(items),subtotal,delivery,input.discount,input.advance,total,id);
 audit('Order edited',id,'Customer, items or delivery updated');return getOrder(id)!;
});}
export function setOrderStatus(id:string,status:string,version?:number,receivedReturn=false){return transaction(()=>{
 const order=getOrder(id);if(!order)throw new Error('Order not found.');
 if(version!==undefined&&order.version!==version)throw new Error('Order changed. Refresh before updating.');
 if(status===order.status)return;
 const transitions:Record<string,string[]>={Pending:['Confirmed','Cancelled'],Confirmed:['Shipped','Cancelled'],Shipped:['Delivered','Cancelled'],Delivered:[],Cancelled:[]};
 if(!transitions[order.status]?.includes(status))throw new Error('This status change is not allowed.');
 if(status==='Cancelled'&&order.courier&&order.courier.state!=='failed'&&!(receivedReturn&&order.courier.delivery_status==='cancelled'))throw new Error('For a booked parcel, sync courier status and confirm the returned goods are received before cancelling and restocking.');
 if(status==='Cancelled'&&order.status==='Shipped'&&!receivedReturn)throw new Error('Confirm that returned goods have been received before restocking.');
 if(status==='Cancelled')for(const item of order.items)changeStock(item.id,item.size,item.quantity,'Order cancelled '+id);
 db().prepare('UPDATE orders SET status=?,version=version+1 WHERE id=?').run(status,id);audit('Order status',id,order.status+' → '+status);
});}
