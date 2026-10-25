import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const directory=mkdtempSync(join(tmpdir(),'evelin-seo-crawl-'));
const origin='http://127.0.0.1:3102';
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3102'],{
 env:{...process.env,NEXT_PUBLIC_SITE_URL:origin,DATABASE_PATH:join(directory,'store.sqlite'),STORE_LIVE:'true',SEO_INDEXABLE:'true',GOOGLE_SITE_VERIFICATION:'test-google-token',BING_SITE_VERIFICATION:'test-bing-token'},stdio:'ignore'});
const decode=s=>s.replace(/&amp;/g,'&').replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const bodyOnly=html=>html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const schemas=html=>[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>{const j=JSON.parse(m[1]);return Array.isArray(j)?j:j['@graph']||[j];});
const canonical=html=>decode(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]||'');
const links=html=>[...bodyOnly(html).matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(m=>new URL(decode(m[1]),origin)).filter(u=>u.origin===origin);
const htmlPages=new Map(),discovered=new Set(),timings=[];
async function read(path){const start=performance.now();const r=await fetch(new URL(path,origin),{redirect:'manual'});const html=await r.text();timings.push(performance.now()-start);return {r,html};}
try{
 for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 const {html:xml}=await read('/sitemap.xml');
 const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>decode(m[1]));
 assert.ok(urls.length>10);
 for(const url of urls){
  const {r,html}=await read(url);assert.equal(r.status,200,url);assert.equal(new URL(canonical(html)).href,url,url);
  assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(html),url);
  const visible=bodyOnly(html),h1=[...visible.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
  assert.equal(h1.length,1,url);assert.ok(h1[0][1].replace(/<[^>]+>/g,'').trim(),url);
  assert.match(html,/<meta name="description" content="[^"]+"/);
  for(const img of visible.matchAll(/<img\b[^>]*>/g))assert.match(img[0],/\balt="/);
  for(const item of schemas(html)){
   assert.ok(item['@type']);
   if(item['@type']==='Product'){
    assert.ok(visible.includes(item.name));assert.ok(item.category);assert.ok(item.color);assert.ok(item.size.length);
    assert.equal(item.offers.priceCurrency,'BDT');assert.ok(item.offers.price>0);
    assert.ok(!item.aggregateRating&&!item.review);
    for(const image of item.image)assert.equal((await fetch(image)).status,200,image);
   }
   if(item['@type']==='CollectionPage'){
    const listing=item.mainEntity;assert.equal(listing.numberOfItems,listing.itemListElement.length);
    for(const entry of listing.itemListElement)assert.ok(links(html).some(link=>link.href===entry.url));
   }
  }
  htmlPages.set(url,html);
 }
 // Follow rendered anchors, not the sitemap, to prove discovery from the homepage.
 const queue=[origin+'/'],seen=new Set();
 while(queue.length){
  const url=queue.shift();if(seen.has(url))continue;seen.add(url);
  const html=htmlPages.get(url);if(!html)continue;
  for(const link of links(html)){link.hash='';discovered.add(link.href);if(htmlPages.has(link.href)&&!seen.has(link.href))queue.push(link.href);}
 }
 for(const url of urls)assert.ok(url===origin+'/'||discovered.has(url),'Orphan URL: '+url);
 const titles=[...htmlPages.values()].map(html=>html.match(/<title>(.*?)<\/title>/)?.[1]);assert.equal(new Set(titles).size,titles.length,'Duplicate titles');
 const descriptions=[...htmlPages.values()].map(html=>html.match(/<meta name="description" content="([^"]*)"/)?.[1]);assert.equal(new Set(descriptions).size,descriptions.length,'Duplicate descriptions');
 for(const path of ['/cart','/checkout','/account','/admin','/shop?q=panjabi','/shop?category=Panjabi&sort=price','/shop?category=Panjabi&category=Abaya']){
  const {r,html}=await read(path);assert.equal(r.status,200);assert.match(html,/<meta name="robots" content="[^"]*noindex/);
 }
 for(const path of ['/shop?category=Unknown','/products/does-not-exist','/missing-page'])assert.equal((await read(path)).r.status,404,path);
 assert.equal(canonical((await read('/shop?category=Panjabi&utm_source=test')).html),origin+'/shop?category=Panjabi');
 const home=htmlPages.get(origin+'/');
 assert.match(home,/name="google-site-verification" content="test-google-token"/);
 assert.match(home,/name="msvalidate.01" content="test-bing-token"/);
 assert.ok(schemas(home).some(s=>s['@type']==='Organization'));
 assert.ok(schemas(home).some(s=>s['@type']==='WebSite'));
 assert.match(home,/<picture>/);assert.match(home,/fetchPriority="high"/i);
 assert.ok(links(htmlPages.get(origin+'/shop')).some(u=>u.searchParams.get('category')==='Katua'));
 const robots=(await read('/robots.txt')).html;assert.ok(robots.includes('Sitemap: '+origin+'/sitemap.xml'));assert.ok(!robots.includes('Disallow: /products'));
 // Check all rendered local navigation targets; fragments are checked against actual IDs.
 let checkedLinks=0;
 for(const html of htmlPages.values()){
  for(const link of links(html)){
   if(link.pathname.startsWith('/api/')||link.pathname.startsWith('/admin/'))continue;
   const key=link.origin+link.pathname+link.search;
   let target=htmlPages.get(key);
   if(!target){const result=await read(key);assert.ok(result.r.status<400,'Broken link: '+key);target=result.html;htmlPages.set(key,target);}
   if(link.hash)assert.ok(target.includes('id="'+decodeURIComponent(link.hash.slice(1))+'"'),'Broken anchor: '+link.href);
   checkedLinks++;
  }
 }
 console.log(JSON.stringify({result:'PASS',sitemapPages:urls.length,discoveredIndexablePages:urls.filter(u=>seen.has(u)).length,checkedLinks,uniqueTitles:titles.length,uniqueDescriptions:descriptions.length,schemas:'parsed and asserted',localMedianResponseMs:Math.round(timings.sort((a,b)=>a-b)[Math.floor(timings.length/2)]),note:'Local HTTP timings are not Lighthouse scores or field Core Web Vitals.'},null,2));
}finally{
 child.kill();await new Promise(resolve=>child.once('exit',resolve));
 rmSync(directory,{recursive:true,force:true});
}
