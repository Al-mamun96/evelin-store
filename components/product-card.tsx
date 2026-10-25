'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Product,money } from '@/lib/catalog';
import { useQuickView } from './quick-view';
export function ProductCard({product:p}:{product:Product}){
 const {open}=useQuickView();
 return <article className="product-card"><div className="product-image"><Link href={'/products/'+p.id} aria-label={p.name+(p.badge?' — '+p.badge:'')}><Image src={p.image} alt={p.name+' in '+p.color} fill sizes="(max-width: 650px) 50vw, (max-width: 1000px) 33vw, 25vw"/>{p.badge&&<span className="product-badge">{p.badge}</span>}</Link><button type="button" className="quick-view" onClick={()=>open(p)}>Quick view <ArrowUpRight size={16}/></button></div><div className="product-meta"><span>{p.category}</span><span className="color-dot" style={{background:p.hex}} title={p.color}/></div><h3><Link href={'/products/'+p.id}>{p.name}</Link></h3><span className="price">{money(p.price)}</span></article>;
}
