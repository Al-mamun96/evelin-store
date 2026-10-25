import type {Product} from './catalog.ts';
export function categoryUrl(category:string){return '/shop?'+new URLSearchParams({category});}
export function catalogSummary(products:Product[],category?:string){
 const selected=category?products.filter(p=>p.category===category):products;
 const heading=category?category+' Collection':'Shop the Collection';
 if(!selected.length)return {heading,description:category?'There are currently no published products in this collection.':'Browse the store collections.',sizes:[],fabrics:[]};
 const names=[...new Set(selected.map(p=>p.category))];
 const colors=[...new Set(selected.map(p=>p.color).filter(Boolean))];
 const fabrics=[...new Set(selected.map(p=>p.fabric).filter(Boolean))];
 const sizes=[...new Set(selected.flatMap(p=>p.sizes))];
 const prices=selected.map(p=>p.price),min=Math.min(...prices),max=Math.max(...prices);
 const price=min===max?'৳'+min.toLocaleString('en-BD'):'৳'+min.toLocaleString('en-BD')+'–৳'+max.toLocaleString('en-BD');
 return {heading,description:category
 ?selected.length+' '+category+' designs, '+price+'. Colours include '+colors.slice(0,4).join(', ')+'. Check each product for available sizes.'
 :'Explore '+names.slice(0,6).join(', ')+'. View product details, current prices and available sizes.',
 sizes,fabrics};
}
export function homeSummary(storeName:string,products:Product[]){
 const names=[...new Set(products.map(p=>p.category))];
 return storeName+' is a Bangladesh-focused fashion store.'+(names.length?' Explore '+names.slice(0,6).join(', ')+' collections.':'');
}
export function productSummary(p:Product){return p.name+' — '+p.color+' '+p.category+(p.fabric?', '+p.fabric:'')+'. '+p.description;}
export function relatedProducts(products:Product[],product:Product){
 return products.filter(p=>p.id!==product.id).sort((a,b)=>Number(b.category===product.category)-Number(a.category===product.category)).slice(0,4);
}
export type ShopParams=Record<string,string|string[]|undefined>;
export function normalizeShopParams(params:ShopParams){
 const first=(value:string|string[]|undefined)=>Array.isArray(value)?value[0]||'':value||'';
 const category=first(params.category),query=first(params.q);
 const secondary=Object.keys(params).some(key=>key!=='category'&&key!=='q'&&!/^utm_/i.test(key)&&!['gclid','fbclid','msclkid'].includes(key));
 return {category,query,noindex:params.q!==undefined||Array.isArray(params.category)||secondary};
}
