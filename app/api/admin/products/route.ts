import {guard,readJson,failure} from '@/lib/admin-api';
import {saveProduct,archiveProduct} from '@/lib/products';
export async function POST(request:Request){const denied=await guard(request);if(denied)return denied;try{return Response.json({product:saveProduct(await readJson(request))});}catch(error){return failure(error);}}
export async function DELETE(request:Request){const denied=await guard(request);if(denied)return denied;try{const {id,version}=await readJson(request);archiveProduct(id,version);return Response.json({ok:true});}catch(error){return failure(error);}}
export async function PATCH(request:Request){const denied=await guard(request);if(denied)return denied;try{const {id,version}=await readJson(request);archiveProduct(id,version,true);return Response.json({ok:true});}catch(error){return failure(error);}}
