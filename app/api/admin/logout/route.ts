import { NextResponse } from 'next/server';
import { validOrigin } from '@/lib/auth';
export async function POST(request:Request){if(!validOrigin(request))return NextResponse.json({error:'Invalid origin'},{status:403});const r=NextResponse.json({ok:true});r.cookies.delete('evelin_admin');return r;}
