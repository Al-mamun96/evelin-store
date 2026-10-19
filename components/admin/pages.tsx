'use client';
import {useState,FormEvent} from 'react';
import {ExternalLink} from 'lucide-react';
import type {StoreSettings} from '@/lib/store-settings';
import type {Mutate} from './types';
/**
 * Editor for the dedicated content pages (About / Contact / Reviews titles and
 * intros). The Privacy and Delivery policy bodies reuse the fields already
 * edited under Store settings, so a hint points there instead of duplicating
 * the same input in two tabs.
 */
export function PagesEditor({settings,mutate,busy}:{settings:StoreSettings;mutate:Mutate;busy:boolean}){
  const [value,setValue]=useState(settings);
  const field=(name:keyof StoreSettings)=>({value:String(value[name]),onChange:(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>setValue({...value,[name]:e.target.value})});
  async function submit(e:FormEvent){e.preventDefault();await mutate('/api/admin/settings',value,'PUT','Saved. Your storefront now uses these settings.');}
  return <form onSubmit={submit} className="studio-form"><div className="studio-section-head"><div><h2>Content pages</h2><p>About, Contact, Privacy, Delivery ও Reviews পেজের লেখা এখান থেকে বদলান।</p></div><div className="row-actions"><a href="/" target="_blank" rel="noreferrer" className="studio-secondary">View store <ExternalLink size={16}/></a><button className="studio-primary" disabled={busy}>{busy?'Saving…':'Save changes'}</button></div></div><div className="editor-columns"><div><section className="studio-card"><h3>About Us page</h3><label>Page title<input maxLength={180} {...field('aboutTitle')}/></label><label>About text<textarea rows={8} maxLength={5000} {...field('aboutBody')}/><small>নতুন লাইন দিতে Enter চাপুন।</small></label></section><section className="studio-card"><h3>Contact Us page</h3><label>Page title<input maxLength={180} {...field('contactTitle')}/></label><label>Intro text<textarea rows={4} maxLength={5000} {...field('contactBody')}/></label><p className="studio-hint">ফোন, ইমেইল, ঠিকানা ও সোশ্যাল লিংক Store settings ট্যাব থেকে বদলান।</p></section></div><div><section className="studio-card"><h3>Privacy &amp; Delivery pages</h3><label>Privacy page title<input maxLength={180} {...field('privacyTitle')}/></label><label>Delivery page title<input maxLength={180} {...field('deliveryTitle')}/></label><p className="studio-hint">Privacy ও Delivery-এর মূল লেখা (policy) Store settings ট্যাবে সম্পাদনা করুন।</p></section><section className="studio-card"><h3>Reviews page</h3><label>Page title<input maxLength={180} {...field('reviewsTitle')}/></label><label>Intro text<textarea rows={3} maxLength={5000} {...field('reviewsBody')}/></label><p className="studio-hint">কাস্টমার রিভিউগুলো Store settings ট্যাবে যোগ বা মুছুন।</p></section></div></div></form>;
}
