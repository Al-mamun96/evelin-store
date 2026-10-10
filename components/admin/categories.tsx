'use client';
import {useState,FormEvent} from 'react';
import {Plus,Trash2} from 'lucide-react';
import type {AdminData,Mutate} from './types';
/**
 * Manage the product categories that drive the storefront sidebar menu, the
 * shop filter tabs and the product editor's category picker.
 */
export function CategoryManager({data,mutate,busy}:{data:AdminData;mutate:Mutate;busy:boolean}){
  const [name,setName]=useState('');
  async function add(e:FormEvent){e.preventDefault();const value=name.trim();if(!value)return;const result=await mutate('/api/admin/categories',{name:value},'POST','Category added. It now appears in your storefront menu.');if(result)setName('');}
  return <><div className="studio-section-head"><div><h2>Categories</h2><p>Sidebar মেনু ও product-এর category এখান থেকে যোগ বা মুছে ফেলুন।</p></div></div><form className="studio-card studio-form" onSubmit={add}><h3>Add a category</h3><label>Category name<input required maxLength={50} value={name} onChange={e=>setName(e.target.value)} placeholder="Panjabi, Jubba, Abaya…"/></label><p className="studio-hint">নতুন নাম যোগ করলে storefront menu, shop filter ও product editor-এ দেখা যাবে।</p><button className="studio-primary" disabled={busy||!name.trim()}><Plus size={18}/> Add category</button></form><div className="studio-product-list">{data.categories.map(c=><article key={c.id}><div className="product-list-main"><strong>{c.name}</strong><p>Products in this category appear under “{c.name}”.</p></div><div className="row-actions"><button className="studio-icon danger" disabled={busy} aria-label={'Delete '+c.name} onClick={()=>{if(confirm('Remove the '+c.name+' category? Any products still using it must be moved first.'))mutate('/api/admin/categories',{id:c.id,version:c.version},'DELETE','Category removed from your storefront menu.');}}><Trash2 size={18}/></button></div></article>)}</div>{!data.categories.length&&<div className="studio-empty">No categories yet. Add your first category above.</div>}</>;
}
