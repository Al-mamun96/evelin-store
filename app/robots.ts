import type {MetadataRoute} from 'next';

export default function robots():MetadataRoute.Robots{
 const base=process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000';
 const live=process.env.STORE_LIVE==='true';
 return {rules:{userAgent:'*',allow:live?'/':[],disallow:live?['/admin','/api/','/account','/cart','/checkout']:'/'},sitemap:`${base}/sitemap.xml`};
}
