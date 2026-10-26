import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {createHash} from 'node:crypto';
import {ZodError} from 'zod';
import {validOrigin} from '@/lib/auth';
import {rateLimit} from '@/lib/db';
import {sessionCustomer,registerCustomer,loginCustomer,endSession,updateCustomer,changeCustomerPassword,sessionAge} from '@/lib/customers';
export const runtime='nodejs';
const local=()=>process.env.INSECURE_LOCAL_COOKIES==='true'&&/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(process.env.NEXT_PUBLIC_SITE_URL||'');
const cookieName=()=>local()?'evelin_customer_local':'__Host-evelin_customer';
function reply(data:unknown,status=200){return NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});}
function setSession(response:NextResponse,token:string,maxAge=sessionAge){response.cookies.set(cookieName(),token,{httpOnly:true,secure:!local(),sameSite:'strict',path:'/',maxAge});return response;}
export async function GET(){const token=(await cookies()).get(cookieName())?.value;return reply({customer:sessionCustomer(token)});}
export async function POST(request:Request){
 if(!validOrigin(request))return reply({error:'Invalid request origin.'},403);
 if(!rateLimit('customer:global',90,60))return reply({error:'Too many requests. Please try again in a minute.'},429);
 try{
  if(Number(request.headers.get('content-length')||0)>8000)return reply({error:'Request too large.'},413);
  const text=await request.text();if(text.length>8000)return reply({error:'Request too large.'},413);
  let body;try{body=JSON.parse(text);}catch{return reply({error:'Invalid request.'},400);}
  if(!body||typeof body!=='object')return reply({error:'Invalid request.'},400);
  const token=(await cookies()).get(cookieName())?.value;
  if(body.action==='logout'){endSession(token);return setSession(reply({ok:true}),'',0);}
  if(body.action==='register'||body.action==='login'){
   const key=createHash('sha256').update(String(body.email||'').trim().toLowerCase().slice(0,254)).digest('hex');
   if(!rateLimit('customer:auth:'+key,10,900)||!rateLimit('customer:hash',30,60))return reply({error:'Too many attempts. Please try again later.'},429);
   const result=body.action==='register'?await registerCustomer(body):await loginCustomer(body);
   endSession(token);return setSession(reply({customer:result.customer},body.action==='register'?201:200),result.token);
  }
  const customer=sessionCustomer(token);if(!customer)return reply({error:'Please sign in again.'},401);
  if(body.action==='profile')return reply({customer:updateCustomer(token,body)});
  if(body.action==='password'){
   if(!rateLimit('customer:password:'+customer.id,5,900))return reply({error:'Too many attempts. Please try again later.'},429);
   const result=await changeCustomerPassword(token,body);return setSession(reply({customer:result.customer}),result.token);
  }
  return reply({error:'Unknown action.'},400);
 }catch(error){
  if(error instanceof ZodError)return reply({error:error.issues[0]?.message||'Please check your details.'},400);
  const message=error instanceof Error?error.message:'';
  const allowed=['Unable to create this account. Try signing in or use another email.','Email or password is incorrect.','Please sign in again.','Current password is incorrect.'];
  return reply({error:allowed.includes(message)?message:'Unable to complete this request. Please try again.'},allowed.includes(message)?400:500);
 }
}
