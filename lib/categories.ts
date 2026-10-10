import {randomBytes} from 'node:crypto';
import {z} from 'zod';
import {db,transaction,audit} from './db.ts';
import {getProducts} from './products.ts';

export type Category={id:string;name:string;version:number};

const categorySchema=z.object({name:z.string().trim().min(1).max(50)});

export function getCategories():Category[]{
  return db().prepare('SELECT id,name,version FROM categories ORDER BY sort,rowid').all().map(row=>({id:String(row.id),name:String(row.name),version:Number(row.version)}));
}

export function saveCategory(raw:unknown){
  const input=categorySchema.parse(raw);
  return transaction(()=>{
    if(db().prepare('SELECT 1 FROM categories WHERE lower(name)=lower(?)').get(input.name))throw new Error('A category with this name already exists.');
    const base=input.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'category';
    const id=db().prepare('SELECT 1 FROM categories WHERE id=?').get(base)?base+'-'+randomBytes(2).toString('hex'):base;
    const sort=Number((db().prepare('SELECT COALESCE(MAX(sort),-1)+1 AS n FROM categories').get() as {n:number}).n);
    db().prepare('INSERT INTO categories (id,name,sort) VALUES (?,?,?)').run(id,input.name,sort);
    audit('Category added',input.name);
    return getCategories().find(c=>c.id===id)!;
  });
}

export function deleteCategory(id:string,version:number){
  return transaction(()=>{
    const row=db().prepare('SELECT id,name,version FROM categories WHERE id=?').get(id) as {id:string;name:string;version:number}|undefined;
    if(!row)throw new Error('Category not found.');
    if(Number(row.version)!==version)throw new Error('Category changed. Refresh and try again.');
    if(getProducts('all').some(p=>!p.deleted&&p.category===row.name))throw new Error('Move the products in this category to another category before removing it.');
    db().prepare('DELETE FROM categories WHERE id=?').run(id);
    audit('Category removed',row.name);
  });
}
