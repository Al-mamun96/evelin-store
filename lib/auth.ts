import { createHmac, timingSafeEqual, createHash } from 'node:crypto';
import { cookies } from 'next/headers';
export function configured() {return (process.env.ADMIN_PASSWORD?.length||0)>=16 && (process.env.SESSION_SECRET?.length||0)>=32;}
export function same(a:string,b:string) { return timingSafeEqual(createHash('sha256').update(a).digest(),createHash('sha256').update(b).digest()); }
export function sign(payload:string) {return createHmac('sha256',process.env.SESSION_SECRET!).update(payload).digest('hex');}
export async function isAdmin() {
  if(!configured())return false;
  const value=(await cookies()).get('evelin_admin')?.value;
  if(!value)return false;
  const [expires,signature]=value.split('.');
  return Number(expires)>Date.now() && !!signature && same(signature,sign(expires));
}
export function validOrigin(request:Request) {
  const origin=request.headers.get('origin');
  const expected=process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  return origin === new URL(expected).origin;
}
