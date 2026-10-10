'use client';
import {useState,FormEvent} from 'react';
type Tracked={id:string;status:string;total:number;created_at:string;zone_label:string};
export function OrderTracker(){
  const [result,setResult]=useState<Tracked|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);setBusy(true);setError('');setResult(null);try{const query=new URLSearchParams({id:String(f.get('id')||'').trim(),phone:String(f.get('phone')||'').trim()});const r=await fetch('/api/orders/track?'+query,{cache:'no-store'});const data=await r.json();if(!r.ok)throw new Error(data.error||'Order not found.');setResult(data.order);}catch(err){setError(err instanceof Error?err.message:'Unable to find that order.');}finally{setBusy(false);}}
  return <form className="order-tracker" onSubmit={submit}><label>Order number<input name="id" required placeholder="EV-XXXXXXXXXX" maxLength={40}/></label><label>Phone number<input name="phone" required type="tel" placeholder="01XXXXXXXXX" maxLength={20}/></label><button className="button" disabled={busy}>{busy?'Checking…':'Track order'}</button>{error&&<p className="form-error" role="alert">{error}</p>}{result&&<div className="track-result"><div><span>Order</span><strong>{result.id}</strong></div><div><span>Status</span><strong>{result.status}</strong></div><div><span>Total</span><strong>৳ {result.total}</strong></div><div><span>Placed</span><strong>{result.created_at} UTC</strong></div></div>}</form>;
}
