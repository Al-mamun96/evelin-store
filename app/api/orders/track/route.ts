import {NextResponse} from 'next/server';
import {getOrder} from '@/lib/orders';
import {rateLimit} from '@/lib/db';
export const runtime='nodejs';
const digits=(value:string)=>value.replace(/\D/g,'').replace(/^88/,'');
export async function GET(request:Request){
  if(!rateLimit('order-track',120,60))return NextResponse.json({error:'Please try again in a minute.'},{status:429});
  const url=new URL(request.url);
  const id=(url.searchParams.get('id')||'').trim().toUpperCase(),phone=digits(url.searchParams.get('phone')||'');
  if(!id||!phone)return NextResponse.json({error:'Enter your order number and phone number.'},{status:400});
  const order=getOrder(id);
  if(!order||digits(order.phone)!==phone)return NextResponse.json({error:'No order matches those details.'},{status:404});
  return NextResponse.json({order:{id:order.id,status:order.status,total:order.total,created_at:order.created_at,zone_label:order.zone_label}},{headers:{'Cache-Control':'no-store'}});
}
