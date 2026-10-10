import {z} from 'zod';
import {db,audit,transaction} from './db.ts';
import {MAX_HERO_SLIDES,DEFAULT_HEADING_FONT,DEFAULT_BODY_FONT,safeFont} from './shared.ts';
export const imagePath=z.string().regex(/^\/(?:images\/[a-zA-Z0-9_-]+\.(?:webp|png|jpe?g)|media\/[a-f0-9-]+\.webp)$/,'Upload a photo or use an existing store photo.');
export const optionalImage=z.union([z.literal(''),imagePath]);
const short=z.string().trim().min(1).max(180);
/** Internal path or absolute http(s) link, used for CTA / footer targets. */
const linkPath=z.string().trim().min(1).max(500).regex(/^(?:\/(?!\/)|https?:\/\/)/,'Enter a link starting with / or https://');
const serviceItem=z.object({title:short,text:z.string().trim().max(180)});
const footerLink=z.object({label:short,href:linkPath});
const faqItem=z.object({question:short,answer:z.string().trim().min(1).max(600)});
const SERVICE_STRIP=[{title:'Considered details',text:'From the fabric to the final stitch'},{title:'Delivered to your door',text:'Shipping across Bangladesh'},{title:'Cash on delivery',text:'Pay when your order arrives'}];
const HELP_LINKS=[{label:'Delivery information',href:'/information#delivery'},{label:'Returns & exchanges',href:'/information#returns'},{label:'Contact',href:'/information#contact'},{label:'Privacy',href:'/information#privacy'}];
const MOBILE_LINKS=[{label:'About Us',href:'/information'},{label:'Contact Us',href:'/information#contact'},{label:'Privacy',href:'/information#privacy'},{label:'Delivery Policy',href:'/information#delivery'}];
const FAQ_ITEMS=[{question:'How do I choose my size?',answer:'Each product lists its available sizes and size guidance. Check the measurements for your chosen design, or contact us for help before ordering.'},{question:'Do you deliver outside Dhaka?',answer:'Choose your delivery zone at checkout to see the available delivery charge before placing your order.'},{question:'Can I pay on delivery?',answer:'Yes. Cash on delivery is the payment method available at checkout. No card or mobile banking information is collected.'},{question:'How should I care for my garments?',answer:'Follow the care label on your garment. As a general guide, wash gently with similar colours and avoid strong bleach.'}];
export const heroSlideSchema=z.object({
  id:z.string().regex(/^[a-z0-9-]{1,40}$/,'Slide ID is invalid.'),
  image:imagePath,
  // Mobile-specific image (portrait 4:5). Empty string means "no mobile variant —
  // reuse the desktop image."
  mobileImage:optionalImage.default(''),
  // Describes the photo for screen readers; falls back to the store name.
  alt:z.string().trim().max(160).default('')
});
/** Guarantees at least one slide so the homepage always has a banner. */
export function normalizeSlides(slides:unknown,fallbackImage:string){
  const parsed=z.array(heroSlideSchema).max(MAX_HERO_SLIDES).safeParse(slides);
  const valid=parsed.success&&parsed.data.length?parsed.data:null;
  if(valid){
    valid[0].image=fallbackImage;
  }
  return valid??[{id:'slide-1',image:fallbackImage,mobileImage:'',alt:''} as z.infer<typeof heroSlideSchema>];
}
/**
 * Store logo. An empty string means "no logo uploaded", and the storefront
 * falls back to the store name as text. Reuses the same path rules as images.
 */
