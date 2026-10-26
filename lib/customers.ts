import {randomBytes,randomUUID,createHash,scrypt,timingSafeEqual} from 'node:crypto';
import {z} from 'zod';
import {db,transaction} from './db.ts';

export type Customer={id:string;name:string;email:string;phone:string;address:string};
export const customerEmail=z.string().trim().toLowerCase().email().max(254);
const password=z.string().min(12,'Use at least 12 characters.').max(128,'Use at most 128 characters.');
const profile=z.object({name:z.string().trim().min(2).max(100),phone:z.string().trim().max(20).refine(v=>!v||/^(?:\+?88)?01[3-9]\d{8}$/.test(v),'Enter a Bangladesh mobile number.'),address:z.string().trim().max(500)});
export const sessionAge=7*24*60*60;
const idleAge=24*60*60;
const initialized=new WeakSet<object>();
function store(){
 const conn=db();if(!initialized.has(conn)){
  // Additive tables only. Existing products, settings, orders and stock are untouched.
  conn.exec(`CREATE TABLE IF NOT EXISTS customers(id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,name TEXT NOT NULL,password_hash TEXT NOT NULL,phone TEXT NOT NULL DEFAULT '',address TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL DEFAULT(datetime('now')));
   CREATE TABLE IF NOT EXISTS customer_sessions(token_hash TEXT PRIMARY KEY,customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,expires INTEGER NOT NULL,last_seen INTEGER NOT NULL);
   CREATE INDEX IF NOT EXISTS customer_sessions_owner ON customer_sessions(customer_id);`);
  initialized.add(conn);
 }return conn;
}
const digest=(token:string)=>createHash('sha256').update(token).digest('hex');
const derive=(value:string,salt:string)=>new Promise<Buffer>((resolve,reject)=>scrypt(value,salt,64,{N:32768,r:8,p:3,maxmem:64*1024*1024},(error,key)=>error?reject(error):resolve(key)));
async function hashPassword(value:string){const salt=randomBytes(16).toString('hex');return `scrypt$${salt}$${(await derive(value,salt)).toString('hex')}`;}
async function matches(value:string,encoded?:string){
 const parts=encoded?.split('$'),valid=parts?.[0]==='scrypt'&&/^[a-f0-9]{32}$/.test(parts[1])&&/^[a-f0-9]{128}$/.test(parts[2]);
 const actual=await derive(value,valid?parts![1]:'00000000000000000000000000000000');
 return !!valid&&timingSafeEqual(actual,Buffer.from(parts![2],'hex'));
}
function publicCustomer(id:string){return store().prepare('SELECT id,name,email,phone,address FROM customers WHERE id=?').get(id) as Customer|undefined;}
function newSession(id:string){
 const token=randomBytes(32).toString('hex'),now=Math.floor(Date.now()/1000);
 store().prepare('DELETE FROM customer_sessions WHERE expires<=? OR last_seen<=?').run(now,now-idleAge);
 store().prepare('INSERT INTO customer_sessions VALUES (?,?,?,?)').run(digest(token),id,now+sessionAge,now);
 return {token,customer:publicCustomer(id)!};
}
export function sessionCustomer(token:string|undefined){
 if(!token||!/^[a-f0-9]{64}$/.test(token))return null;
 const now=Math.floor(Date.now()/1000),key=digest(token);
 const row=store().prepare('SELECT customer_id FROM customer_sessions WHERE token_hash=? AND expires>? AND last_seen>?').get(key,now,now-idleAge);
 if(!row)return null;
 store().prepare('UPDATE customer_sessions SET last_seen=? WHERE token_hash=?').run(now,key);
 return publicCustomer(String(row.customer_id))||null;
}
export function endSession(token:string|undefined){if(token&&/^[a-f0-9]{64}$/.test(token))store().prepare('DELETE FROM customer_sessions WHERE token_hash=?').run(digest(token));}
export async function registerCustomer(raw:unknown){
 const input=z.object({name:profile.shape.name,email:customerEmail,password}).parse(raw),encoded=await hashPassword(input.password),id=randomUUID();store();
 return transaction(()=>{
  if(store().prepare('SELECT id FROM customers WHERE email=?').get(input.email))throw new Error('Unable to create this account. Try signing in or use another email.');
  store().prepare('INSERT INTO customers(id,email,name,password_hash) VALUES (?,?,?,?)').run(id,input.email,input.name,encoded);
  return newSession(id);
 });
}
export async function loginCustomer(raw:unknown){
 const input=z.object({email:customerEmail,password:z.string().min(1).max(128)}).parse(raw);
 const row=store().prepare('SELECT id,password_hash FROM customers WHERE email=?').get(input.email);
 if(!await matches(input.password,row?String(row.password_hash):undefined))throw new Error('Email or password is incorrect.');
 return transaction(()=>{
  const current=store().prepare('SELECT password_hash FROM customers WHERE id=?').get(String(row!.id));
  if(current?.password_hash!==row!.password_hash)throw new Error('Please sign in again.');
  return newSession(String(row!.id));
 });
}
export function updateCustomer(token:string|undefined,raw:unknown){
 const customer=sessionCustomer(token);if(!customer)throw new Error('Please sign in again.');
 const input=profile.parse(raw);
 store().prepare('UPDATE customers SET name=?,phone=?,address=? WHERE id=?').run(input.name,input.phone.replace(/^\+?88/,''),input.address,customer.id);
 return publicCustomer(customer.id)!;
}
export async function changeCustomerPassword(token:string|undefined,raw:unknown){
 const customer=sessionCustomer(token);if(!customer)throw new Error('Please sign in again.');
 const input=z.object({currentPassword:z.string().min(1).max(128),newPassword:password}).parse(raw);
 const row=store().prepare('SELECT password_hash FROM customers WHERE id=?').get(customer.id)!;
 if(!await matches(input.currentPassword,String(row.password_hash)))throw new Error('Current password is incorrect.');
 const encoded=await hashPassword(input.newPassword);
 return transaction(()=>{
  if(!sessionCustomer(token))throw new Error('Please sign in again.');
  const updated=store().prepare('UPDATE customers SET password_hash=? WHERE id=? AND password_hash=?').run(encoded,customer.id,String(row.password_hash));
  if(!updated.changes)throw new Error('Please sign in again.');
  store().prepare('DELETE FROM customer_sessions WHERE customer_id=?').run(customer.id);
  return newSession(customer.id);
 });
}
