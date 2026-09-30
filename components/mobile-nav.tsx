'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Home,LayoutGrid,ShoppingBag,Info,Phone} from 'lucide-react';
import {useShop} from './shop-provider';
/**
 * Fixed bottom navigation for small screens, where the header menu is behind a
 * hamburger. Hidden on desktop, where the full header navigation is visible.
 * Highlights the current route and carries the live bag count.
 */
export function MobileNav(){
  const pathname=usePathname(),{count}=useShop();
  const items=[
    {href:'/',label:'Home',icon:Home},
    {href:'/shop',label:'Shop',icon:LayoutGrid},
    {href:'/cart',label:'Bag',icon:ShoppingBag,badge:count},
    {href:'/information',label:'Info',icon:Info},
    {href:'/checkout',label:'Checkout',icon:Phone}
  ];
  const active=(href:string)=>href==='/'?pathname==='/':pathname.startsWith(href);
  return <nav className="mobile-nav" aria-label="Quick navigation">{items.map(({href,label,icon:Icon,badge})=>{
    const current=active(href);
    return <Link key={href} href={href} aria-current={current?'page':undefined} className={current?'active':''}>
      <span className="mobile-nav-icon"><Icon size={20} strokeWidth={1.6}/>{!!badge&&<span className="mobile-nav-badge">{badge>99?'99+':badge}</span>}</span>
      <span className="mobile-nav-label">{label}</span>
    </Link>;
  })}</nav>;
}
