import {randomBytes} from 'node:crypto';
import {z} from 'zod';
import type {Product} from './catalog.ts';
import {db,transaction,audit,changeStock} from './db.ts';
import {imagePath} from './store-settings.ts';
export const productSchema=z.object({
 id:z.string().regex(/^[a-z0-9-]{1,100}$/).optional(),name:z.string().trim().min(2).max(120),category:z.string().trim().min(1).max(50),price:z.number().int().min(1).max(1000000),image:imagePath,color:z.string().trim().min(1).max(50),hex:z.string().regex(/^#[0-9a-fA-F]{6}$/),description:z.string().trim().min(5).max(4000),fabric:z.string().trim().max(200),sizes:z.array(z.string().trim().min(1).max(20)).min(1).max(40).refine(s=>new Set(s).size===s.length,'Sizes must be unique.'),badge:z.string().trim().max(30).default(''),sizeGuide:z.string().trim().max(3000).default(''),active:z.boolean(),version:z.number().int().min(1).optional(),initialStock:z.number().int().min(0).max(100000).default(0)
});
function hydrate(row:Record<string,unknown>):Product{return {...JSON.parse(String(row.data)),id:String(row.id),active:!!row.active,deleted:!!row.deleted,version:Number(row.version)};}
export function getProducts(mode:'public'|'admin'|'all'='public'):Product[]{return db().prepare('SELECT * FROM products '+(mode==='public'?'WHERE deleted=0 AND active=1':mode==='admin'?'WHERE deleted=0':'')+' ORDER BY rowid DESC').all().map(hydrate);}
export function getProduct(id:string):Product|undefined{const row=db().prepare('SELECT * FROM products WHERE id=?').get(id);return row?hydrate(row):undefined;}
export function saveProduct(raw:unknown){const input=productSchema.parse(raw);return transaction(()=>{
 const previous=input.id?getProduct(input.id):undefined;
 if(input.id&&(!previous||previous.deleted))throw new Error('Product not found.');
 if(previous&&input.version!==previous.version)throw new Error('Product changed in another tab. Refresh before saving.');
 const id=previous?.id||((input.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,65)||'product')+'-'+randomBytes(3).toString('hex'));
 const {initialStock,version,...fields}=input;
 const product={...fields,id,version:(previous?.version||0)+1};
 db().prepare('INSERT INTO products (id,data,active,version) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,active=excluded.active,version=excluded.version').run(id,JSON.stringify(product),Number(input.active),product.version);
 for(const size of input.sizes){const exists=db().prepare('SELECT 1 FROM inventory WHERE product_id=? AND size=?').get(id,size);if(!exists){db().prepare('INSERT INTO inventory VALUES (?,?,0)').run(id,size);changeStock(id,size,initialStock,'Initial stock');}}
 // Retain removed variants for historical order refunds; they are no longer sellable.
 audit(previous?'Product edited':'Product created',id,input.name);return getProduct(id)!;
});}
export function archiveProduct(id:string,version:number,restore=false){return transaction(()=>{const product=getProduct(id);if(!product)throw new Error('Product not found');if(product.version!==version)throw new Error('Product changed. Refresh and try again.');db().prepare('UPDATE products SET deleted=?,active=?,version=version+1 WHERE id=?').run(restore?0:1,0,id);audit(restore?'Product restored as draft':'Product deleted',id,product.name);});}
export function adjustStock(raw:unknown){const input=z.object({id:z.string(),size:z.string(),stock:z.number().int().min(0).max(100000),expectedStock:z.number().int().min(0),reason:z.string().trim().min(2).max(200)}).parse(raw);return transaction(()=>{const product=getProduct(input.id);if(!product||product.deleted||!product.sizes.includes(input.size))throw new Error('Active product variant not found.');const row=db().prepare('SELECT stock FROM inventory WHERE product_id=? AND size=?').get(input.id,input.size);if(!row||row.stock!==input.expectedStock)throw new Error('Stock changed after you opened this page. Refresh before updating.');changeStock(input.id,input.size,input.stock-Number(row.stock),input.reason);audit('Stock adjusted',input.id,input.size+': '+input.reason);});}
