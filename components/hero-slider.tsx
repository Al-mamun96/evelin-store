'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useCallback,useEffect,useRef,useState} from 'react';
import {ArrowUpRight,ChevronLeft,ChevronRight} from 'lucide-react';
export type HeroSlide={id:string;image:string;alt:string};
export function HeroSlider({slides,caption,storeName}:{slides:HeroSlide[];caption:string;storeName:string}){
  const track=useRef<HTMLDivElement>(null),[active,setActive]=useState(0);
  const count=slides.length;
  // The scroll container is the single source of truth, so a swipe, a dot click
  // and an arrow click can never disagree about which slide is showing.
  const sync=useCallback(()=>{const el=track.current;if(!el)return;const index=Math.round(el.scrollLeft/(el.scrollWidth/Math.max(count,1)));setActive(Math.min(count-1,Math.max(0,index)));},[count]);
  useEffect(()=>{const el=track.current;if(!el)return;sync();el.addEventListener('scroll',sync,{passive:true});return()=>el.removeEventListener('scroll',sync);},[sync]);
  useEffect(()=>{setActive(0);},[count]);
  const go=useCallback((index:number)=>{const el=track.current;if(!el||count<1)return;const next=Math.min(count-1,Math.max(0,index));const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;el.scrollTo({left:next*(el.scrollWidth/count),behavior:reduced?'auto':'smooth'});setActive(next);},[count]);
  const label=(index:number)=>`Slide ${index+1} of ${count}`;
  return <div className="hero-image hero-slider">
    <div className="hero-track" ref={track} role="group" aria-roledescription="carousel" aria-label="Collection highlights" tabIndex={0} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();go(active+1);}else if(e.key==='ArrowLeft'){e.preventDefault();go(active-1);}}}>
      {slides.map((slide,index)=><div className={'hero-slide'+(index===active?' current':'')} key={slide.id} role="group" aria-roledescription="slide" aria-label={label(index)} aria-hidden={index!==active}>
        <Image src={slide.image} alt={slide.alt||storeName+' collection'} fill priority={index===0} loading={index===0?undefined:'lazy'} sizes="(max-width: 750px) 100vw, 60vw" draggable={false}/>
      </div>)}
    </div>
    {count>1&&<>
      <button type="button" className="hero-arrow hero-arrow-prev" aria-label={'Previous slide'} disabled={active===0} onClick={()=>go(active-1)}><ChevronLeft size={20}/></button>
      <button type="button" className="hero-arrow hero-arrow-next" aria-label={'Next slide'} disabled={active===count-1} onClick={()=>go(active+1)}><ChevronRight size={20}/></button>
      <div className="hero-dots" role="tablist" aria-label="Choose slide">{slides.map((slide,index)=><button type="button" role="tab" key={slide.id} className={'hero-dot'+(index===active?' active':'')} aria-selected={index===active} aria-label={label(index)} onClick={()=>go(index)}/>)}</div>
    </>}
    <div className="image-caption"><span>{caption}</span><Link href="/shop" aria-label="Explore the collection"><ArrowUpRight size={23}/></Link></div>
  </div>;
}