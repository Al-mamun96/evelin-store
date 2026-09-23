import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

test('legacy database migration preserves orders and counts; backup includes uploads',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'evelin-migration-'));
 const path=join(dir,'store.sqlite');process.env.DATABASE_PATH=path;
 try{
  const old=new DatabaseSync(path);
  old.exec(`CREATE TABLE inventory(product_id TEXT NOT NULL,size TEXT NOT NULL,stock INTEGER NOT NULL CHECK(stock>=0),PRIMARY KEY(product_id,size));
   CREATE TABLE orders(id TEXT PRIMARY KEY,request_key TEXT UNIQUE NOT NULL,customer TEXT NOT NULL,phone TEXT NOT NULL,address TEXT NOT NULL,zone TEXT NOT NULL,note TEXT NOT NULL,items TEXT NOT NULL,subtotal INTEGER NOT NULL,delivery INTEGER NOT NULL,total INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'Pending',created_at TEXT NOT NULL DEFAULT(datetime('now')));
   INSERT INTO inventory VALUES ('ivory-panjabi','M',3);
   INSERT INTO orders(id,request_key,customer,phone,address,zone,note,items,subtotal,delivery,total) VALUES ('EV-LEGACY','old-request','Migration test','01712345678','Test address Bangladesh','dhaka','','[]',1000,80,1080);`);
  old.close();
  const {db}=await import('../lib/db.ts');const migrated=db();
  assert.equal(migrated.prepare("SELECT stock FROM inventory WHERE product_id='ivory-panjabi' AND size='M'").get()!.stock,3);
  const order=migrated.prepare("SELECT * FROM orders WHERE id='EV-LEGACY'").get()!;
  assert.equal(order.total,1080);assert.equal(order.discount,0);assert.equal(order.advance,0);assert.equal(order.version,1);assert.equal(order.source,'Website');
  mkdirSync(join(dir,'uploads'));writeFileSync(join(dir,'uploads','fixture.webp'),'immutable-test-bytes');
  const result=spawnSync(process.execPath,['scripts/backup.mjs'],{env:{...process.env,BACKUP_PATH:join(dir,'backups')},encoding:'utf8'});assert.equal(result.status,0,result.stderr);
  const snapshot=join(dir,'backups',readdirSync(join(dir,'backups'))[0]);
  assert.equal(readFileSync(join(snapshot,'uploads','fixture.webp'),'utf8'),'immutable-test-bytes');
  const restored=new DatabaseSync(join(snapshot,'evelin.sqlite'),{readOnly:true});assert.equal(restored.prepare("SELECT total FROM orders WHERE id='EV-LEGACY'").get()!.total,1080);restored.close();migrated.close();
 }finally{rmSync(dir,{recursive:true,force:true});}
});
