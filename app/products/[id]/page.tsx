import {productSchema,breadcrumbs} from '@/lib/structured-data';
import {productSummary,relatedProducts,categoryUrl} from '@/lib/seo-content';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {getProducts} from '@/lib/products';
import {getSettings} from '@/lib/store-settings';
import {inventory} from '@/lib/db';
import {pageMetadata} from '@/lib/page-metadata';
import {siteOrigin,serializeJsonLd} from '@/lib/seo';
import {ProductDetail} from '@/components/product-detail';
import {ProductCard} from '@/components/product-card';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){
 const {id}=await params,p=getProducts().find(p=>p.id===id);if(!p)notFound();
 return pageMetadata('/products/'+id,p.name,productSummary(p),p.image);
}
export default async function ProductPage({params}:{params:Promise<{id:string}>}){
 const products=getProducts(),{id}=await params,p=products.find(p=>p.id===id);if(!p)notFound();
 const stock=inventory().filter(i=>i.product_id===id),origin=siteOrigin(),settings=getSettings();
 const categoryPath=categoryUrl(p.category);
 const schema=origin?[productSchema(origin,p,stock,settings),breadcrumbs(origin,[{name:'Home',path:'/'},{name:p.category,path:categoryPath},{name:p.name,path:'/products/'+id}])]:null;
 return <section className="section detail-page">{schema&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(schema)}}/>}<nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={categoryPath}>{p.category}</Link><span>/</span><span aria-current="page">{p.name}</span></nav><ProductDetail product={p} stock={stock} storeName={settings.storeName} storeLive={settings.storeLive}/><div className="related"><span className="eyebrow">COMPLETE YOUR WARDROBE</span><h2>A little more to love.</h2><div className="product-grid">{relatedProducts(products,p).map(p=><ProductCard key={p.id} product={p}/>)}</div></div></section>;
}
