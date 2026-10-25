import type {Product} from './catalog.ts';
import type {StoreSettings} from './store-settings';
import {hasAvailableSize} from './seo.ts';
export function breadcrumbs(origin:string,items:{name:string;path:string}[]){
 return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,item:new URL(item.path,origin).href}))};
}
export function businessGraph(origin:string,s:StoreSettings,path='/',title=s.storeName){
 const sameAs=[...new Set([s.facebook,s.instagram,s.tiktok,s.socialX].filter(value=>/^https?:\/\//.test(value)))];
 return {'@context':'https://schema.org','@graph':[
 {'@type':'Organization','@id':origin+'/#organization',name:s.storeName,url:origin+'/',
 ...(s.logo?{logo:new URL(s.logo,origin).href}:{}),
 ...(s.contactPhone?{telephone:s.contactPhone}:{}),...(s.contactEmail?{email:s.contactEmail}:{}),
 ...(s.storeAddress?{address:s.storeAddress}:{}),...(sameAs.length?{sameAs}:{})},
 {'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:s.storeName,publisher:{'@id':origin+'/#organization'},inLanguage:'en'},
 {'@type':path==='/about'?'AboutPage':path==='/contact'?'ContactPage':'WebPage','@id':new URL(path,origin).href+'#webpage',url:new URL(path,origin).href,name:title,isPartOf:{'@id':origin+'/#website'},about:{'@id':origin+'/#organization'}}
 ]};
}
export function productSchema(origin:string,p:Product,stock:{size:string;stock:number}[],s:StoreSettings){
 const url=origin+'/products/'+p.id;
 return {'@context':'https://schema.org','@type':'Product','@id':url+'#product',url,productID:p.id,name:p.name,description:p.description,
 category:p.category,color:p.color,size:p.sizes,...(p.fabric?{material:p.fabric}:{}),
 image:[...new Set([p.image,...(p.gallery||[])])].map(image=>new URL(image,origin).href),
 ...(s.storeLive?{offers:{'@type':'Offer',url,priceCurrency:'BDT',price:p.price,
 seller:{'@type':'Organization','@id':origin+'/#organization',name:s.storeName},
 availability:'https://schema.org/'+(hasAvailableSize(p.sizes,stock)?'InStock':'OutOfStock')}}:{})};
}
export function collectionSchema(origin:string,path:string,title:string,description:string,products:Product[]){
 const url=new URL(path,origin).href;
 return {'@context':'https://schema.org','@type':'CollectionPage','@id':url+'#webpage',url,name:title,description,
 isPartOf:{'@id':origin+'/#website'},mainEntity:{'@type':'ItemList',numberOfItems:products.length,
 itemListElement:products.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.name,url:origin+'/products/'+p.id}))}};
}
