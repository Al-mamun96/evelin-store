import {pageMetadata} from '@/lib/page-metadata';
import {getSettings} from '@/lib/store-settings';
export function generateMetadata(){const s=getSettings();return pageMetadata('/delivery',s.deliveryTitle,s.deliveryPolicy);}
export default function Page(){const s=getSettings();return <article className="section information"><span className="eyebrow">SHIPPING &amp; DELIVERY</span><h1>{s.deliveryTitle}</h1><p className="preserve-lines">{s.deliveryPolicy}</p><section id="zones"><h2>Delivery charges</h2>{s.zones.map(z=><p key={z.id}>{z.name}: ৳{z.fee}</p>)}</section></article>;}
