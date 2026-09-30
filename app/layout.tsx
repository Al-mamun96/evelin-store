import {getProducts} from '@/lib/products';
import {getSettings} from '@/lib/store-settings';
import type {Metadata} from 'next';
import { ShopProvider } from '@/components/shop-provider';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileNav } from '@/components/mobile-nav';
import { fontStack, fontUrl } from '@/lib/shared';
import './globals.css';
export function generateMetadata():Metadata{const settings=getSettings();return {title:{default:settings.storeName+' — Timeless Modest Wear',template:'%s | '+settings.storeName},description:settings.heroDescription,robots:{index:settings.storeLive,follow:settings.storeLive}};}
export const dynamic='force-dynamic';
export default function Layout({children}:{children:React.ReactNode}){const settings=getSettings();
 return <html lang="en"><head>
   {/* Font families come from a fixed whitelist, so this URL cannot carry user input. */}
   <link rel="stylesheet" href={fontUrl(settings.headingFont,settings.bodyFont)}/>
   <style>{`:root{--serif:${fontStack(settings.headingFont,"Georgia,'Times New Roman',serif")};--sans:${fontStack(settings.bodyFont,'Arial,sans-serif')}}`}</style>
 </head><body><ShopProvider products={getProducts()}><a className="skip-link" href="#main">Skip to content</a><Header settings={settings}/><main id="main">{children}</main><Footer settings={settings}/><MobileNav/></ShopProvider></body></html>;}
