export function siteOrigin(value=process.env.NEXT_PUBLIC_SITE_URL):string|undefined{
 if(!value?.trim())return undefined;
 try{const url=new URL(value.trim());if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.pathname!=='/'||url.search||url.hash)return undefined;return url.origin;}catch{return undefined;}
}
export function seoDescription(text:string){return text.replace(/\s+/g,' ').trim().slice(0,160);}
export function serializeJsonLd(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c');}
export function hasAvailableSize(sizes:string[],stock:{size:string;stock:number}[]){return stock.some(row=>sizes.includes(row.size)&&row.stock>0);}

// Confirmed by the owner; never infer the public origin from an untrusted request host.
export const PUBLIC_STORE_ORIGIN='https://evelinbd.site';
// Public catalog indexing is independent of taking orders on the confirmed live site.
export function isIndexable(storeLive:boolean,override=process.env.SEO_INDEXABLE,origin=siteOrigin()){if(override==='false')return false;if(override==='true')return true;return origin===PUBLIC_STORE_ORIGIN||storeLive;}
