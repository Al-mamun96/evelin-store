import {randomUUID} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import sharp from 'sharp';
import {guard,failure} from '@/lib/admin-api';
export async function POST(request:Request){const denied=await guard(request);if(denied)return denied;try{
 if(Number(request.headers.get('content-length')||0)>9*1024*1024)throw new Error('Choose an image smaller than 8 MB.');
 const form=await request.formData(),file=form.get('file');if(!(file instanceof File)||!file.size||file.size>8*1024*1024)throw new Error('Choose a JPG, PNG or WebP image under 8 MB.');
 const input=Buffer.from(await file.arrayBuffer()),processor=sharp(input,{limitInputPixels:25000000,animated:false});const meta=await processor.metadata();if(!['jpeg','png','webp'].includes(meta.format||''))throw new Error('Only JPG, PNG and WebP photos are supported.');
 const bytes=await processor.rotate().resize({width:1800,height:1800,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer();
 const directory=join(dirname(process.env.DATABASE_PATH||'./data/evelin.sqlite'),'uploads');await mkdir(directory,{recursive:true});const name=randomUUID()+'.webp';await writeFile(join(directory,name),bytes,{flag:'wx',mode:0o600});return Response.json({url:'/media/'+name});
 }catch(error){return failure(error);}}
