/**
 * Client-safe constants.
 *
 * This module must not import anything server-only. `lib/store-settings.ts`
 * pulls in `node:sqlite`, so importing a value from it inside a `'use client'`
 * component pulls `node:sqlite` into the browser chunking context and fails the
 * Next.js build with "does not support external modules (request: node:sqlite)".
 * Types are erased at compile time and are safe; plain values are not.
 */

/** Maximum banner slides on the homepage slider. */
export const MAX_HERO_SLIDES=8;

/** Milliseconds each slide stays on screen when the slider autoplays. */
export const SLIDE_INTERVAL=5000;

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

const known=[...HEADING_FONTS,...BODY_FONTS].map(f=>f.id);
/** Narrows an arbitrary string to a whitelisted family name. */
export function safeFont(value:unknown,fallback:string){
  return typeof value==='string'&&known.includes(value)?value:fallback;
}
/** Font stacks are built from whitelisted names only, never from raw input. */
export const fontStack=(family:string,fallback:string)=>`'${family}',${fallback}`;
export const fontUrl=(heading:string,body:string)=>{
  const family=(name:string)=>name.replace(/ /g,'+');
  return `https://fonts.googleapis.com/css2?family=${family(heading)}:wght@400;500;600;700&family=${family(body)}:wght@400;500;600;700&display=swap`;
};
