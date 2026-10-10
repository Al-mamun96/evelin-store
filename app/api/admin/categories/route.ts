import {guard,readJson,failure} from '@/lib/admin-api';
import {saveCategory,deleteCategory} from '@/lib/categories';
export async function POST(request:Request){const denied=await guard(request);if(denied)return denied;try{return Response.json({category:saveCategory(await readJson(request))});}catch(error){return failure(error);}}
export async function DELETE(request:Request){const denied=await guard(request);if(denied)return denied;try{const {id,version}=await readJson(request);deleteCategory(id,version);return Response.json({ok:true});}catch(error){return failure(error);}}
