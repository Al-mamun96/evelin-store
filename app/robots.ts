import type {MetadataRoute} from 'next';

import {siteOrigin} from '@/lib/seo';
export const dynamic='force-dynamic';
export default function robots():MetadataRoute.Robots{
 const origin=siteOrigin();
 // Allow crawlers to read page-level noindex, including on paused stores.
 return {rules:{userAgent:'*',allow:'/',disallow:['/api/']},...(origin?{sitemap:origin+'/sitemap.xml'}:{})};
}
