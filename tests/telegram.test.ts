import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sendOrderConfirmation,telegramStatus} from '../lib/telegram.ts';
import type {Order} from '../lib/orders.ts';

test('Telegram configuration, order totals and failures are tested without contacting Telegram',async()=>{
 const previousFetch=globalThis.fetch,token=process.env.TELEGRAM_BOT_TOKEN,chat=process.env.TELEGRAM_CHAT_ID;
 const order={id:'TEST-ONLY',customer:'Test customer',phone:'01700000000',address:'Synthetic test address',zone:'dhaka',zone_label:'Dhaka',items:[{name:'Test product',size:'M',quantity:2,price:500}],subtotal:1000,delivery:80,discount:100,total:980,advance:200,note:'Test note'} as Order;
 try{
  process.env.TELEGRAM_BOT_TOKEN='';process.env.TELEGRAM_CHAT_ID='';
  globalThis.fetch=async()=>{throw new Error('Unexpected network request');};
  assert.equal(telegramStatus().configured,false);
  assert.deepEqual(await sendOrderConfirmation(order),{configured:false,sent:false});
  process.env.TELEGRAM_BOT_TOKEN='synthetic-token';process.env.TELEGRAM_CHAT_ID='synthetic-chat';
  globalThis.fetch=async(_url,init)=>{
   const payload=JSON.parse(String(init?.body));
   assert.equal(payload.chat_id,'synthetic-chat');
   for(const value of ['TEST-ONLY','Test customer','Test product','COD to collect: ৳780','Test note'])assert.ok(payload.text.includes(value));
   assert.ok(init?.signal);assert.equal(init?.cache,'no-store');
   return Response.json({ok:true});
  };
  assert.deepEqual(await sendOrderConfirmation(order),{configured:true,sent:true});
  globalThis.fetch=async()=>Response.json({ok:false},{status:403});
  await assert.rejects(()=>sendOrderConfirmation(order),/Telegram rejected/);
  globalThis.fetch=async()=>Response.json({ok:false});
  await assert.rejects(()=>sendOrderConfirmation(order),/Telegram rejected/);
 }finally{
  globalThis.fetch=previousFetch;
  if(token===undefined)delete process.env.TELEGRAM_BOT_TOKEN;else process.env.TELEGRAM_BOT_TOKEN=token;
  if(chat===undefined)delete process.env.TELEGRAM_CHAT_ID;else process.env.TELEGRAM_CHAT_ID=chat;
 }
});
