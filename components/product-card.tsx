import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Product,money } from '@/lib/catalog';
export function ProductCard({product:p,ctaLabel='Explore piece'}:{product:Product;ctaLabel?:string}){return <article className="product-card"><Link className="product-image" href={'/products/'+p.id}><Image src={p.image} alt={p.name+' in '+p.color} fill sizes="(max-width: 650px) 50vw, (max-width: 1000px) 33vw, 25vw"/>{p.badge&&<span className="product-badge">{p.badge}</span>}<span className="quick-view">{ctaLabel} <ArrowUpRight size={16}/></span></Link><div className="product-meta"><span>{p.category}</span><span className="color-dot" style={{background:p.hex}} title={p.color}/></div><h3><Link href={'/products/'+p.id}>{p.name}</Link></h3><span className="price">{money(p.price)}</span></article>;}
