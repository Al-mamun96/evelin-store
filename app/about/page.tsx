import {pageMetadata} from '@/lib/page-metadata';
import {getSettings} from '@/lib/store-settings';
export function generateMetadata(){const s=getSettings();return pageMetadata('/about',s.aboutTitle,s.aboutBody);}
export default function Page(){const s=getSettings();return <article className="section information"><span className="eyebrow">OUR STORY</span><h1>{s.aboutTitle}</h1>{!s.storeLive&&<p className="preview-notice">Orders are currently paused.</p>}<p className="preserve-lines">{s.aboutBody}</p></article>;}
