'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Search,SlidersHorizontal,X} from 'lucide-react';
import {useShop} from './shop-provider';
import {ProductCard} from './product-card';
export function Catalog({category='',query=''}:{category?:string;query?:string}){
 const {products,categories}=useShop(); const names=categories.map(c=>c.name);
 const active=category; const [search,setSearch]=useState(query),[sort,setSort]=useState('featured');
 const filtered=products.filter(p=>(!active||p.category===active)&&[p.name,p.category,p.color].join(' ').toLowerCase().includes(search.toLowerCase())).sort((a,b)=>sort==='low'?a.price-b.price:sort==='high'?b.price-a.price:0);
 return <><nav className="category-tabs" aria-label="Product categories">{['',...names].map(c=><Link className={active===c?'selected':''} aria-current={active===c?'page':undefined} href={{pathname:'/shop',query:{...(c?{category:c}:{}),...(search?{q:search}:{})}}} key={c}>{c||'All pieces'}</Link>)}</nav><div className="catalog-tools"><label className="search-field"><Search size={19}/><input aria-label="Search collection" placeholder="Find your favourite…" value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button className="icon-button" aria-label="Clear search" onClick={()=>setSearch('')}><X size={17}/></button>}</label><label className="sort-field"><SlidersHorizontal size={17}/><select aria-label="Sort products" value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div><p className="result-count">{filtered.length} considered pieces</p><div className="product-grid catalog-grid">{filtered.map(p=><ProductCard product={p} key={p.id}/>)}</div>{!filtered.length&&<div className="empty-state"><h2>No pieces found.</h2><p>Try another search or explore the full collection.</p><Link className="button" href="/shop" onClick={()=>setSearch('')}>Show all pieces</Link></div>}</>;
}
