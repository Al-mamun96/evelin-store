import {pageMetadata} from '@/lib/page-metadata';
import {Fragment} from 'react';
import {getSettings} from '@/lib/store-settings';
import {whatsappLink} from '@/lib/shared';
export function generateMetadata(){const s=getSettings();return pageMetadata('/contact',s.contactTitle,s.contactBody);}
export default function Page(){
  const s=getSettings(),chat=whatsappLink(s.whatsappNumber||s.contactPhone);
  const socials=([['Facebook',s.facebook],['Instagram',s.instagram],['TikTok',s.tiktok],['X (Twitter)',s.socialX]] as const).filter(([,href])=>href);
  return <article className="section information">
    <span className="eyebrow">GET IN TOUCH</span>
    <h1>{s.contactTitle}</h1>
    <p className="preserve-lines">{s.contactBody}</p>
    <section id="reach-us">
      <h2>Reach us</h2>
      {s.storeAddress&&<p>{s.storeAddress}</p>}
      {s.contactPhone&&<p><a href={'tel:'+s.contactPhone}>{s.contactPhone}</a></p>}
      {s.contactEmail&&<p><a href={'mailto:'+s.contactEmail}>{s.contactEmail}</a></p>}
      {chat&&<p><a href={chat} target="_blank" rel="noreferrer">Message us on WhatsApp</a></p>}
    </section>
    {socials.length>0&&<section id="follow-us"><h2>Follow us</h2><p className="account-links">{socials.map(([label,href],i)=><Fragment key={label}>{i>0&&' · '}<a href={href} target="_blank" rel="noreferrer">{label}</a></Fragment>)}</p></section>}
  </article>;
}
