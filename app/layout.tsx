import {siteOrigin,seoDescription,isIndexable} from '@/lib/seo';
import {getProducts} from '@/lib/products';
import {getCategories} from '@/lib/categories';
import {getSettings} from '@/lib/store-settings';
import type {Metadata} from 'next';
import { ShopProvider } from '@/components/shop-provider';
import { QuickViewProvider } from '@/components/quick-view';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileNav } from '@/components/mobile-nav';
import { fontStack, fontUrl } from '@/lib/shared';
import './fonts.css';
import './globals.css';
export function generateMetadata():Metadata{const settings=getSettings();return {verification:{google:process.env.GOOGLE_SITE_VERIFICATION,other:process.env.BING_SITE_VERIFICATION?{'msvalidate.01':process.env.BING_SITE_VERIFICATION}:undefined},metadataBase:siteOrigin()?new URL(siteOrigin()!):undefined,title:{default:settings.storeName+' — Timeless Modest Wear',template:'%s | '+settings.storeName},description:seoDescription(settings.heroDescription),robots:{index:isIndexable(settings.storeLive)&&!!siteOrigin(),follow:true}};}
export const dynamic='force-dynamic';
export default function Layout({children}:{children:React.ReactNode}){const settings=getSettings(),externalFonts=fontUrl(settings.headingFont,settings.bodyFont);
 return <html lang="en"><head>
   {/* Font families come from a fixed whitelist, so this URL cannot carry user input. */}
   {externalFonts&&<><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
   <link rel="stylesheet" href={externalFonts}/></>}
   <style>{`:root{--serif:${fontStack(settings.headingFont,"Georgia,'Times New Roman',serif")};--sans:${fontStack(settings.bodyFont,'Arial,sans-serif')}}`}</style>
 </head><body><ShopProvider products={getProducts()} categories={getCategories()}><QuickViewProvider storeName={settings.storeName}><a className="skip-link" href="#main">Skip to content</a><Header settings={settings}/><main id="main">{children}</main><Footer settings={settings}/><MobileNav whatsapp={settings.whatsappNumber} phone={settings.contactPhone}/></QuickViewProvider></ShopProvider></body></html>;}
