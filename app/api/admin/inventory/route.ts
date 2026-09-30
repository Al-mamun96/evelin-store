import {guard,readJson,failure} from '@/lib/admin-api';
import {adjustStock} from '@/lib/products';
export async function PATCH(request:Request){const denied=await guard(request);if(denied)return denied;try{adjustStock(await readJson(request));return Response.json({ok:true});}catch(error){return failure(error);}}
