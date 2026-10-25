import {getProducts} from '@/lib/products';
import {pageMetadata} from '@/lib/page-metadata';
import {Catalog} from '@/components/catalog';
export async function generateMetadata({searchParams}:{searchParams:Promise<{category?:string;q?:string}>}){
 const params=await searchParams;
 const category=typeof params.category==='string'?params.category:undefined;
 const valid=!!category&&getProducts().some(p=>p.category===category);
 const path=valid?'/shop?'+new URLSearchParams({category:category!}):'/shop';
 const metadata=pageMetadata(path,valid?category+' Collection':'Shop the Collection','Quiet classics. Modern silhouettes. Find the piece that feels like you.');
 if(params.q||(category&&!valid))metadata.robots={index:false,follow:true};
 return metadata;
}
export default async function Shop({searchParams}:{searchParams:Promise<{category?:string;q?:string}>}){const params=await searchParams;return <section className="section shop-page"><div className="page-intro"><span className="eyebrow">THE EVELIN WARDROBE</span><h1>Made to be <em>yours.</em></h1><p>Quiet classics. Modern silhouettes. Find the piece that feels like you.</p></div><Catalog key={(params.category||'')+(params.q||'')} category={params.category} query={params.q}/></section>;}
