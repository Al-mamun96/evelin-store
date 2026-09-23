import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
const dir=mkdtempSync(join(tmpdir(),'evelin-admin-'));
process.env.DATABASE_PATH=join(dir,'store.sqlite');process.env.SESSION_SECRET='local-test-only-secret-with-at-least-32-characters';
const {db,inventory}=await import('../lib/db.ts');
const {saveProduct,archiveProduct,getProduct,getProducts,adjustStock}=await import('../lib/products.ts');
const {getSettings,saveSettings}=await import('../lib/store-settings.ts');
const {createOrder,editOrder,getOrder,setOrderStatus}=await import('../lib/orders.ts');
const {saveCourier,courierSettings,bookCourier,syncCourier}=await import('../lib/steadfast.ts');
const sample=()=>({name:'Test Panjabi',category:'Panjabi',price:2000,image:'/images/panjabi.webp',color:'White',hex:'#ffffff',description:'Testing a sample product',fabric:'Cotton',sizes:['M','L'],active:true,initialStock:20});
const input=(id:string)=>({requestKey:randomUUID(),customer:'Test Customer',phone:'01712345678',address:'Test road, Dhaka, Bangladesh',zone:'dhaka',items:[{id,size:'M',quantity:2}],discount:100,advance:500});
test('product create/edit/delete/restore and public visibility',()=>{
 const p=saveProduct(sample());assert.ok(getProducts().some(x=>x.id===p.id));
 const edited=saveProduct({...p,name:'Updated product',price:2200});assert.equal(edited.version,2);
 assert.throws(()=>saveProduct({...p,name:'Stale edit'}));
 archiveProduct(p.id,edited.version!);assert.ok(!getProducts().some(x=>x.id===p.id));assert.equal(getProduct(p.id)?.deleted,true);
 archiveProduct(p.id,getProduct(p.id)!.version!,true);assert.equal(getProduct(p.id)?.active,false);assert.equal(getProduct(p.id)?.deleted,false);
});
test('settings, custom shipping zones and version conflicts',()=>{
 const settings=getSettings();saveSettings({...settings,heroTitle:'A new homepage title',zones:[...settings.zones,{id:'nearby',name:'Nearby Dhaka',fee:100}]});
 assert.equal(getSettings().heroTitle,'A new homepage title');assert.throws(()=>saveSettings(settings));
 const p=saveProduct(sample());const result=createOrder({...input(p.id),zone:'nearby'},true);assert.equal(getOrder(result.id)?.delivery,100);
});
test('order edit reconciles stock, preserves historical prices, recalculates COD',()=>{
 const p=saveProduct(sample()),created=createOrder(input(p.id),true),old=getOrder(created.id)!;
 saveProduct({...p,price:2500});
 const edited=editOrder(created.id,{...input(p.id),requestKey:old.request_key,version:old.version,items:[{id:p.id,size:'M',quantity:3},{id:p.id,size:'L',quantity:1}],zone:'outside',discount:200,advance:1000});
 assert.equal(edited.items[0].price,2000);assert.equal(edited.items[1].price,2500);assert.equal(edited.total,8430);assert.equal(edited.total-edited.advance,7430);
 assert.equal(inventory().find(i=>i.product_id===p.id&&i.size==='M')!.stock,17);assert.equal(inventory().find(i=>i.product_id===p.id&&i.size==='L')!.stock,19);
 assert.throws(()=>editOrder(created.id,{...input(p.id),version:old.version}));
});
test('failed edits roll back stock and order; cancellation restocks only once',()=>{
 const p=saveProduct(sample()),created=createOrder(input(p.id),true),old=getOrder(created.id)!;
 assert.throws(()=>editOrder(old.id,{...input(p.id),version:old.version,items:[{id:p.id,size:'M',quantity:99}]}));assert.equal(getOrder(old.id)!.version,old.version);assert.equal(inventory().find(i=>i.product_id===p.id&&i.size==='M')!.stock,18);
 setOrderStatus(old.id,'Cancelled');setOrderStatus(old.id,'Cancelled');assert.equal(inventory().find(i=>i.product_id===p.id&&i.size==='M')!.stock,20);
});
test('stock adjustment is checked against latest count and audited',()=>{
 const p=saveProduct(sample());adjustStock({id:p.id,size:'M',expectedStock:20,stock:30,reason:'New delivery'});assert.throws(()=>adjustStock({id:p.id,size:'M',expectedStock:20,stock:40,reason:'Stale count'}));assert.equal(inventory().find(i=>i.product_id===p.id&&i.size==='M')!.stock,30);
 assert.equal(db().prepare('SELECT reason FROM stock_log WHERE product_id=? ORDER BY id DESC').get(p.id)!.reason,'New delivery');
});
test('deleted products retain existing order records and cannot be bought',()=>{
 const p=saveProduct(sample()),o=createOrder(input(p.id),true);archiveProduct(p.id,p.version!);assert.equal(getOrder(o.id)!.items[0].name,p.name);assert.throws(()=>createOrder(input(p.id)));setOrderStatus(o.id,'Cancelled');assert.equal(inventory().find(i=>i.product_id===p.id&&i.size==='M')!.stock,20);
});
test('Steadfast credentials are encrypted and never exposed in settings',()=>{
 saveCourier({apiKey:'test-api-value',secretKey:'test-secret-value',baseUrl:'https://portal.steadfast.com.bd/api/v1',autoBook:false});
 assert.equal(courierSettings().configured,true);const stored=String(db().prepare("SELECT value FROM settings WHERE key='steadfast'").get()!.value);assert.ok(!stored.includes('test-api'));assert.ok(!JSON.stringify(courierSettings()).includes('test-secret'));
 assert.throws(()=>saveCourier({apiKey:'x',secretKey:'y',baseUrl:'https://evil.example',autoBook:false}));
});
test('courier booking sends COD once, locks editing, and syncs delivery',async()=>{
 const p=saveProduct(sample()),o=createOrder(input(p.id),true);setOrderStatus(o.id,'Confirmed');let calls=0;const original=globalThis.fetch;
 globalThis.fetch=async(url,options)=>{calls++;if(String(url).endsWith('/create_order')){const payload=JSON.parse(String(options?.body));assert.equal(payload.cod_amount,3480);return Response.json({status:200,consignment:{invoice:o.id,consignment_id:123,tracking_code:'TRACK-123',status:'in_review'}});}return Response.json({status:200,delivery_status:'delivered'});};
 try{await bookCourier(o.id);assert.equal(getOrder(o.id)!.courier?.consignment_id,'123');await assert.rejects(()=>bookCourier(o.id));assert.equal(calls,1);assert.throws(()=>editOrder(o.id,{...input(p.id),version:getOrder(o.id)!.version}));await syncCourier(o.id);assert.equal(getOrder(o.id)!.status,'Delivered');}finally{globalThis.fetch=original;}
});
test('uncertain courier timeout blocks retries and edits',async()=>{
 const p=saveProduct(sample()),o=createOrder(input(p.id),true);setOrderStatus(o.id,'Confirmed');const original=globalThis.fetch;globalThis.fetch=async()=>{throw new Error('timeout');};
 try{await assert.rejects(()=>bookCourier(o.id));assert.equal(getOrder(o.id)!.courier?.state,'unknown');await assert.rejects(()=>bookCourier(o.id));assert.throws(()=>editOrder(o.id,{...input(p.id),version:getOrder(o.id)!.version}));}finally{globalThis.fetch=original;}
});
after(()=>{db().close();rmSync(dir,{recursive:true,force:true});});
