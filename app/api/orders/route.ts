import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/orders';
import { rateLimit } from '@/lib/db';
import { validOrigin } from '@/lib/auth';
import {getSettings} from '@/lib/store-settings';
export const runtime='nodejs';
export async function POST(request:Request) {
  if(!validOrigin(request))return NextResponse.json({error:'Invalid request origin.'},{status:403});
  if(!getSettings().storeLive)return NextResponse.json({error:'Evelin is preparing to launch. Orders are not open yet.'},{status:503});
  try {
    if(Number(request.headers.get('content-length')||0)>16000)return NextResponse.json({error:'Request too large.'},{status:413});
    const text=await request.text();if(text.length>16000)return NextResponse.json({error:'Request too large.'},{status:413});
    const data=JSON.parse(text);
    if(!rateLimit('checkout:global',100,60))return NextResponse.json({error:'Please try again in a minute.'},{status:429});
    const order=createOrder(data);return NextResponse.json(order,{status:201});
  }catch(error){const message=error instanceof Error?error.message:'';return NextResponse.json({error:message.startsWith('[')?'Please check your details and try again.':message||'Unable to place order.'},{status:400});}
}
