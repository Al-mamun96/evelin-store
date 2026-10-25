import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getProducts} from '@/lib/products';
import {getCategories} from '@/lib/categories';
import {getSettings} from '@/lib/store-settings';
import {pageMetadata} from '@/lib/page-metadata';
import {siteOrigin,serializeJsonLd} from '@/lib/seo';
import {catalogSummary,categoryUrl,normalizeShopParams,type ShopParams} from '@/lib/seo-content';
import {collectionSchema,breadcrumbs} from '@/lib/structured-data';
import {Catalog} from '@/components/catalog';
function collection(params:ShopParams){
 const normalized=normalizeShopParams(params),products=getProducts(),{category}=normalized;
 if(category&&!getCategories().some(c=>c.name===category)&&!products.some(p=>p.category===category))notFound();
 const selected=products.filter(p=>(!category||p.category===category)&&[p.name,p.category,p.color].join(' ').toLowerCase().includes(normalized.query.toLowerCase()));
 return {...normalized,selected,path:category?categoryUrl(category):'/shop',summary:catalogSummary(products,category)};
}
export async function generateMetadata({searchParams}:{searchParams:Promise<ShopParams>}){
 const c=collection(await searchParams),metadata=pageMetadata(c.path,c.summary.heading,c.summary.description,c.selected[0]?.image);
 if(c.noindex||!c.selected.length)metadata.robots={index:false,follow:true};return metadata;
}
export default async function Shop({searchParams}:{searchParams:Promise<ShopParams>}){
 const c=collection(await searchParams),origin=siteOrigin(),settings=getSettings();
 const trail=[{name:'Home',path:'/'},{name:'All collections',path:'/shop'},...(c.category?[{name:c.category,path:c.path}]:[])];
 const schema=origin&&!c.noindex?[collectionSchema(origin,c.path,c.summary.heading,c.summary.description,c.selected),breadcrumbs(origin,trail)]:null;
 return <section className="section shop-page">
 {schema&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(schema)}}/>}
 <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span>{c.category?<><Link href="/shop">All collections</Link><span aria-hidden="true">/</span><span aria-current="page">{c.category}</span></>:<span aria-current="page">All collections</span>}</nav>
 <div className="page-intro"><span className="eyebrow">{settings.storeName.toUpperCase()} COLLECTIONS</span><h1>{c.summary.heading}</h1><p>{c.summary.description}</p></div>
 <Catalog key={JSON.stringify([c.category,c.query])} category={c.category} query={c.query}/>
 {c.category&&c.selected.length>0&&<div className="category-guidance"><details className="detail-accordion"><summary>Which sizes and fabrics are listed?</summary><p>Listed sizes: {c.summary.sizes.join(', ')}. Availability varies by design; check the product page before ordering.</p>{c.summary.fabrics.length>0&&<p>Fabrics in this collection: {c.summary.fabrics.join(', ')}.</p>}</details><details className="detail-accordion"><summary>Where can I check delivery and returns?</summary><p><Link className="text-link" href="/delivery">Delivery policy</Link>{' · '}<Link className="text-link" href="/information#returns">Returns &amp; exchanges</Link>{' · '}<Link className="text-link" href="/contact">Ask about sizing</Link></p></details></div>}
 </section>;
}
