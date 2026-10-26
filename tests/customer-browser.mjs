import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const dir=mkdtempSync(join(tmpdir(),'evelin-auth-browser-')),origin='http://127.0.0.1:3104';
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3104','-H','127.0.0.1'],{env:{...process.env,NEXT_PUBLIC_SITE_URL:origin,DATABASE_PATH:join(dir,'store.sqlite'),INSECURE_LOCAL_COOKIES:'true',TELEGRAM_BOT_TOKEN:'',TELEGRAM_CHAT_ID:''},stdio:'ignore'});
let browser;
try{
 for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 const post=(body,headers={})=>fetch(origin+'/api/customer',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
 assert.equal((await post({action:'profile'})).status,401);
 assert.equal((await post({action:'login'},{Origin:'https://wrong.example'})).status,403);
 browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/account');
 await page.getByRole('group',{name:'Account access'}).getByRole('button',{name:'Create account'}).click();
 const form=page.getByRole('form',{name:'Create account'});
 await form.getByLabel('Full name').fill('Synthetic Member');await form.getByLabel('Email address').fill('member@example.test');
 await form.getByLabel('Password',{exact:true}).fill('Synthetic strong phrase 123');
 await form.getByLabel('Confirm password',{exact:true}).fill('Different strong phrase 123');
 await form.getByRole('button',{name:'Create my account'}).click();await page.getByRole('alert').filter({hasText:'Passwords do not match'}).waitFor();
 await form.getByLabel('Confirm password',{exact:true}).fill('Synthetic strong phrase 123');
 await form.getByRole('button',{name:'Create my account'}).click();
 await page.getByRole('heading',{name:'Your profile.'}).waitFor();
 const cookie=(await context.cookies()).find(c=>c.name==='evelin_customer_local');assert.ok(cookie.httpOnly);assert.equal(cookie.sameSite,'Strict');
 const response=await context.request.get(origin+'/api/customer');assert.ok(response.headers()['cache-control'].includes('no-store'));assert.ok(!(await response.text()).includes('password_hash'));
 const profile=page.getByRole('form',{name:'Edit profile'});
 await profile.getByLabel('Full name').fill('Updated Member');await profile.getByLabel('Mobile number').fill('01700000000');await profile.getByLabel('Delivery address').fill('Synthetic address');
 await profile.getByRole('button',{name:'Save profile'}).click();await page.getByText('Your profile has been saved.',{exact:true}).waitFor();
 await page.reload();await page.getByRole('heading',{name:'Your profile.'}).waitFor();assert.equal(await profile.getByLabel('Full name').inputValue(),'Updated Member');
 mkdirSync('test-results',{recursive:true});
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/customer-profile.png',fullPage:true});
 await page.locator('.customer-security summary').click();const security=page.getByRole('form',{name:'Change password'});
 await security.getByLabel('Current password',{exact:true}).fill('Synthetic strong phrase 123');await security.getByLabel('New password',{exact:true}).fill('Updated strong phrase 456');
 await security.getByRole('button',{name:'Update password'}).click();await page.getByText('Password updated. Other devices have been signed out.',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.getByRole('form',{name:'Sign in'}).waitFor();
 const replay=await fetch(origin+'/api/customer',{headers:{Cookie:`${cookie.name}=${cookie.value}`}});assert.equal((await replay.json()).customer,null);
 const login=page.getByRole('form',{name:'Sign in'});await login.getByLabel('Email address').fill('member@example.test');await login.getByLabel('Password',{exact:true}).fill('Updated strong phrase 456');
 await login.getByRole('button',{name:'Sign in',exact:true}).click();await page.getByRole('heading',{name:'Your profile.'}).waitFor();
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.getByRole('form',{name:'Sign in'}).waitFor();
 await page.screenshot({path:'test-results/customer-login.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('PASS: signup validation, login, profile persistence, password rotation, logout, CSRF, private responses and responsive 320/390/768/1440. Synthetic local accounts only.');
}finally{await browser?.close();child.kill();await new Promise(r=>child.exitCode!==null?r():child.once('exit',r));rmSync(dir,{recursive:true,force:true});}
