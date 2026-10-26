import {localFonts} from './local-fonts.ts';
/**
 * Client-safe constants.
 *
 * This module must not import anything server-only. `lib/store-settings.ts`
 * pulls in `node:sqlite`; importing a value from it inside a `'use client'`
 * component would pull `node:sqlite` into the browser chunking context.
 * The build script uses `--webpack` (see package.json) to avoid Turbopack's
 * inability to handle the `node:sqlite` external module, but the import
 * boundary between client-safe constants and server-only settings remains
 * necessary: only values are re-exported here, never the server module itself.
 * Types are erased at compile time and are safe; plain values are not.
 */

/** Maximum banner slides on the homepage slider. */
export const MAX_HERO_SLIDES=8;

/** Milliseconds each slide stays on screen when the slider autoplays. */
export const SLIDE_INTERVAL=3000;

/**
 * Google Fonts offered for storefront typography. Every entry must be a real
 * family name on fonts.googleapis.com; the layout builds the stylesheet URL
 * from these ids. A font is never typed as free text, so an untrusted string
 * cannot reach the generated `style` or `href`.
 */
export const HEADING_FONTS=[
  {id:'Italiana',label:'Italiana'},
  {id:'Playfair Display',label:'Playfair Display'},
  {id:'DM Serif Display',label:'DM Serif Display'},
  {id:'Cormorant Garamond',label:'Cormorant Garamond'},
  {id:'EB Garamond',label:'EB Garamond'},
  {id:'Libre Baskerville',label:'Libre Baskerville'},
  {id:'Spectral',label:'Spectral'},
  {id:'Lora',label:'Lora'},
  {id:'Merriweather',label:'Merriweather'},
  {id:'Crimson Text',label:'Crimson Text'}
] as const;

export const BODY_FONTS=[
  {id:'DM Sans',label:'DM Sans'},
  {id:'Inter',label:'Inter'},
  {id:'Manrope',label:'Manrope'},
  {id:'Work Sans',label:'Work Sans'},
  {id:'Karla',label:'Karla'},
  {id:'Outfit',label:'Outfit'},
  {id:'Figtree',label:'Figtree'},
  {id:'Lato',label:'Lato'},
  {id:'Montserrat',label:'Montserrat'},
  {id:'Poppins',label:'Poppins'},
  {id:'Raleway',label:'Raleway'},
  {id:'Nunito',label:'Nunito'},
  {id:'Rubik',label:'Rubik'},
  {id:'Open Sans',label:'Open Sans'}
] as const;

export const DEFAULT_HEADING_FONT='Italiana';
export const DEFAULT_BODY_FONT='DM Sans';

const known:string[]=[...HEADING_FONTS,...BODY_FONTS].map(f=>f.id);
/**
 * Narrows an arbitrary string to a whitelisted family name.
 *
 * Returns the plain `string` type rather than a union of literals: the value
 * flows into CSS and a URL, and keeping the literal union here would make every
 * caller that passes a validated `string` fail to type check.
 */
export function safeFont(value:unknown,fallback:string):string{
  return typeof value==='string'&&known.includes(value)?value:fallback;
}
/** Font stacks are built from whitelisted names only, never from raw input. */
export const fontStack=(family:string,fallback:string)=>`'${localFonts[family]||family}',${fallback}`;
export const fontUrl=(heading:string,body:string)=>{
  // Keep Inter for the existing menu typography, but load each family only once.
  const families=[...new Set([heading,body,'Inter'])].filter(name=>!localFonts[name]).map(name=>{
    const weights=['Italiana','DM Serif Display'].includes(name)?'400':name==='DM Sans'?'400;450;500;550;600;650;700':'400;500;600;700';
    return 'family='+name.replace(/ /g,'+')+':wght@'+weights;
  });
  return families.length?'https://fonts.googleapis.com/css2?'+families.join('&')+'&display=swap':'';
};

/**
 * Builds a wa.me chat link from a WhatsApp/phone number, normalising Bangladesh
 * numbers to the 88 country code. Returns an empty string when no number is set.
 */
export function whatsappLink(number:string|undefined|null):string{
  let digits=(number||'').replace(/\D/g,'');
  if(digits.startsWith('00'))digits=digits.slice(2);
  else if(digits.startsWith('0'))digits='88'+digits;
  else if(digits&&!digits.startsWith('88'))digits='88'+digits;
  return digits?'https://wa.me/'+digits:'';
}
