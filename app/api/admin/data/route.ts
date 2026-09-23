import {guard} from '@/lib/admin-api';
import {getProducts} from '@/lib/products';
import {getSettings} from '@/lib/store-settings';
import {courierSettings} from '@/lib/steadfast';
import {db,inventory} from '@/lib/db';
import {listOrders} from '@/lib/orders';
export async function GET(request:Request){const denied=await guard(request);if(denied)return denied;const url=new URL(request.url);const page=Math.max(1,Math.min(100000,Number(url.searchParams.get('page'))||1));return Response.json({products:getProducts('all'),inventory:inventory(),settings:getSettings(),courier:courierSettings(),...listOrders(page,url.searchParams.get('q')||'',url.searchParams.get('status')||'All'),stats:db().prepare("SELECT COUNT(*) AS orders, SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status='Delivered' THEN total ELSE 0 END) AS sales FROM orders").get(),activity:db().prepare('SELECT * FROM activity ORDER BY id DESC LIMIT 50').all(),stockLog:db().prepare('SELECT * FROM stock_log ORDER BY id DESC LIMIT 100').all()},{headers:{'Cache-Control':'no-store'}});}
