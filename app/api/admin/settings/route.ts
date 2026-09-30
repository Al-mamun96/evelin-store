import {guard,readJson,failure} from '@/lib/admin-api';
import {saveSettings} from '@/lib/store-settings';
export async function PUT(request:Request){const denied=await guard(request);if(denied)return denied;try{return Response.json({settings:saveSettings(await readJson(request))});}catch(error){return failure(error);}}
