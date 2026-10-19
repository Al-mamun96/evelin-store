import {getSettings} from '@/lib/store-settings';
export const metadata={title:'Privacy Policy'};
export default function Page(){const s=getSettings();return <article className="section information"><span className="eyebrow">YOUR PRIVACY</span><h1>{s.privacyTitle}</h1><p className="preserve-lines">{s.privacyPolicy}</p></article>;}
