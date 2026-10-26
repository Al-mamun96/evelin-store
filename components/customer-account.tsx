'use client';
import {useEffect,useId,useState,type FormEvent} from 'react';
import Link from 'next/link';
import {ArrowRight,Eye,EyeOff,LockKeyhole,LogOut,UserRound,ShieldCheck} from 'lucide-react';
import type {Customer} from '@/lib/customers';

function PasswordField({name,label,autoComplete,minLength}:{name:string;label:string;autoComplete:string;minLength?:number}){
 const [visible,setVisible]=useState(false),id=useId();
 return <div className="customer-password-field"><label htmlFor={id}>{label}</label><div><input id={id} name={name} type={visible?'text':'password'} required minLength={minLength} maxLength={128} autoComplete={autoComplete}/><button type="button" aria-label={(visible?'Hide ':'Show ')+label.toLowerCase()} aria-controls={id} aria-pressed={visible} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></div>;
}
export function CustomerAccount({storeName}:{storeName:string}){
 const [customer,setCustomer]=useState<Customer|null>(null),[loading,setLoading]=useState(true),[mode,setMode]=useState<'login'|'register'>('login'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 useEffect(()=>{const controller=new AbortController();fetch('/api/customer',{cache:'no-store',signal:controller.signal}).then(async r=>{if(!r.ok)throw new Error();const data=await r.json();setCustomer(data.customer);}).catch(()=>{if(!controller.signal.aborted)setError('Could not load your account. Refresh to try again.');}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();},[]);
 async function act(action:string,form?:HTMLFormElement){
  if(busy)return;setBusy(true);setError('');setMessage('');
  const values=form?Object.fromEntries(new FormData(form)):{};
  if(action==='register'&&values.password!==values.confirmPassword){setError('Passwords do not match.');setBusy(false);return;}
  try{
   const response=await fetch('/api/customer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,action}),signal:AbortSignal.timeout(20000)});
   const data=await response.json();if(!response.ok){if(response.status===401)setCustomer(null);throw new Error(data.error||'Please try again.');}
   setCustomer(action==='logout'?null:data.customer);form?.reset();
   setMessage(action==='profile'?'Your profile has been saved.':action==='password'?'Password updated. Other devices have been signed out.':action==='logout'?'You have been signed out.':action==='register'?'Your account is ready. Welcome to '+storeName+'.':'Welcome back.');
  }catch(err){setError(err instanceof Error&&err.name==='TimeoutError'?'Connection timed out. Please try again.':err instanceof Error?err.message:'Unable to connect. Please try again.');}finally{setBusy(false);}
 }
 const submit=(action:string)=>(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();void act(action,e.currentTarget);};
 return <>
  <header className="account-welcome">
   <div className="account-welcome-top"><span className="eyebrow">YOUR {storeName.toUpperCase()}</span><span className="account-guest"><UserRound size={14} aria-hidden="true"/>{loading?'Your space':customer?'My account':'Welcome'}</span></div>
   <div className="account-welcome-body"><div><h1>{customer?<>Hello, <em>{customer.name.split(' ')[0]}.</em></>:<>A little space.<br/><em>Just for you.</em></>}</h1><p>{customer?'Your details, your shopping bag, and your next favourite. Make yourself at home.':'Sign in to your own little corner of '+storeName+'. Or create an account in a moment.'}</p></div><span className="account-monogram" aria-hidden="true">{(customer?.name||storeName).charAt(0).toUpperCase()}</span></div>
   <div className="account-welcome-note"><ShieldCheck size={17} aria-hidden="true"/><span>{customer?'Your profile is private. Only you can view and update it.':'Guest checkout and order tracking are always available below.'}</span></div>
  </header>
  <section className="customer-account-panel" aria-label="Customer account" aria-busy={busy||loading}>
   {error&&<p className="form-error" role="alert">{error}</p>}{message&&<p className="customer-message" role="status">{message}</p>}
   {loading?<p role="status">Opening your space…</p>:!customer?<>
    <div className="customer-mode" role="group" aria-label="Account access"><button type="button" aria-pressed={mode==='login'} disabled={busy} onClick={()=>{setMode('login');setError('');setMessage('');}}>Sign in</button><button type="button" aria-pressed={mode==='register'} disabled={busy} onClick={()=>{setMode('register');setError('');setMessage('');}}>Create account</button></div>
    <form key={mode} className="customer-form" aria-label={mode==='login'?'Sign in':'Create account'} onSubmit={submit(mode)}>
     <div className="customer-form-title"><span className="account-icon"><LockKeyhole size={22}/></span><div><h2>{mode==='login'?'Good to see you.':'Make it yours.'}</h2><p>{mode==='login'?'Enter your email and password to continue.':'Just your name, email and a strong password.'}</p></div></div>
     <fieldset disabled={busy}>
      {mode==='register'&&<label>Full name<input name="name" required minLength={2} maxLength={100} autoComplete="name"/></label>}
      <label>Email address<input name="email" type="email" required maxLength={254} autoComplete="username" autoCapitalize="none" spellCheck={false}/></label>
      <PasswordField name="password" label="Password" autoComplete={mode==='login'?'current-password':'new-password'} minLength={mode==='register'?12:undefined}/>
      {mode==='register'&&<><small className="customer-hint">Use 12–128 characters. A few memorable words work well.</small><PasswordField name="confirmPassword" label="Confirm password" autoComplete="new-password" minLength={12}/></>}
      <button className="button" type="submit">{busy?'Please wait…':mode==='login'?'Sign in':'Create my account'}<ArrowRight size={17}/></button>
     </fieldset>
     <p className="customer-hint">Your details are handled under our <Link href="/privacy">privacy policy</Link>. You can also <a href="#track-order">track an order without signing in</a>.</p>
    </form>
   </>:<>
    <div className="customer-profile-heading"><div><span className="eyebrow">THE DETAILS THAT MATTER</span><h2>Your profile.</h2></div><button className="customer-signout" type="button" disabled={busy} onClick={()=>void act('logout')}><LogOut size={16}/> Sign out</button></div>
    <form className="customer-form" aria-label="Edit profile" onSubmit={submit('profile')} key={customer.id+customer.name+customer.phone+customer.address}>
     <fieldset disabled={busy}>
      <div className="customer-form-grid"><label>Full name<input name="name" defaultValue={customer.name} required minLength={2} maxLength={100} autoComplete="name"/></label><label>Email address<input value={customer.email} readOnly type="email" autoComplete="email"/></label><label>Mobile number<input name="phone" defaultValue={customer.phone} type="tel" inputMode="tel" maxLength={20} autoComplete="tel" placeholder="01XXXXXXXXX"/></label></div>
      <label>Delivery address <small>(optional)</small><textarea name="address" defaultValue={customer.address} rows={3} maxLength={500} autoComplete="street-address" placeholder="House, road, area and district"/></label>
      <button className="button" type="submit">{busy?'Saving…':'Save profile'}<ArrowRight size={17}/></button>
     </fieldset>
     <p className="customer-hint">Your email is your sign-in ID and cannot be changed here. Always confirm your delivery details at checkout.</p>
    </form>
    <details className="customer-security"><summary><LockKeyhole size={17}/> Change password</summary><form className="customer-form" aria-label="Change password" onSubmit={submit('password')}><fieldset disabled={busy}><PasswordField name="currentPassword" label="Current password" autoComplete="current-password"/><PasswordField name="newPassword" label="New password" autoComplete="new-password" minLength={12}/><small className="customer-hint">At least 12 characters. Changing it signs out your other devices.</small><button className="button" type="submit">{busy?'Updating…':'Update password'}</button></fieldset></form></details>
   </>}
  </section>
 </>;
}
