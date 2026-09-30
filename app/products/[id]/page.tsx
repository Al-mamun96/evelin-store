import {notFound} from 'next/navigation';
import Link from 'next/link';
import {getProducts} from '@/lib/products';
import {inventory} from '@/lib/db';
import {ProductDetail} from '@/components/product-detail';
import {ProductCard} from '@/components/product-card';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const products=getProducts();const {id}=await params,p=products.find(p=>p.id===id);return {title:p?.name||'Product not found',description:p?.description};}
export default async function ProductPage({params}:{params:Promise<{id:string}>}){const products=getProducts();const {id}=await params,p=products.find(p=>p.id===id);if(!p)notFound();return <section className="section detail-page"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={'/shop?category='+p.category}>{p.category}</Link><span>/</span><span>{p.name}</span></div><ProductDetail product={p} stock={inventory().filter(i=>i.product_id===id)}/><div className="related"><span className="eyebrow">COMPLETE YOUR WARDROBE</span><h2>A little more to love.</h2><div className="product-grid">{products.filter(x=>x.id!==id).slice(0,4).map(p=><ProductCard key={p.id} product={p}/>)}</div></div></section>;}
