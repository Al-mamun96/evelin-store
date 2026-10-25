import {publicReviews} from '@/lib/reviews';
import type {MetadataRoute} from 'next';
import {getProducts} from '@/lib/products';
import {getSettings} from '@/lib/store-settings';
import {siteOrigin,isIndexable} from '@/lib/seo';
export const dynamic='force-dynamic';
export default function sitemap():MetadataRoute.Sitemap{
 const origin=siteOrigin(),settings=getSettings();if(!origin||!isIndexable(settings.storeLive))return [];
 const products=getProducts();
 const paths=['/',...(products.length?['/shop']:[]),'/about','/contact','/delivery',...(publicReviews(settings.reviews).length?['/reviews']:[]),'/privacy','/information',
 ...[...new Set(products.map(p=>p.category))].map(category=>'/shop?'+new URLSearchParams({category})),
 ...products.map(p=>'/products/'+p.id)];
 // No fabricated lastModified dates: page modification timestamps are not recorded.
 return paths.map(path=>({url:new URL(path,origin).href}));
}
