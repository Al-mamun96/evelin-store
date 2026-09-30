'use client';
import {useState} from 'react';
import {UploadCloud} from 'lucide-react';
export function ImageUpload({value,onChange,onBusy}:{value:string;onChange:(value:string)=>void;onBusy?:(value:boolean)=>void}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function upload(file?:File){if(!file)return;setBusy(true);onBusy?.(true);setError('');try{const body=new FormData();body.set('file',file);const r=await fetch('/api/admin/upload',{method:'POST',body});const result=await r.json();if(!r.ok)throw new Error(result.error);onChange(result.url);}catch(e){setError(e instanceof Error?e.message:'Upload failed.');}finally{setBusy(false);onBusy?.(false);}}
 return <div className="studio-upload">{value&&<img src={value} alt="Selected image preview"/>}<label className="upload-control"><UploadCloud size={22}/><strong>{busy?'Uploading…':'Choose photo'}</strong><span>JPG, PNG or WebP · maximum 8 MB</span><input aria-label="Upload photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>upload(e.target.files?.[0])}/></label>{error&&<p className="studio-error" role="alert">{error}</p>}</div>;
}
