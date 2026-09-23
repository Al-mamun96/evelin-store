'use client';
import {useState} from 'react';
import {Search,SlidersHorizontal,X} from 'lucide-react';
import {useShop} from './shop-provider';
import {ProductCard} from './product-card';
export function Catalog({category='',query=''}:{category?:string;query?:string}){
 const {products}=useShop(); const categories=[...new Set(products.map(p=>p.category))];
 const [active,setActive]=useState(category),[search,setSearch]=useState(query),[sort,setSort]=useState('featured');
 const filtered=products.filter(p=>(!active||p.category===active)&&[p.name,p.category,p.color].join(' ').toLowerCase().includes(search.toLowerCase())).sort((a,b)=>sort==='low'?a.price-b.price:sort==='high'?b.price-a.price:0);
 return <><div className="category-tabs" aria-label="Product categories">{['',...categories].map(c=><button className={active===c?'selected':''} aria-pressed={active===c} onClick={()=>setActive(c)} key={c}>{c||'All pieces'}</button>)}</div><div className="catalog-tools"><label className="search-field"><Search size={19}/><input aria-label="Search collection" placeholder="Find your favourite…" value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button className="icon-button" aria-label="Clear search" onClick={()=>setSearch('')}><X size={17}/></button>}</label><label className="sort-field"><SlidersHorizontal size={17}/><select aria-label="Sort products" value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div><p className="result-count">{filtered.length} considered pieces</p><div className="product-grid catalog-grid">{filtered.map(p=><ProductCard product={p} key={p.id}/>)}</div>{!filtered.length&&<div className="empty-state"><h2>No pieces found.</h2><p>Try another search or explore the full collection.</p><button className="button" onClick={()=>{setSearch('');setActive('');}}>Show all pieces</button></div>}</>;
}
