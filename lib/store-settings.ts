import {z} from 'zod';
import {db,audit,transaction} from './db.ts';
export const imagePath=z.string().regex(/^\/(?:images\/[a-zA-Z0-9_-]+\.(?:webp|png|jpe?g)|media\/[a-f0-9-]+\.webp)$/,'Upload a photo or use an existing store photo.');
const short=z.string().trim().min(1).max(180);
export const MAX_HERO_SLIDES=8;
export const heroSlideSchema=z.object({
  id:z.string().regex(/^[a-z0-9-]{1,40}$/,'Slide ID is invalid.'),
  image:imagePath,
  // Describes the photo for screen readers; falls back to the store name.
  alt:z.string().trim().max(160).default('')
});
/** Guarantees at least one slide so the homepage always has a banner. */
export function normalizeSlides(slides:unknown,fallbackImage:string){
  const parsed=z.array(heroSlideSchema).max(MAX_HERO_SLIDES).safeParse(slides);
  const valid=parsed.success&&parsed.data.length?parsed.data:null;
  return valid??[{id:'slide-1',image:fallbackImage,alt:''} as z.infer<typeof heroSlideSchema>];
}
export const settingsSchema=z.object({
  storeName:short,announcement:short,heroEyebrow:short,heroTitle:z.string().trim().min(1).max(160),heroAccent:short,heroDescription:z.string().trim().max(400),heroButton:short,heroImage:imagePath,
  // Ordered banner slides for the homepage slider. Normalized to at least one on save.
  heroSlides:z.array(heroSlideSchema).max(MAX_HERO_SLIDES).default([]),
  collectionTitle:short,featuredTitle:short,storyTitle:short,storyText:z.string().trim().max(600),
  contactPhone:z.string().trim().max(30),contactEmail:z.union([z.literal(''),z.string().email()]),storeAddress:z.string().trim().max(500),
  deliveryPolicy:z.string().trim().min(5).max(5000),returnsPolicy:z.string().trim().min(5).max(5000),privacyPolicy:z.string().trim().min(5).max(5000),
  storeLive:z.boolean(),lowStockThreshold:z.number().int().min(0).max(1000),
  zones:z.array(z.object({id:z.string().regex(/^[a-z0-9-]{1,30}$/),name:short,fee:z.number().int().min(0).max(10000)})).min(1).max(20).refine(zones=>new Set(zones.map(z=>z.id)).size===zones.length,'Zone IDs must be unique.'),
  version:z.number().int().min(1)
});
export type StoreSettings=z.infer<typeof settingsSchema>;
export function defaultSettings():StoreSettings{return {
  storeName:'Evelin',announcement:'Thoughtfully made. Effortlessly worn.',heroEyebrow:'THE EVELIN COLLECTION',heroTitle:'Tradition,\nwith a modern',heroAccent:'point of view.',heroDescription:'Considered silhouettes. Quiet details.\nModest wear that feels like you.',heroButton:'Explore the collection',heroImage:'/images/editorial.webp',collectionTitle:'A collection for every you.',featuredTitle:'Meet your new favourites.',storyTitle:'Style that speaks softly.\nAnd says everything.',storyText:'We believe the best pieces don’t ask for attention.\nThey earn a place in your everyday.',contactPhone:'',contactEmail:'',storeAddress:'Dhaka, Bangladesh',
  deliveryPolicy:'Delivery charges are shown at checkout. Delivery timelines will be confirmed before launch.',returnsPolicy:'Our exchange window, eligibility and return delivery charges will be published before launch.',privacyPolicy:'We collect your name, phone number and delivery address to process orders. Delivery details are shared with the courier when booking a parcel. Contact the store for data requests.',  storeLive:process.env.STORE_LIVE==='true',lowStockThreshold:3,zones:[{id:'dhaka',name:'Inside Dhaka',fee:80},{id:'outside',name:'Outside Dhaka',fee:130}],heroSlides:[{id:'slide-1',image:'/images/editorial.webp',alt:''}],version:1
};}
export function getSettings():StoreSettings{const row=db().prepare("SELECT value FROM settings WHERE key='store'").get();const stored:Record<string,unknown>=row?JSON.parse(String(row.value)):{};const merged={...defaultSettings(),...stored};return {...merged,heroSlides:normalizeSlides(merged.heroSlides,merged.heroImage)} as StoreSettings;}
export function saveSettings(raw:unknown){const value=settingsSchema.parse(raw);const slides=normalizeSlides(value.heroSlides,value.heroImage);return transaction(()=>{if(getSettings().version!==value.version)throw new Error('Settings changed in another tab. Refresh and try again.');const next={...value,heroSlides:slides,heroImage:slides[0].image,version:value.version+1};db().prepare("INSERT INTO settings VALUES ('store',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(JSON.stringify(next));audit('Settings updated','Store');return next;});}
export function deliveryFor(zone:string){const match=getSettings().zones.find(z=>z.id===zone);if(!match)throw new Error('This delivery zone is no longer available. Please choose another.');return match;}
