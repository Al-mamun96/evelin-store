import Link from 'next/link';
import {ArrowUpRight,ArrowRight,UserRound,PackageSearch,ShoppingBag,MessageCircle,Truck,RotateCcw,ShieldCheck} from 'lucide-react';
import type {StoreSettings} from '@/lib/store-settings';

import {OrderTracker} from './order-tracker';

export function AccountHub({settings:s}:{settings:StoreSettings}){

 return <section className="section account-hub">
  <header className="account-welcome">
   <div className="account-welcome-top"><span className="eyebrow">YOUR {s.storeName.toUpperCase()}</span><span className="account-guest"><UserRound size={14} aria-hidden="true"/> Guest access</span></div>
   <div className="account-welcome-body"><div><h1>A little space.<br/><em>Just for you.</em></h1><p>Your orders, your next favourites, and a helping hand. All in one place.</p></div><span className="account-monogram" aria-hidden="true">{s.storeName.charAt(0).toUpperCase()}</span></div>
   <div className="account-welcome-note"><ShieldCheck size={17} aria-hidden="true"/><span>No password needed. Find your order using your checkout details.</span></div>
  </header>
  <nav className="account-shortcuts" aria-label="Account shortcuts">
   <a href="#track-order"><PackageSearch size={22} aria-hidden="true"/><span>Track order<small>See its latest status</small></span><ArrowUpRight size={16} aria-hidden="true"/></a>
   <Link href="/cart"><ShoppingBag size={22} aria-hidden="true"/><span>Shopping bag<small>Your selected pieces</small></span><ArrowUpRight size={16} aria-hidden="true"/></Link>
   <Link href="/shop"><ShoppingBag size={22} aria-hidden="true"/><span>Explore<small>Find your next piece</small></span><ArrowUpRight size={16} aria-hidden="true"/></Link>
  </nav>
  <div className="account-hub-grid">
   <section id="track-order" className="account-panel" aria-labelledby="track-heading">
    <div className="account-panel-heading"><span className="account-icon"><PackageSearch size={24} aria-hidden="true"/></span><div><span className="eyebrow">FROM OUR STORE TO YOU</span><h2 id="track-heading">Follow your order.</h2></div></div>
    <p className="account-panel-description">Enter your order number and the phone number you used at checkout.</p>
    <OrderTracker/>
    <div className="account-form-note"><ShieldCheck size={16} aria-hidden="true"/><p>Both details must match before we show your order status.</p></div>
   </section>
   <aside className="account-help-stack" id="account-help">
    <section className="account-panel account-bag" aria-labelledby="bag-heading"><span className="account-icon"><ShoppingBag size={24} aria-hidden="true"/></span><span className="eyebrow">YOUR SELECTED PIECES</span><h2 id="bag-heading">Your shopping bag.</h2><p>Take another look at your selected pieces, check quantities, and continue to checkout when you are ready.</p><Link className="button" href="/cart">Open shopping bag <ArrowRight size={17} aria-hidden="true"/></Link><Link className="account-browse" href="/shop">Keep exploring <ArrowUpRight size={15} aria-hidden="true"/></Link></section>
    <Link className="account-help-link" href="/contact"><MessageCircle size={17} aria-hidden="true"/><span>Need help?</span><ArrowUpRight size={16} aria-hidden="true"/></Link>
    <nav className="account-policy-links" aria-label="Shopping information">
     <Link href="/delivery"><Truck size={19} aria-hidden="true"/><span>Delivery information</span><ArrowUpRight size={16} aria-hidden="true"/></Link>
     <Link href="/information#returns"><RotateCcw size={19} aria-hidden="true"/><span>Returns &amp; exchanges</span><ArrowUpRight size={16} aria-hidden="true"/></Link>
     <Link href="/privacy"><ShieldCheck size={19} aria-hidden="true"/><span>Your privacy</span><ArrowUpRight size={16} aria-hidden="true"/></Link>
    </nav>
   </aside>
  </div>
  <div className="account-explore"><div><span className="eyebrow">SOMETHING TO COME BACK TO</span><h2>Find your next <em>favourite.</em></h2></div><Link href="/shop">Explore the collection <ArrowRight size={18} aria-hidden="true"/></Link></div>
 </section>;
}
