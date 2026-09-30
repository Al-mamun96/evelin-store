import {NextResponse} from 'next/server';
import {ZodError} from 'zod';
import {isAdmin,validOrigin} from './auth';
export async function guard(request:Request){if(!await isAdmin()||(request.method!=='GET'&&!validOrigin(request)))return NextResponse.json({error:'Please sign in again.'},{status:401});}
export async function readJson(request:Request){const text=await request.text();if(text.length>100000)throw new Error('This request is too large.');try{return JSON.parse(text);}catch{throw new Error('Please check your form and try again.');}}
export function failure(error:unknown){const message=error instanceof ZodError?error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; '):error instanceof Error?error.message:'Unable to save. Please try again.';return NextResponse.json({error:message},{status:400});}
