import {guard,readJson,failure} from '@/lib/admin-api';
import {sendOrderConfirmation,telegramStatus} from '@/lib/telegram';
import {getOrder} from '@/lib/orders';

export async function GET(request:Request){const denied=await guard(request);if(denied)return denied;return Response.json(telegramStatus());}
export async function POST(request:Request){const denied=await guard(request);if(denied)return denied;try{const body=await readJson(request);if(body.action!=='test')throw new Error('Unknown notification action.');const orderId=String(body.orderId||'');if(!orderId)throw new Error('Enter an order ID for the test message.');const order=getOrder(orderId);if(!order)throw new Error('Order not found.');const result=await sendOrderConfirmation(order);if(!result.configured)throw new Error('Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID on the server first.');return Response.json({ok:true});}catch(error){return failure(error);}}
