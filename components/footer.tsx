import {Fragment} from 'react';
import {getProducts} from '@/lib/products';
import Link from 'next/link';
import Image from 'next/image';
import type {StoreSettings} from '@/lib/store-settings';
import { ArrowUpRight,PackageCheck,Truck,ShieldCheck,Mail } from 'lucide-react';
import { StoreLogo } from './store-logo';

const serviceIcons=[PackageCheck,Truck,ShieldCheck];

export function Footer({settings}:{settings:StoreSettings}){
  const categories=[...new Set(getProducts().map(p=>p.category))];
  const {facebook,instagram,tiktok,socialX,contactEmail}=settings;
  const mobileTagline=settings.mobileFooterTagline.split('\n');

  return (
    <>
      <section className="service-strip">
        {settings.serviceStrip.map(({title,text},i)=>{const Icon=serviceIcons[i]??PackageCheck;return <div key={title+i}><Icon/><span>{title}<small>{text}</small></span></div>;})}
      </section>

      <footer>
        {/* Desktop View Footer */}
        <div className="desktop-footer">
          <div className="footer-main">
            <div>
              <Link className="wordmark-link" href="/">
                <StoreLogo logo={settings.logo} storeName={settings.storeName} logoSize={settings.logoSize}/>
              </Link>
              <p style={{whiteSpace:"pre-line"}}>{settings.footerTagline}</p>
              <span className="footer-location">{settings.storeAddress}</span>
              {settings.contactPhone&&<a href={"tel:"+settings.contactPhone}>{settings.contactPhone}</a>}
              {contactEmail&&<a href={"mailto:"+contactEmail}>{contactEmail}</a>}
            </div>
            <div className="footer-nav">
              <h3>{settings.footerExploreHeading}</h3>
              <Link href={settings.footerExploreAllUrl}>{settings.footerExploreAllLabel}</Link>
              {categories.slice(0,3).map(category=><Link key={category} href={'/shop?category='+encodeURIComponent(category)}>{category}</Link>)}
            </div>
            <div className="footer-nav">
              <h3>{settings.footerHelpHeading}</h3>
              {settings.footerHelpLinks.map(link=><Link key={link.label+link.href} href={link.href}>{link.label}</Link>)}
            </div>
            <div className="footer-social">
              {facebook&&<a href={facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0h-21.35C.595 0 0 .593 0 1.33v21.342C0 24.104.595 24 1.326 24c.346 0 .691-.008.987-.024V14.707h-2.55V11.04h2.375V8.413c0-2.36 1.38-3.667 3.515-3.667 1.01 0 1.882.076 2.157.109v2.554h-1.49c-1.166 0-1.4.546-1.4 1.38v1.95h2.81l-.365 3.66h-2.435V24c.585.016.972.024 1.294.024 2.56 0 4.32-2.126 4.32-4.495V1.33c0-.737-.6-1.33-1.33-1.33z"/></svg></a>}
              {instagram&&<a href={instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 11.11.072 13.95.128 15.77.347 17.24.678 18.48.97 19.5 1.486 20.375 2.275.9.8 1.4 1.825 1.7 3.06.338 1.47.548 1.857.604 8.61.02 2.716 0 3.295-.06 11.37-.06 2.45-.25 3.295-.55 4.31-.4 1.27-.86 2.285-2.04 3.46-.875.875-1.895 1.44-3.16 1.99-.865.34-1.31.47-1.8.51-.06.005-.12.008-.18.012.19.46.45.75.75 1.04.83.82 1.82 1.4 2.98 1.77 1.32.42 1.69.59 2.73.61.21.003.42.004.61.004 2.56-.002 3.75-.017 5.09-.385.95-.23 1.79-.53 2.59-.93.73-.36 1.4-1.13 1.6-1.93.04-.11.08-.22.11-.33v.81c0 2.23-.015 3.42-.06 11.4-.04 3.7-.28 5.61-1.1 7.13-.4.75-1.1 1.39-1.91 1.84-.75.43-1.6.7-2.7.87-.27.04-.55.06-.82.08.19.46.42.89.68 1.25.86.85 1.69 1.58 2.64 2.12 1.16.66 2.33 1.1 3.7.94.68-.07 1.33-.19 1.97-.42 2.06-.7 3.74-2.2 4.92-4.06 1.02-1.61 1.76-3.39 2.03-5.6.06-.28.11-.56.14-.84.15-1.63.2-2.65.2-3.36v-.03c-.01-3.8-.02-7.1-.06-11.3-.01-1.3-.1-2.1-.3-3.2-.1-.4-.2-.8-.4-1.2-.2-.4-.4-.8-.7-1.2-.2-.3-.4-.7-.7-1-1.13-1.06-2.38-1.75-3.82-2.02-1.36-.25-2.7-.2-2.7-.2z"/><circle cx="12" cy="12" r="3.938"/></svg></a>}
              {tiktok&&<a href={tiktok} target="_blank" rel="noreferrer" aria-label="TikTok"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.2 4.8c0-2.5-2-4.5-4.5-4.5-.8 0-1.6.2-2.2.5 2.7.8 4.7 3 4.7 5.8v3.2h-2.5V5.8c0-1.8-1.5-3.2-3.3-3.3 0 .1 0 .2-.1.2v5.5c0 1.8-1.5 3.3-3.3 3.3s-3.3-1.5-3.3-3.3C6.46 8.5 8.11 6.84 9.91 6.84V6.7c-1.8-.9-3.19-2.66-3.19-4.72 0-2.9 2.36-5.26 5.26-5.26 2.17 0 3.91 1.25 4.71 3.05.77-.3 1.59-.47 2.45-.47.03.29.07.68.07 1.1.01 0 .01.01 0 .02z"/></svg></a>}
              {socialX&&<a href={socialX} target="_blank" rel="noreferrer" aria-label="X"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.24 2.25h3.31l-7.23 8.67 8.89 11.83h-6.41l-4.73-6.4-5.44 6.4H3.5l7.7-9.21-7.9-9.07H8.08l7.03 9.41 5.13-5.98Zm-1.13 15.5.04.06.04.06-5.37-7.17-5.3 6.34h-4.4l6.88-8.14-7.13-9.38h4.5l5.86 7.76 4.9-5.78h4.2l-7.65 8.98v.04Z"/></svg></a>}
            </div>
            <div className="footer-links-mobile">
              {settings.footerHelpLinks.map(link=><Link key={link.label+link.href} href={link.href}>{link.label}</Link>)}
            </div>
            <div className="footer-note">
              <h3>{settings.footerNoteTitle}</h3>
              <p>{settings.footerNoteText}</p>
              <Link href={settings.footerNoteCtaUrl}>{settings.footerNoteCtaLabel} <ArrowUpRight size={17}/></Link>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</span>
          </div>
        </div>

        {/* Dedicated Mobile View Footer (Styled as requested) */}
        <div className="mobile-footer">
          <div className="mobile-footer-crest">
            <Image
              src={settings.footerCrestImage}
              alt={settings.footerCrestAlt||settings.storeName}
              width={260}
              height={364}
              priority={false}
              className="mobile-footer-crest-img"
            />
          </div>

          <p className="mobile-footer-tagline">
            {mobileTagline[0]}{mobileTagline.length>1&&<><br/><em>{mobileTagline.slice(1).join(' ')}</em></>}
          </p>

          <div className="mobile-footer-divider" aria-hidden="true">
            <span className="divider-line" />
            <span className="divider-diamond">❖</span>
            <span className="divider-line" />
          </div>

          {/* 4 Important Links above social links */}
          <nav className="mobile-footer-nav" aria-label="Important links">
            {settings.mobileFooterLinks.map((link,i)=><Fragment key={link.label+link.href}>{i>0&&<span className="nav-separator">·</span>}<Link href={link.href}>{link.label}</Link></Fragment>)}
          </nav>

          {/* Contact email */}
          {contactEmail&&<a href={`mailto:${contactEmail}`} className="mobile-footer-email">
            <Mail size={15} />
            <span>{contactEmail}</span>
          </a>}

          {/* 4 Social links */}
          <div className="mobile-footer-socials" aria-label="Social media">
            {facebook&&<a href={facebook} target="_blank" rel="noreferrer" className="mobile-footer-social-btn" aria-label="Facebook">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>}
            {instagram&&<a href={instagram} target="_blank" rel="noreferrer" className="mobile-footer-social-btn" aria-label="Instagram">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>}
            {tiktok&&<a href={tiktok} target="_blank" rel="noreferrer" className="mobile-footer-social-btn" aria-label="TikTok">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.29 6.29 0 0 0 1.96-4.49V8.89a8.28 8.28 0 0 0 5.21 1.83V7.27a4.85 4.85 0 0 1-1.4-.58z"/>
              </svg>
            </a>}
            {socialX&&<a href={socialX} target="_blank" rel="noreferrer" className="mobile-footer-social-btn" aria-label="X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>}
          </div>

          <div className="mobile-footer-divider" aria-hidden="true">
            <span className="divider-line" />
            <span className="divider-diamond">❖</span>
            <span className="divider-line" />
          </div>

          <div className="mobile-footer-elevate">
            <span style={{whiteSpace:"pre-line"}}>{settings.mobileFooterElevate}</span>
          </div>

          <div className="mobile-footer-copy">
            <span>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
