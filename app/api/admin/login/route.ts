import { NextResponse } from 'next/server';
import { configured, same, sign, validOrigin } from '@/lib/auth';
import { rateLimit } from '@/lib/db';
export async function POST(request:Request) {
  if(!validOrigin(request))return NextResponse.json({error:'Invalid origin'},{status:403});
  if(!configured())return NextResponse.json({error:'Set ADMIN_PASSWORD (16+ characters) and SESSION_SECRET (32+ characters) in your environment first.'},{status:503});
  if(!rateLimit('admin-login',10,900))return NextResponse.json({error:'Too many attempts. Try again in 15 minutes.'},{status:429});
  const raw=await request.text();if(raw.length>1000)return NextResponse.json({error:'Invalid request'},{status:400});
  let password;try{password=JSON.parse(raw).password;}catch{return NextResponse.json({error:'Invalid request'},{status:400});}
  if(typeof password!=='string'||!same(password,process.env.ADMIN_PASSWORD!))return NextResponse.json({error:'Incorrect password.'},{status:401});
  const expires=String(Date.now()+8*60*60*1000),response=NextResponse.json({ok:true});
  response.cookies.set('evelin_admin',expires+'.'+sign(expires),{httpOnly:true,secure:process.env.INSECURE_LOCAL_COOKIES!=='true',sameSite:'strict',path:'/',maxAge:28800});return response;
}
