'use client';
import { createContext,useContext,useEffect,useState,ReactNode } from 'react';
import type {Product} from '@/lib/catalog';
export type CartItem={id:string;size:string;quantity:number};
type ShopContext={products:Product[];cart:CartItem[];add:(item:CartItem)=>void;update:(id:string,size:string,quantity:number)=>void;clear:()=>void;count:number;total:number;ready:boolean;toast:string};
const Context=createContext<ShopContext|null>(null);
export function ShopProvider({children,products}:{children:ReactNode;products:Product[]}){
 const [cart,setCart]=useState<CartItem[]>([]),[ready,setReady]=useState(false),[toast,setToast]=useState('');
 useEffect(()=>{try{const raw=JSON.parse(localStorage.getItem('evelin-cart')||'[]');if(Array.isArray(raw))setCart(raw.filter(i=>products.some(p=>p.id===i.id&&p.sizes.includes(i.size))&&Number.isInteger(i.quantity)&&i.quantity>0&&i.quantity<=10));}catch{}setReady(true);},[products]);
 useEffect(()=>{if(ready)try{localStorage.setItem('evelin-cart',JSON.stringify(cart));}catch{}},[cart,ready]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),3000);return()=>clearTimeout(t);},[toast]);
 function add(item:CartItem){setCart(old=>{const match=old.find(i=>i.id===item.id&&i.size===item.size);return match?old.map(i=>i===match?{...i,quantity:Math.min(10,i.quantity+item.quantity)}:i):[...old,item];});setToast('Added to your bag');}
 function update(id:string,size:string,quantity:number){setCart(old=>old.map(i=>i.id===id&&i.size===size?{...i,quantity:Math.min(10,quantity)}:i).filter(i=>i.quantity>0));}
 const validCart=cart.filter(i=>products.some(p=>p.id===i.id&&p.sizes.includes(i.size)));
 return <Context.Provider value={{products,cart:validCart,add,update,clear:()=>setCart([]),count:validCart.reduce((s,i)=>s+i.quantity,0),total:validCart.reduce((s,i)=>s+(products.find(p=>p.id===i.id)?.price||0)*i.quantity,0),ready,toast}}>{children}<div className={'toast '+(toast?'visible':'')} role="status">{toast}</div></Context.Provider>;
}
export function useShop(){const context=useContext(Context);if(!context)throw new Error('Missing shop context');return context;}
