import {isAdmin} from '@/lib/auth';
import {AdminLogin} from '@/components/admin';
import {AdminStudio} from '@/components/admin/studio';
export const dynamic='force-dynamic';
export const metadata={title:'Store Admin',robots:{index:false,follow:false}};
export default async function Page(){return await isAdmin()?<AdminStudio/>:<AdminLogin/>;}
