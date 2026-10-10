import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { products, categories } from './catalog.ts';
let instance: DatabaseSync | undefined;
export function db() {
  if (instance) return instance;
  const path = process.env.DATABASE_PATH || './data/evelin.sqlite';
  mkdirSync(dirname(path), { recursive: true });
  instance = new DatabaseSync(path);
  instance.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS inventory (product_id TEXT NOT NULL, size TEXT NOT NULL, stock INTEGER NOT NULL CHECK(stock>=0), PRIMARY KEY(product_id,size));
    CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, request_key TEXT UNIQUE NOT NULL, customer TEXT NOT NULL, phone TEXT NOT NULL, address TEXT NOT NULL, zone TEXT NOT NULL, note TEXT NOT NULL, items TEXT NOT NULL, subtotal INTEGER NOT NULL, delivery INTEGER NOT NULL, total INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'Pending', created_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);`);
  instance.exec(`CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, data TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, deleted INTEGER NOT NULL DEFAULT 0, version INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS stock_log (id INTEGER PRIMARY KEY, product_id TEXT NOT NULL, size TEXT NOT NULL, delta INTEGER NOT NULL, balance INTEGER NOT NULL, reason TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS activity (id INTEGER PRIMARY KEY, action TEXT NOT NULL, target TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS courier (order_id TEXT PRIMARY KEY, state TEXT NOT NULL, consignment_id TEXT, tracking_code TEXT, delivery_status TEXT, message TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT (datetime('now')));`);
  instance.exec('CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT NOT NULL, sort INTEGER NOT NULL DEFAULT 0, version INTEGER NOT NULL DEFAULT 1);');
  const columns = instance.prepare('PRAGMA table_info(orders)').all().map(row=>row.name);
  for (const [name,definition] of [['version','INTEGER NOT NULL DEFAULT 1'],['discount','INTEGER NOT NULL DEFAULT 0'],['advance','INTEGER NOT NULL DEFAULT 0'],['zone_label',"TEXT NOT NULL DEFAULT ''"],['source',"TEXT NOT NULL DEFAULT 'Website'"]]) {
    if(!columns.includes(name)) instance.exec(`ALTER TABLE orders ADD COLUMN ${name} ${definition}`);
  }
  instance.exec('BEGIN IMMEDIATE');
  try {
    if(!instance.prepare("SELECT 1 FROM settings WHERE key='catalog_seeded'").get()) {
      const insert = instance.prepare('INSERT OR IGNORE INTO inventory VALUES (?,?,?)');
      for (const product of products) {
        instance.prepare('INSERT OR IGNORE INTO products (id,data) VALUES (?,?)').run(product.id,JSON.stringify(product));
        for (const size of product.sizes) insert.run(product.id,size,10);
      }
      instance.prepare("INSERT INTO settings VALUES ('catalog_seeded','true')").run();
    }
    if(!instance.prepare("SELECT 1 FROM settings WHERE key='categories_seeded'").get()) {
      const insertCategory = instance.prepare('INSERT OR IGNORE INTO categories (id,name,sort) VALUES (?,?,?)');
      categories.forEach((name,index)=>insertCategory.run(name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'category-'+index,name,index));
      instance.prepare("INSERT INTO settings VALUES ('categories_seeded','true')").run();
    }
    instance.exec('COMMIT');
  }catch(error){instance.exec('ROLLBACK');throw error;}
  return instance;
}
export function inventory() { return db().prepare('SELECT * FROM inventory').all().map(row=>({...row})) as unknown as {product_id:string;size:string;stock:number}[]; }
export function rateLimit(key: string, max: number, seconds: number) {
  const now = Math.floor(Date.now()/1000);
  db().prepare('DELETE FROM limits WHERE expires < ?').run(now);
  const row = db().prepare('INSERT INTO limits VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').get(key,now+seconds) as {count:number};
  return row.count <= max;
}
export function transaction<T>(work:()=>T):T {const conn=db();conn.exec('BEGIN IMMEDIATE');try{const result=work();conn.exec('COMMIT');return result;}catch(error){conn.exec('ROLLBACK');throw error;}}
export function audit(action:string,target:string,detail=''){db().prepare('INSERT INTO activity(action,target,detail) VALUES (?,?,?)').run(action,target,detail);}
export function changeStock(id:string,size:string,delta:number,reason:string){
  const row=db().prepare('UPDATE inventory SET stock=stock+? WHERE product_id=? AND size=? AND stock+?>=0 RETURNING stock').get(delta,id,size,delta);
  if(!row)throw new Error(`Not enough stock for ${id}, size ${size}. Refresh stock and try again.`);
  if(delta)db().prepare('INSERT INTO stock_log(product_id,size,delta,balance,reason) VALUES (?,?,?,?,?)').run(id,size,delta,Number(row.stock),reason);
}
