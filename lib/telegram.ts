import type {Order} from './orders.ts';

export function telegramStatus(){
  return {configured:Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim()&&process.env.TELEGRAM_CHAT_ID?.trim())};
}

export async function sendOrderConfirmation(order:Order){
  const token=process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId=process.env.TELEGRAM_CHAT_ID?.trim();
  if(!token||!chatId)return {configured:false,sent:false};
  const items=order.items.map(item=>`• ${item.name} — ${item.size} × ${item.quantity} = ৳${(item.price*item.quantity).toLocaleString('en-BD')}`).join('\n');
  const text=['🛍️ Evelin — Order confirmed',`Order: ${order.id}`,`Customer: ${order.customer}`,`Phone: ${order.phone}`,`Address: ${order.address}`,`Zone: ${order.zone_label||order.zone}`,'',items,'',`Subtotal: ৳${order.subtotal.toLocaleString('en-BD')}`,`Delivery: ৳${order.delivery.toLocaleString('en-BD')}`,`Discount: ৳${order.discount.toLocaleString('en-BD')}`,`COD to collect: ৳${(order.total-order.advance).toLocaleString('en-BD')}`,order.note?`Note: ${order.note}`:''].filter(Boolean).join('\n');
  const response=await fetch(`https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text,disable_web_page_preview:true}),signal:AbortSignal.timeout(10000),cache:'no-store'});
  if(!response.ok)throw new Error('Telegram rejected the notification. Check the bot token and chat ID.');
  const result=await response.json() as {ok?:boolean};
  if(!result.ok)throw new Error('Telegram rejected the notification. Check the bot token and chat ID.');
  return {configured:true,sent:true};
}
