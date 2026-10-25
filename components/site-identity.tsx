import {getSettings} from '@/lib/store-settings';
import {siteOrigin,serializeJsonLd} from '@/lib/seo';
import {businessGraph} from '@/lib/structured-data';
export function SiteIdentity({path='/',title}:{path?:string;title?:string}){
 const origin=siteOrigin();if(!origin)return null;
 const settings=getSettings();
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(businessGraph(origin,settings,path,title))}}/>;
}
