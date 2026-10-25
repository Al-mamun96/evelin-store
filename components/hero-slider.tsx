'use client';
import {getImageProps} from 'next/image';
import Link from 'next/link';
import {useCallback,useEffect,useRef,useState} from 'react';
import {ArrowUpRight,ChevronLeft,ChevronRight,Pause,Play} from 'lucide-react';
import {SLIDE_INTERVAL} from '@/lib/shared';
export type HeroSlide={id:string;image:string;mobileImage?:string;alt:string};
export function HeroSlider({slides,caption,captionUrl='/shop',ctaLabel,ctaUrl,storeName}:{slides:HeroSlide[];caption:string;captionUrl?:string;ctaLabel:string;ctaUrl:string;storeName:string}){
  const track=useRef<HTMLDivElement>(null),[active,setActive]=useState(0);
  const [playing,setPlaying]=useState(true);
  const count=slides.length;
  // The scroll container is the single source of truth, so a swipe, a dot click
  // and an arrow click can never disagree about which slide is showing.
  const sync=useCallback(()=>{const el=track.current;if(!el)return;const index=Math.round(el.scrollLeft/(el.scrollWidth/Math.max(count,1)));setActive(Math.min(count-1,Math.max(0,index)));},[count]);
  const go=useCallback((index:number)=>{const el=track.current;if(!el||count<1)return;const next=Math.min(count-1,Math.max(0,index));const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;el.scrollTo({left:next*(el.scrollWidth/count),behavior:reduced?'auto':'smooth'});setActive(next);},[count]);
  useEffect(()=>{const el=track.current;if(!el)return;sync();el.addEventListener('scroll',sync,{passive:true});return()=>el.removeEventListener('scroll',sync);},[sync]);
  useEffect(()=>{setActive(0);},[count]);
  // Autoplay. Skipped entirely for a single slide, when the visitor has paused
  // it, or when the device asks for reduced motion. Reading the media query
  // inside the effect means the choice is re-evaluated without remounting.
  useEffect(()=>{
    if(count<2||!playing)return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const timer=setInterval(()=>{const el=track.current;if(!el)return;const step=el.scrollWidth/Math.max(count,1);const atEnd=Math.abs(el.scrollLeft+el.clientWidth-el.scrollWidth)<2;
      el.scrollTo({left:atEnd?0:el.scrollLeft+step,behavior:'smooth'});},SLIDE_INTERVAL);
    return()=>clearInterval(timer);
  },[count,playing,active]);
  const label=(index:number)=>`Slide ${index+1} of ${count}`;
  return <div className="hero-image hero-slider">
    <div className="hero-track" ref={track} role="group" aria-roledescription="carousel" aria-label="Collection highlights" tabIndex={0} onPointerDown={()=>setPlaying(false)} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();go(active+1);}else if(e.key==='ArrowLeft'){e.preventDefault();go(active-1);}}}>
      {slides.map((slide,index)=>{
        const shared={alt:slide.alt||storeName+' collection',fill:true,sizes:'(max-width: 750px) 100vw, 60vw',loading:index===0?'eager' as const:'lazy' as const};
        const desktop=getImageProps({...shared,src:slide.image}).props;
        const mobile=slide.mobileImage?getImageProps({...shared,src:slide.mobileImage,sizes:'100vw'}).props:null;
        return <div className={'hero-slide'+(index===active?' current':'')} key={slide.id} role="group" aria-roledescription="slide" aria-label={label(index)} aria-hidden={index!==active}>
          <picture>{mobile&&<source media="(max-width: 750px)" srcSet={mobile.srcSet} sizes={mobile.sizes}/>}<img {...desktop} alt={desktop.alt} fetchPriority={index===0?'high':'auto'} draggable={false} className="hero-slide-img"/></picture>
        </div>;
      })}

    </div>
    {count>1&&<>
      <button type="button" className="hero-arrow hero-arrow-prev" aria-label={'Previous slide'} disabled={active===0} onClick={()=>go(active-1)}><ChevronLeft size={20}/></button>
      <button type="button" className="hero-arrow hero-arrow-next" aria-label={'Next slide'} disabled={active===count-1} onClick={()=>go(active+1)}><ChevronRight size={20}/></button>
      <button type="button" className="hero-playpause" aria-label={playing?'Pause automatic slideshow':'Play automatic slideshow'} onClick={()=>setPlaying(p=>!p)}>{playing?<Pause size={13}/>:<Play size={13}/>}</button>
      <div className="hero-dots" role="tablist" aria-label="Choose slide">{slides.map((slide,index)=><button type="button" role="tab" key={slide.id} className={'hero-dot'+(index===active?' active':'')} aria-selected={index===active} aria-label={label(index)} onClick={()=>go(index)}/>)}</div>
    </>}
    <Link className="button hero-button hero-banner-button" href={ctaUrl}>Shop Now</Link><div className="image-caption"><span>{caption}</span><Link href={captionUrl} aria-label="Explore the collection"><ArrowUpRight size={23}/></Link></div>
  </div>;
}