export const logoPath=z.union([z.literal(''),imagePath]);
export const settingsSchema=z.object({
  storeName:short,logo:logoPath,
  /** Logo size as a percentage of the default, applied to header, menu and footer. */
  logoSize:z.number().int().min(40).max(220).default(100),
  /** Google Fonts family names, validated against a whitelist in lib/shared. */
  headingFont:z.string().trim().min(1).max(60).default(DEFAULT_HEADING_FONT),
  bodyFont:z.string().trim().min(1).max(60).default(DEFAULT_BODY_FONT),announcement:short,heroEyebrow:short,heroTitle:z.string().trim().min(1).max(160),heroAccent:short,heroDescription:z.string().trim().max(400),heroButton:short,heroImage:imagePath,
  // Ordered banner slides for the homepage slider. Normalized to at least one on save.
  heroSlides:z.array(heroSlideSchema).max(MAX_HERO_SLIDES).default([]),
  collectionTitle:short,featuredTitle:short,storyTitle:short,storyText:z.string().trim().max(600),
  // Homepage hero extras (button target, footnote, banner caption).
  heroButtonUrl:linkPath.default('/shop'),heroFootnoteLeft:short.default('01 — EVERYDAY ELEGANCE'),heroFootnoteRight:short.default('EST. 2026'),heroSlideCaption:short.default('THE ART OF UNDERSTATEMENT'),heroSlideUrl:linkPath.default('/shop'),
  // Homepage section headings & link labels/targets.
  collectionsEyebrow:short.default('FIND YOUR EVERYDAY'),collectionsLinkLabel:short.default('View all collections'),collectionsLinkUrl:linkPath.default('/shop'),collectionCardTag:short.default('Explore the collection'),featuredEyebrow:short.default('THE CONSIDERED EDIT'),featuredLinkLabel:short.default('Shop all pieces'),featuredLinkUrl:linkPath.default('/shop'),storyEyebrow:short.default('THE EVELIN PHILOSOPHY'),storyCtaLabel:short.default('Discover your Evelin'),storyCtaUrl:linkPath.default('/shop'),productCardCta:short.default('Explore piece'),
  // Homepage FAQ block.
  faqEyebrow:short.default('A LITTLE GUIDANCE'),faqTitle:short.default('Before you'),faqTitleAccent:short.default('make it yours.'),faqItems:z.array(faqItem).min(1).max(8).default(()=>FAQ_ITEMS.map(x=>({...x}))),
  // Header / mobile menu copy.
  navHomeLabel:short.default('Home'),navAllLabel:short.default('All collections'),searchPlaceholder:z.string().trim().max(120).default('Search panjabi, jubba, abaya…'),searchButtonLabel:short.default('Search'),bagLabel:short.default('Bag'),menuTagline:z.string().trim().max(180).default('Timeless modest wear.\nMade for your every day.'),
  // Footer content.
  serviceStrip:z.array(serviceItem).length(3).default(()=>SERVICE_STRIP.map(x=>({...x}))),footerTagline:z.string().trim().max(180).default('Rooted in tradition.\nDesigned for the way you live.'),footerExploreHeading:short.default('Explore'),footerExploreAllLabel:short.default('All collections'),footerExploreAllUrl:linkPath.default('/shop'),footerHelpHeading:short.default('Here to help'),footerHelpLinks:z.array(footerLink).length(4).default(()=>HELP_LINKS.map(x=>({...x}))),footerNoteTitle:short.default('A wardrobe with meaning.'),footerNoteText:z.string().trim().max(300).default('Explore pieces that bring together quiet elegance and everyday comfort.'),footerNoteCtaLabel:short.default('Find your next favourite'),footerNoteCtaUrl:linkPath.default('/shop'),footerCrestImage:imagePath.default('/images/footer-brand-crest.webp'),footerCrestAlt:z.string().trim().max(160).default(''),mobileFooterTagline:z.string().trim().max(180).default('Tradition in Every Thread,\nLuxury in Every Detail.'),mobileFooterLinks:z.array(footerLink).length(4).default(()=>MOBILE_LINKS.map(x=>({...x}))),mobileFooterElevate:z.string().trim().max(120).default('ELEVATE YOUR TRADITION\nWITH EVELIN'),
  contactPhone:z.string().trim().max(30),contactEmail:z.union([z.literal(''),z.string().email()]),storeAddress:z.string().trim().max(500),facebook:z.string().trim().url().or(z.literal('')).default(''),instagram:z.string().trim().url().or(z.literal('')).default(''),tiktok:z.string().trim().url().or(z.literal('')).default(''),socialX:z.string().trim().url().or(z.literal('')).default(''),
  deliveryPolicy:z.string().trim().min(5).max(5000),returnsPolicy:z.string().trim().min(5).max(5000),privacyPolicy:z.string().trim().min(5).max(5000),
  storeLive:z.boolean(),lowStockThreshold:z.number().int().min(0).max(1000),
  zones:z.array(z.object({id:z.string().regex(/^[a-z0-9-]{1,30}$/),name:short,fee:z.number().int().min(0).max(10000)})).min(1).max(20).refine(zones=>new Set(zones.map(z=>z.id)).size===zones.length,'Zone IDs must be unique.'),
  version:z.number().int().min(1)
});
export type StoreSettings=z.infer<typeof settingsSchema>;
export function defaultSettings():StoreSettings{return {
  storeName:'Evelin',logo:'',logoSize:100,headingFont:DEFAULT_HEADING_FONT,bodyFont:DEFAULT_BODY_FONT,announcement:'Thoughtfully made. Effortlessly worn.',heroEyebrow:'THE EVELIN COLLECTION',heroTitle:'Tradition,\nwith a modern',heroAccent:'point of view.',heroDescription:'Considered silhouettes. Quiet details.\nModest wear that feels like you.',heroButton:'Explore the collection',heroImage:'/images/editorial.webp',collectionTitle:'A collection for every you.',featuredTitle:'Meet your new favourites.',storyTitle:'Style that speaks softly.\nAnd says everything.',storyText:'We believe the best pieces don’t ask for attention.\nThey earn a place in your everyday.',
  heroButtonUrl:'/shop',heroFootnoteLeft:'01 — EVERYDAY ELEGANCE',heroFootnoteRight:'EST. 2026',heroSlideCaption:'THE ART OF UNDERSTATEMENT',heroSlideUrl:'/shop',
  collectionsEyebrow:'FIND YOUR EVERYDAY',collectionsLinkLabel:'View all collections',collectionsLinkUrl:'/shop',collectionCardTag:'Explore the collection',featuredEyebrow:'THE CONSIDERED EDIT',featuredLinkLabel:'Shop all pieces',featuredLinkUrl:'/shop',storyEyebrow:'THE EVELIN PHILOSOPHY',storyCtaLabel:'Discover your Evelin',storyCtaUrl:'/shop',productCardCta:'Explore piece',
  faqEyebrow:'A LITTLE GUIDANCE',faqTitle:'Before you',faqTitleAccent:'make it yours.',faqItems:FAQ_ITEMS.map(x=>({...x})),
  navHomeLabel:'Home',navAllLabel:'All collections',searchPlaceholder:'Search panjabi, jubba, abaya…',searchButtonLabel:'Search',bagLabel:'Bag',menuTagline:'Timeless modest wear.\nMade for your every day.',
  serviceStrip:SERVICE_STRIP.map(x=>({...x})),footerTagline:'Rooted in tradition.\nDesigned for the way you live.',footerExploreHeading:'Explore',footerExploreAllLabel:'All collections',footerExploreAllUrl:'/shop',footerHelpHeading:'Here to help',footerHelpLinks:HELP_LINKS.map(x=>({...x})),footerNoteTitle:'A wardrobe with meaning.',footerNoteText:'Explore pieces that bring together quiet elegance and everyday comfort.',footerNoteCtaLabel:'Find your next favourite',footerNoteCtaUrl:'/shop',footerCrestImage:'/images/footer-brand-crest.webp',footerCrestAlt:'',mobileFooterTagline:'Tradition in Every Thread,\nLuxury in Every Detail.',mobileFooterLinks:MOBILE_LINKS.map(x=>({...x})),mobileFooterElevate:'ELEVATE YOUR TRADITION\nWITH EVELIN',
  contactPhone:'',contactEmail:'',storeAddress:'Dhaka, Bangladesh',facebook:'',instagram:'',tiktok:'',socialX:'',
  deliveryPolicy:'Delivery charges are shown at checkout. Delivery timelines will be confirmed before launch.',returnsPolicy:'Our exchange window, eligibility and return delivery charges will be published before launch.',privacyPolicy:'We collect your name, phone number and delivery address to process orders. Delivery details are shared with the courier when booking a parcel. Contact the store for data requests.',  storeLive:process.env.STORE_LIVE==='true',lowStockThreshold:3,zones:[{id:'dhaka',name:'Inside Dhaka',fee:80},{id:'outside',name:'Outside Dhaka',fee:130}],heroSlides:[{id:'slide-1',image:'/images/editorial.webp',mobileImage:'',alt:''}],version:1
};}
export function getSettings():StoreSettings{const row=db().prepare("SELECT value FROM settings WHERE key='store'").get();const stored:Record<string,unknown>=row?JSON.parse(String(row.value)):{};const merged={...defaultSettings(),...stored};return {...merged,heroSlides:normalizeSlides(merged.heroSlides,merged.heroImage),headingFont:safeFont(merged.headingFont,DEFAULT_HEADING_FONT),bodyFont:safeFont(merged.bodyFont,DEFAULT_BODY_FONT)} as StoreSettings;}
export function saveSettings(raw:unknown){const value=settingsSchema.parse(raw);const slides=normalizeSlides(value.heroSlides,value.heroImage);const headingFont=safeFont(value.headingFont,DEFAULT_HEADING_FONT),bodyFont=safeFont(value.bodyFont,DEFAULT_BODY_FONT);return transaction(()=>{if(getSettings().version!==value.version)throw new Error('Settings changed in another tab. Refresh and try again.');const next={...value,heroSlides:slides,heroImage:slides[0].image,headingFont,bodyFont,version:value.version+1};db().prepare("INSERT INTO settings VALUES ('store',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(JSON.stringify(next));audit('Settings updated','Store');return next;});}
export function deliveryFor(zone:string){const match=getSettings().zones.find(z=>z.id===zone);if(!match)throw new Error('This delivery zone is no longer available. Please choose another.');return match;}
