import {getProducts} from '@/lib/products';
import {getSettings} from '@/lib/store-settings';
import type {Metadata} from 'next';
import { ShopProvider } from '@/components/shop-provider';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import './globals.css';
export function generateMetadata():Metadata{const settings=getSettings();return {title:{default:settings.storeName+' — Timeless Modest Wear',template:'%s | '+settings.storeName},description:settings.heroDescription,robots:{index:settings.storeLive,follow:settings.storeLive}};}
export const dynamic='force-dynamic';
export default function Layout({children}:{children:React.ReactNode}){const settings=getSettings();return <html lang="en"><body><ShopProvider products={getProducts()}><a className="skip-link" href="#main">Skip to content</a><Header settings={settings}/><main id="main">{children}</main><Footer settings={settings}/></ShopProvider></body></html>;}
