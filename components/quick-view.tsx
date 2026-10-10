'use client';
import {createContext,useContext,useEffect,useRef,useState,ReactNode} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {X,Minus,Plus,ArrowRight} from 'lucide-react';
import {Product,money} from '@/lib/catalog';
import {useShop} from './shop-provider';

type QuickViewContext={open:(product:Product)=>void};
const Context=createContext<QuickViewContext|null>(null);
export function useQuickView(){const context=useContext(Context);if(!context)throw new Error('Missing quick view context');return context;}

/** Single shared quick-view dialog so every product card reuses one instance. */
export function QuickViewProvider({children}:{children:ReactNode}){
  const [active,setActive]=useState<Product|null>(null);
  return <Context.Provider value={{open:setActive}}>{children}{active&&<QuickView product={active} onClose={()=>setActive(null)}/>}</Context.Provider>;
}

function QuickView({product:p,onClose}:{product:Product;onClose:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null),{add}=useShop();
  const [view,setView]=useState(p.image),[size,setSize]=useState(''),[quantity,setQuantity]=useState(1),[error,setError]=useState('');
  useEffect(()=>{const el=dialog.current;el?.showModal();return()=>el?.close();},[]);
  const gallery=p.gallery??[],variations=p.showVariations!==false?(p.variations??[]):[];
  const thumbs=[p.image,...gallery,...variations.map(v=>v.image)];
  function addToBag(){if(!size){setError('Please choose your size.');return;}add({id:p.id,size,quantity});dialog.current?.close();}
  return <dialog ref={dialog} className="quick-dialog" onClose={onClose} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close();}}><button type="button" className="icon-button dialog-close" aria-label="Close quick view" onClick={()=>dialog.current?.close()}><X/></button><div className="quick-grid"><div className="quick-media"><div className="quick-photo"><Image src={view} alt={p.name+' in '+p.color} fill priority sizes="(max-width:750px) 100vw,45vw"/></div>{thumbs.length>1&&<div className="quick-thumbs">{thumbs.map((img,i)=><button type="button" key={img+i} className={view===img?'selected':''} aria-label={'Show image '+(i+1)} onClick={()=>setView(img)}><Image src={img} alt="" fill sizes="80px"/></button>)}</div>}</div><div className="quick-copy"><span className="eyebrow">EVELIN / {p.category.toUpperCase()}</span><h2>{p.name}</h2><p className="detail-price">{money(p.price)}</p><p className="description">{p.description}</p>{variations.length>0&&<><div className="selection-label">Variation <strong>{variations.find(v=>v.image===view)?.label||p.color}</strong></div><div className="variation-options">{variations.map(v=><button type="button" key={v.id} className={view===v.image?'selected':''} onClick={()=>setView(v.image)}>{v.label}</button>)}</div></>}<div className="selection-label">Select size</div><div className="size-options">{p.sizes.map(s=><button type="button" key={s} className={size===s?'selected':''} aria-pressed={size===s} onClick={()=>{setSize(s);setError('');}}>{s}</button>)}</div><div className="add-row"><div className="quantity-control"><button type="button" aria-label="Decrease quantity" disabled={quantity<=1} onClick={()=>setQuantity(quantity-1)}><Minus size={15}/></button><span>{quantity}</span><button type="button" aria-label="Increase quantity" disabled={quantity>=10} onClick={()=>setQuantity(quantity+1)}><Plus size={15}/></button></div><button type="button" className="button" onClick={addToBag}>Add to bag <ArrowRight size={18}/></button></div>{error&&<p className="form-error" role="alert">{error}</p>}<Link href={'/products/'+p.id} className="text-link" onClick={()=>dialog.current?.close()}>View full details <ArrowRight size={16}/></Link></div></div></dialog>;
}
