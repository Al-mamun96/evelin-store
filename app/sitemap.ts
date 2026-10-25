import type {MetadataRoute} from 'next';
import {getProducts} from '@/lib/products';

export default function sitemap():MetadataRoute.Sitemap{
 const base=process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000';
 const now=new Date();
 const staticPaths=['','/shop','/about','/contact','/delivery','/reviews','/privacy'].map(path=>({url:base+path,lastModified:now,changeFrequency:(path===''?'daily':'weekly') as 'daily'|'weekly',priority:path===''?1:.7}));
 const products=getProducts().filter(product=>product.active&&!product.deleted).map(product=>({url:`${base}/products/${product.id}`,lastModified:now,changeFrequency:'weekly' as const,priority:.8}));
 return [...staticPaths,...products];
}
