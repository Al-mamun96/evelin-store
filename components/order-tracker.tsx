'use client';
import {useState,useId,FormEvent} from 'react';
import {ArrowRight,PackageCheck} from 'lucide-react';
import {money} from '@/lib/catalog';
type Tracked={id:string;status:string;total:number;created_at:string;zone_label:string};
function placedDate(value:string){const utc=/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)?value.replace(' ','T')+'Z':value;const date=new Date(utc);return Number.isNaN(date.getTime())?value:new Intl.DateTimeFormat('en-BD',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Dhaka'}).format(date);}
export function OrderTracker(){
 const [result,setResult]=useState<Tracked|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),hint=useId();
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;const f=new FormData(e.currentTarget);setBusy(true);setError('');setResult(null);
  try{const query=new URLSearchParams({id:String(f.get('id')||'').trim(),phone:String(f.get('phone')||'').trim()});
   const r=await fetch('/api/orders/track?'+query,{cache:'no-store',signal:AbortSignal.timeout(15000)});const data=await r.json();
   if(!r.ok)throw new Error(data.error||'Order not found.');setResult(data.order);
  }catch(err){setError(err instanceof Error&&err.name==='TimeoutError'?'This is taking a little longer. Please try again.':err instanceof Error?err.message:'Unable to find that order.');}finally{setBusy(false);}
 }
 return <form className="order-tracker" onSubmit={submit} aria-busy={busy}>
  <label>Order number<input name="id" required placeholder="EV-XXXXXXXXXX" maxLength={40} autoCapitalize="characters" spellCheck={false} autoComplete="off" aria-describedby={hint}/><small id={hint}>Find this on your order confirmation.</small></label>
  <label>Phone number<input name="phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" maxLength={20}/></label>
  <button type="submit" className="button" disabled={busy}>{busy?'Finding your order…':'Track order'}<ArrowRight size={17} aria-hidden="true"/></button>
  {error&&<p className="form-error" role="alert">{error}</p>}
  {result&&<section className="account-order-result" role="status" aria-live="polite" aria-atomic="true"><h3><PackageCheck size={18} aria-hidden="true"/>Your order at a glance</h3><dl>
   <div><dt>Order number</dt><dd>{result.id}</dd></div>
   <div><dt>Current status</dt><dd><span className="account-order-status">{result.status}</span></dd></div>
   <div><dt>Order total</dt><dd>{money(result.total)}</dd></div>
   <div><dt>Placed on</dt><dd>{placedDate(result.created_at)}</dd></div>
   {result.zone_label&&<div><dt>Delivery area</dt><dd>{result.zone_label}</dd></div>}
  </dl></section>}
 </form>;
}