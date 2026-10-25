import {notFound} from 'next/navigation';
import Link from 'next/link';
import {getProducts} from '@/lib/products';
import {getSettings} from '@/lib/store-settings';
import {inventory} from '@/lib/db';
import {pageMetadata} from '@/lib/page-metadata';
import {siteOrigin,serializeJsonLd,hasAvailableSize} from '@/lib/seo';
import {ProductDetail} from '@/components/product-detail';
import {ProductCard} from '@/components/product-card';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){
 const {id}=await params,p=getProducts().find(p=>p.id===id);if(!p)notFound();
 return pageMetadata('/products/'+id,p.name,p.description,p.image);
}
export default async function ProductPage({params}:{params:Promise<{id:string}>}){
 const products=getProducts(),{id}=await params,p=products.find(p=>p.id===id);if(!p)notFound();
 const stock=inventory().filter(i=>i.product_id===id),origin=siteOrigin(),settings=getSettings();
 const categoryPath='/shop?'+new URLSearchParams({category:p.category});
 const schema=origin?[
 {'@context':'https://schema.org','@type':'Product',name:p.name,description:p.description,
 image:[...new Set([p.image,...(p.gallery||[])])].map(image=>new URL(image,origin).href),
 ...(settings.storeLive?{offers:{'@type':'Offer',url:origin+'/products/'+id,priceCurrency:'BDT',price:p.price,
 availability:'https://schema.org/'+(hasAvailableSize(p.sizes,stock)?'InStock':'OutOfStock')}}:{})},
 {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[
 {'@type':'ListItem',position:1,name:'Home',item:origin+'/'},
 {'@type':'ListItem',position:2,name:p.category,item:origin+categoryPath},
 {'@type':'ListItem',position:3,name:p.name,item:origin+'/products/'+id}]}
 ]:null;
 return <section className="section detail-page">{schema&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(schema)}}/>}<div className="breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={categoryPath}>{p.category}</Link><span>/</span><span>{p.name}</span></div><ProductDetail product={p} stock={stock}/><div className="related"><span className="eyebrow">COMPLETE YOUR WARDROBE</span><h2>A little more to love.</h2><div className="product-grid">{products.filter(x=>x.id!==id).slice(0,4).map(p=><ProductCard key={p.id} product={p}/>)}</div></div></section>;
}
