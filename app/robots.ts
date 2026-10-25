import type {MetadataRoute} from 'next';
import {getSettings} from '@/lib/store-settings';
import {siteOrigin} from '@/lib/seo';
export const dynamic='force-dynamic';
export default function robots():MetadataRoute.Robots{
 const origin=siteOrigin(),live=getSettings().storeLive;
 // Allow crawlers to read page-level noindex, including on paused stores.
 return {rules:{userAgent:'*',allow:'/',disallow:['/api/']},...(origin&&live?{sitemap:origin+'/sitemap.xml'}:{})};
}
