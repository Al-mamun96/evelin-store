import { db } from '@/lib/db';
export function GET(){try{db().prepare('SELECT 1').get();return Response.json({status:'ok'});}catch{return Response.json({status:'unavailable'},{status:503});}}
