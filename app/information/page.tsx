import {pageMetadata} from '@/lib/page-metadata';
import {Fragment} from 'react';
import Link from 'next/link';
import {getSettings} from '@/lib/store-settings';
export function generateMetadata(){const s=getSettings();return pageMetadata('/information','Store Information',s.returnsPolicy);}
export default function Page(){const s=getSettings();return <article className="section information"><span className="eyebrow">HERE TO HELP</span><h1>A few useful <em>details.</em></h1>{!s.storeLive&&<p className="preview-notice">Orders are currently paused.</p>}<section id="pages"><h2>Find what you need</h2><p className="account-links">{([['About us','/about'],['Delivery','/delivery'],['Contact','/contact'],['Privacy','/privacy'],['Customer reviews','/reviews']] as const).map(([label,href],i)=><Fragment key={href}>{i>0&&' · '}<Link href={href}>{label}</Link></Fragment>)}</p></section><section id="returns"><h2>Returns & exchanges</h2><p className="preserve-lines">{s.returnsPolicy}</p></section><section id="care"><h2>Garment care</h2><p>Follow the care label. Wash gently with similar colours and avoid bleach.</p></section></article>;}
