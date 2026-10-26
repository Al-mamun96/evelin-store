import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomBytes} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import assert from 'node:assert/strict';

// Only synthetic local data; never sends an order or notification to production.
const directory=mkdtempSync(join(tmpdir(),'evelin-mobile-'));
const origin='http://127.0.0.1:3102',database=join(directory,'store.sqlite');
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3102','-H','127.0.0.1'],{env:{...process.env,NEXT_PUBLIC_SITE_URL:origin,DATABASE_PATH:database,ADMIN_PASSWORD:randomBytes(24).toString('hex'),SESSION_SECRET:randomBytes(32).toString('hex'),STORE_LIVE:'true',SEO_INDEXABLE:'false',TELEGRAM_BOT_TOKEN:'',TELEGRAM_CHAT_ID:''},stdio:'ignore'});
let browser;
try{
 for(let n=0;n<100;n++){try{if((await fetch(origin+'/api/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 const page=await context.newPage(),errors=[],externalFonts=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(/fonts\.(googleapis|gstatic)\.com/.test(request.url()))externalFonts.push(request.url());});
 const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal page overflow');
 await page.goto(origin);await page.evaluate(()=>document.fonts.ready);await noOverflow();
 await page.getByRole('button',{name:'Open menu',exact:true}).click();
 assert.ok(await page.locator('.menu-dialog').evaluate(el=>el.open));
 await page.getByRole('button',{name:'Close menu',exact:true}).click();
 await page.goto(origin+'/products/ivory-panjabi');await noOverflow();
 await page.getByRole('button',{name:'Add to cart',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'Please choose your size.'}).waitFor();
 await page.getByRole('button',{name:'Buy now',exact:true}).click();
 assert.equal(new URL(page.url()).pathname,'/products/ivory-panjabi');
 await page.getByRole('alert').filter({hasText:'Please choose your size.'}).waitFor();
 await page.locator('.size-options').getByRole('button',{name:'M',exact:true}).click();
 await page.getByRole('button',{name:'Add to cart',exact:true}).click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('evelin-cart')||'[]').length===1);
 const photo=page.locator('.detail-photo');await photo.scrollIntoViewIfNeeded();
 const rect=await photo.boundingBox(),cdp=await context.newCDPSession(page);
 const center={x:rect.x+rect.width/2,y:rect.y+Math.min(rect.height/2,200)};
 const points=gap=>[{x:center.x-gap,y:center.y,id:1},{x:center.x+gap,y:center.y,id:2}];
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(35)});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(80)});
 await page.waitForFunction(()=>Number(document.querySelector('.detail-zoom-image').style.transform.match(/scale\(([^)]+)/)?.[1])>1);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await page.getByRole('button',{name:'Buy now',exact:true}).click();
 await page.waitForURL(origin+'/checkout');
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('evelin-cart')||'[]')[0]?.quantity===2);
 await page.getByLabel('Full name').fill('Mobile test customer');
 await page.getByLabel('Mobile number').fill('01700000000');
 await page.getByLabel('Full delivery address').fill('Synthetic test address, Dhaka');
 await noOverflow();
 // Simulate a lost response AFTER the server saves the order. Retry must reuse the key.
 const keys=[];let loseResponse=true;
 await page.route('**/api/orders',async route=>{
  keys.push(route.request().postDataJSON().requestKey);
  const response=await route.fetch();
  if(loseResponse){loseResponse=false;await route.abort('failed');}
  else await route.fulfill({response});
 });
 await page.getByRole('button',{name:/Place order/}).click();
 await page.getByRole('alert').waitFor();
 assert.equal(await page.getByLabel('Full name').inputValue(),'Mobile test customer');
 await page.getByRole('button',{name:/Place order/}).click();
 await page.getByText('Your order has been received.',{exact:true}).waitFor();
 assert.equal(new URL(page.url()).pathname,'/checkout');
 assert.equal(keys.length,2);assert.equal(keys[0],keys[1]);
 const db=new DatabaseSync(database,{readOnly:true});
 assert.equal(db.prepare('SELECT count(*) AS count FROM orders').get().count,1);
 assert.equal(JSON.parse(db.prepare('SELECT items FROM orders').get().items)[0].quantity,2);db.close();
 assert.equal(externalFonts.length,0,'Default fonts must be self-hosted');
 assert.deepEqual(errors,[]);
 mkdirSync('test-results',{recursive:true});await page.screenshot({path:'test-results/mobile-checkout-success.png',fullPage:true});
 for(const width of [320,375,768,1440]){
  await page.setViewportSize({width,height:900});await page.goto(origin);await noOverflow();
  await page.goto(origin+'/products/ivory-panjabi');await noOverflow();
  const add=await page.getByRole('button',{name:'Add to cart',exact:true}).boundingBox();
  const buy=await page.getByRole('button',{name:'Buy now',exact:true}).boundingBox();
  assert.ok(Math.abs(add.y-buy.y)<1&&buy.x>=add.x+add.width,'Purchase buttons must remain side by side');
  assert.ok(add.height>=44&&buy.height>=44,'Touch targets must remain usable');
  assert.ok(await page.locator('.product-buy-now').evaluate(el=>getComputedStyle(el).backgroundColor!==getComputedStyle(document.querySelector('.product-add-cart')).backgroundColor),'Buy now must be visually distinct');
 }
 console.log('PASS: responsive widths 320/375/390/768/1440, mobile menu, size selection, touch pinch zoom, Buy now validation/navigation/cart preservation, single-page checkout, lost-response retry (one order), no page errors and no external default font requests. Synthetic local data only.');
}finally{
 await browser?.close();child.kill();await new Promise(resolve=>child.exitCode!==null?resolve():child.once('exit',resolve));
 // This exact directory was created by mkdtemp above and contains only test fixtures.
 rmSync(directory,{recursive:true,force:true});
}
