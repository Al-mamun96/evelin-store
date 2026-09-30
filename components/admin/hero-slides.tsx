'use client';
import {useState} from 'react';
import {ArrowUp,ArrowDown,Star,Trash2} from 'lucide-react';
import {requestKey as newRequestKey} from '@/lib/request-key';
import {MAX_HERO_SLIDES} from '@/lib/shared';
import {ImageUpload} from './image-upload';
export type HeroSlideValue={id:string;image:string;alt:string};
const nextId=()=>'slide-'+newRequestKey().slice(0,8);
const altPlaceholder='Collection photo';
/** Ordered homepage banner slides. The first slide is the primary banner. */
export function HeroSlideManager({slides,onChange,onBusy}:{slides:HeroSlideValue[];onChange:(slides:HeroSlideValue[])=>void;onBusy:(busy:boolean)=>void}){
  const [selected,setSelected]=useState(slides[0]?.id||'');
  const update=(id:string,patch:Partial<HeroSlideValue>)=>onChange(slides.map(s=>s.id===id?{...s,...patch}:s));
  const move=(index:number,offset:number)=>{const target=index+offset;if(target<0||target>=slides.length)return;const next=[...slides];[next[index],next[target]]=[next[target],next[index]];onChange(next);};
  return <>
    <p className="studio-hint">মোবাইলে ছবিগুলো slider হিসেবে দেখা যাবে। প্রথম ছবিটি প্রধান banner।</p>
    {slides.length>1&&<div className="slide-list">{slides.map((slide,index)=><div className={'slide-row'+(slide.id===selected?' selected':'')} key={slide.id} onClick={()=>setSelected(slide.id)}>
      <img src={slide.image} alt=""/>
      <div className="slide-row-main"><strong>{index===0?'Main banner':'Slide '+(index+1)}{index===0&&<span className="studio-pill positive">FIRST</span>}</strong><small>{slide.image.split('/').pop()}</small>
        <label className="slide-alt">Describe this photo<input maxLength={160} value={slide.alt} placeholder={altPlaceholder} onChange={e=>update(slide.id,{alt:e.target.value})}/></label>
      </div>
      <div className="row-actions">
        {index!==0&&<button type="button" className="studio-icon" aria-label={'Move slide '+(index+1)+' to first position'} onClick={e=>{e.stopPropagation();move(index,-index);}}><Star size={17}/></button>}
        <button type="button" className="studio-icon" aria-label={'Move slide '+(index+1)+' up'} disabled={index===0} onClick={e=>{e.stopPropagation();move(index,-1);}}><ArrowUp size={17}/></button>
        <button type="button" className="studio-icon" aria-label={'Move slide '+(index+1)+' down'} disabled={index===slides.length-1} onClick={e=>{e.stopPropagation();move(index,1);}}><ArrowDown size={17}/></button>
        <button type="button" className="studio-icon danger" aria-label={'Remove slide '+(index+1)} disabled={slides.length===1} onClick={e=>{e.stopPropagation();const next=slides.filter(s=>s.id!==slide.id);onChange(next);setSelected(next[0]?.id||'');}}><Trash2 size={17}/></button>
      </div>
    </div>)}</div>}
    {slides.length<MAX_HERO_SLIDES&&<ImageUpload value="" onChange={image=>onChange([...slides,{id:nextId(),image,alt:''}])} onBusy={onBusy}/>}
    {slides.length>=MAX_HERO_SLIDES&&<p className="studio-hint">সর্বোচ্চ {MAX_HERO_SLIDES} টি slider ছবি যোগ করা যাবে। কোনো ছবি সরিয়ে নতুন ছবি যোগ করুন।</p>}
    {slides.length===1&&<p className="studio-hint">আরও ছবি যোগ করলে মোবাইলে slider চালু হবে।</p>}
  </>;
}