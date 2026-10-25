# Evelin SEO implementation and crawl report

Date: 2026-10-26. Baseline: commit 091a070. Scope: repository source and an isolated production-build test server; no live domain was supplied. This is not a Search Console, Bing, Lighthouse, Core Web Vitals or ranking report.

## Baseline architecture

Next.js 16.3.4 App Router, React 19, TypeScript, webpack production build and standalone Node deployment. Public pages are dynamically server-rendered with client hydration for cart, product selection and filters. Client components already contribute initial product HTML; they were not assumed to be client-only. SQLite supplies published products, stock, categories, settings and orders. The custom authenticated Store Studio is the CMS. HMAC-signed HTTP-only admin sessions and origin checks protect mutation APIs. Next image optimization, WebP uploads and long-lived upload caching already exist.

Baseline inspection covered routing, public/catalog components, metadata helpers, sitemap/robots, database/settings/category/product sources, auth/API boundaries, image loading, global responsive CSS and test infrastructure. The isolated baseline crawl ran before edits. Existing .commandcode user changes were excluded.

## Baseline vs implemented state

| Area | Before this pass | After this pass |
| --- | --- | --- |
| Category H1 | Every collection said “Made to be yours.” | Category-specific visible H1; All collections has its own H1 |
| Category description | Repeated generic description | Actual product count, price range and colours; sizes/fabrics in visible guidance |
| Category navigation | JavaScript buttons | Crawlable links to existing /shop?category= URLs |
| Unknown category | HTTP 200 empty results | HTTP 404; registered empty collections remain accessible with noindex |
| Homepage mobile | Entire hero copy, including H1, hidden | Existing title/description visible below the banner, with a factual store/catalog sentence |
| Business entities | None | Organization, WebSite and relevant WebPage/AboutPage/ContactPage |
| Category entities | None | CollectionPage, ItemList, BreadcrumbList matching the displayed initial listing |
| Product entity | Name, description, images and Offer | Stable identity, canonical URL, category, colour, listed sizes, fabric and seller reference |
| Product details | Hardcoded category-dependent bundle claims | Stored fabric/description; actual available-size text and accessible size guidance |
| Related products | First four other products | Same-category products first, then other products |
| Search/facets | Partial parameter handling | Search, repeated category and extra facets noindex; tracking parameters canonicalize to the collection |
| Ordering vs indexing | Pausing orders always removed indexing | Optional SEO_INDEXABLE override preserves indexing during order pauses |
| Mobile banner image | Separate image elements, including hidden desktop priority image | One picture/img with responsive source selection and high priority for the first slide |
| Fonts | Google Fonts stylesheet with swap | Same fonts plus preconnections |
| Crawl regression | Limited page checks | Reusable sitemap + internal-link crawl and structured-data assertions |

No existing route was renamed. No schema, migrations or live database contents were changed. No ratings, testimonials, prices, product genders, manufacturers, SKUs or policy details were fabricated. The internal product identifier is explicitly productID, not an invented SKU. Visual colour variations remain the existing selection interface; they are not falsely represented as independently priced/stocked ProductGroup variants.

## URL and indexation map

All public indexability requires a valid configured NEXT_PUBLIC_SITE_URL and indexing enabled. SEO_INDEXABLE=true/false explicitly controls it; an unset value preserves the prior storeLive fallback.

| URL class | Decision | Canonical/discovery |
| --- | --- | --- |
| / | Index | Self; Organization/WebSite/WebPage |
| /shop | Index when catalog has products | Self; navigation and sitemap |
| /shop?category=Known | Index when populated | Same existing category URL; tabs, breadcrumbs, sitemap |
| Registered empty collection | Noindex | Accessible to customers; excluded from sitemap |
| Unknown category | 404 | Not in sitemap |
| /products/id | Index if published | Self; category grid, related links, sitemap |
| Draft/deleted/missing product | 404 | Not publicly listed or in sitemap |
| /about, /contact, /delivery, /privacy, /information, /reviews | Index | Self; existing content and navigation |
| /shop?q=... including empty q | Noindex, follow | Base shop/category canonical |
| Sort/size/colour/extra facet parameters, repeated category | Noindex, follow | Base shop/category canonical |
| utm_*, gclid, fbclid, msclkid | Canonical consolidation | Base shop/category canonical |
| /cart, /checkout, /account, /admin and invoices | Noindex | Existing access controls preserved |
| /api/* | Robots disallow | No sitemap entries |
| Product images, /media/*, /_next/* | Crawlable | Existing image optimization and cache handling |

No artificial subcategories or buying-guide routes were generated. All existing products are reachable through Home → All collections/category → Product. Related products and breadcrumbs reinforce that hierarchy. A Reviews link in Store information closes a discovery gap without rewriting configurable footer menus.

Robots always references the sitemap when an origin is configured, including an empty sitemap on a noindex store. Page crawling remains allowed so engines can read noindex. No engine-specific AI crawler restrictions or special “AI optimization” files were introduced.

## Validation evidence

- TypeScript and production webpack build: passed.
- Unit/integration suite: 34 tests passed.
- Production HTTP suite: passed, including authentication, origin checks, checkout totals/idempotency, order edits, stock reconciliation, product CRUD, uploads, settings, empty categories, sitemap changes and paused checkout.
- Final local crawl: 19 sitemap pages, all 19 discovered through rendered links from the homepage.
- 19 unique titles and 19 unique descriptions.
- 995 rendered local-link occurrences checked without a broken target or missing fragment.
- Each sitemap page: HTTP 200, one nonempty H1, self-canonical, indexable metadata, meta description, image alt attributes.
- Product image URLs returned 200. Product schema price/currency/availability and listing links were asserted against rendered content and fixtures.
- Product deletion and unknown categories/products return 404.
- Search/facet noindex, tracking canonical, Google/Bing verification tags, Organization/WebSite entities and picture/high-priority image output asserted.
- JSON-LD parsing, escaping, required fields, breadcrumbs and catalog/schema consistency covered. No external Schema.org/Rich Results validator run is claimed.
- Local median HTTP response in the final crawl: 14 ms. This says nothing about live hosting latency, LCP, CLS or INP.
- Browser preview failed to initialize with a local sandbox ACL error. Mobile source/responsive rules were inspected, but screenshot, touch and real-device layout validation remain unverified.
- Final diff checks passed. Existing unrelated .commandcode changes were preserved.

Commands: npm test; npm run build; npm run test:http; npm run test:seo.

## Provisional implementation readiness scores

These are a transparent project checklist, not a standardized SEO tool score, Google ranking forecast, or measured AI visibility. Each category uses ten equally weighted controls (10 points each). Unverified controls receive zero rather than assumed credit. Overall is the equal mean of the seven categories.

| Category | Score | Evidence/control rubric |
| --- | ---: | --- |
| Technical SEO | 90/100 | Passed: SSR HTML, successful fetch, real 404s, canonical handling, dynamic sitemap, robots/noindex, utility exclusion, parameter handling, internal discovery. Unverified: production deployment/CDN behavior. |
| On-page SEO | 80/100 | Passed: page titles, descriptions, one H1, category context, readable attributes, breadcrumbs, alt text, related links. Pending: owner-reviewed homepage/category editorial copy; live visual/mobile review. |
| E-commerce SEO | 80/100 | Passed: published-product filtering, price, currency, inventory availability, categories, product discovery, variants not duplicating URLs, policy links. Pending: final owner-approved policies/measurements; actual colour-variant inventory model. |
| Structured data | 90/100 | Passed: valid JSON, safe embedding, Product, Offer, BreadcrumbList, Organization, WebSite, CollectionPage/ItemList, source-backed fields. Pending: external validator/live rich-result inspection. |
| AEO readiness | 80/100 | Passed: factual homepage context, category facts, price text, available sizes, fabric, contact source, policy access, initial HTML extraction. Pending: owner-reviewed original buying/fit guidance; actual answer-engine retrieval testing. |
| GEO / AI search readiness | 80/100 | Passed: entity identity, canonical source, linked catalog hierarchy, entity relationships, factual structured data, public crawl access, consistent catalog data, no manipulative pages/claims. Pending: verified live engine access; measured indexing/citation evidence. |
| Performance preparedness | 60/100 | Passed: optimized responsive images, first-slide priority, noninitial lazy loading, reserved image geometry, font swap/preconnect, immutable uploaded-image caching. Unverified: LCP, CLS, INP and production page-weight/latency budgets. This is not a Lighthouse performance score. |
| Overall provisional readiness | 80/100 | (90 + 80 + 80 + 90 + 80 + 80 + 60) / 7. |

## Files changed in this pass

Paths are relative to the repository root.

| File | Change and reason |
| --- | --- |
| lib/seo-content.ts | Shared catalog summaries, category URL and parameter normalization, product summaries and related-product order; avoid duplicate/mismatched content |
| lib/structured-data.ts | Reusable factual entity, product, category and breadcrumb builders |
| lib/seo.ts | Explicit optional indexing override so order pauses need not remove search visibility |
| lib/page-metadata.ts | Apply the same indexing policy to page metadata |
| components/site-identity.tsx | Safely serialize configured business/site identity on relevant public pages |
| app/shop/page.tsx | Category H1/content, metadata, breadcrumbs, schema, unknown-category 404 and empty/facet noindex |
| components/catalog.tsx | Replace category-only buttons with links while retaining client-side search/sort |
| app/products/[id]/page.tsx | Shared schema, attribute-rich metadata, semantic breadcrumbs, related-product relevance, store props |
| components/quick-view.tsx | Use configured store name consistently in the quick-view dialog |
| components/product-detail.tsx | Dynamic store name, visible stock/size guidance, factual fabric details, return/contact links; avoid disabled-store purchase CTA |
| app/page.tsx | Business entity graph, factual catalog context and matching homepage description |
| app/about/page.tsx | AboutPage plus business identity |
| app/contact/page.tsx | ContactPage plus configured business identity |
| app/information/page.tsx | Crawlable reviews link |
| app/globals.css | Preserve tab appearance for anchors and expose homepage copy on mobile; minimal category guidance spacing |
| components/hero-slider.tsx | Responsive picture source selection with one img, appropriate priority/lazy loading |
| app/layout.tsx | Optional public verification tags, indexing control and font preconnections |
| app/sitemap.ts | Consistent indexing policy; exclude empty shop when catalog has no products |
| app/robots.ts | Always advertise configured sitemap, retaining crawl access for noindex processing |
| .env.example | Explain SEO_INDEXABLE and public Google/Bing verification token configuration |
| tests/seo.test.ts | Category, parameter, indexing, related-product and breadcrumb regressions |
| tests/http-smoke.mjs | Empty-category coverage, revised robots expectation and isolated notification/indexing environment |
| tests/seo-crawl.mjs | Final rendered-HTML discovery/canonical/schema/image/link/metadata crawl |
| package.json | Add npm run test:seo |
| docs/seo-audit.md | This baseline, implementation, verification and remaining-work record |

## Remaining work

### Code/runtime verification

- Browser/real-device mobile visual review is still required because the browser tool could not launch.
- Large catalogs currently pass the public product list into shared client context and render all matching products. Server pagination/payload reduction should be implemented when real catalog scale is known; introducing pagination now would unnecessarily change established behavior.
- Colour variations are visual selections, while inventory is keyed by product and size. Do not emit independently priced variant offers without adding the corresponding real data model.
- English pages retain lang=en. Bangla-specific editorial pages/hreflang should only be added with genuine translated content.
- Review the generic owner-editable homepage heading and default copy against real brand positioning. Added factual context does not replace original business editorial work.
- No separate Terms page was fabricated without approved terms.

### Business information required

Confirm real domain, legal/trading name, address, phone/email and official social URLs in settings. Existing defaults (including sample products and Dhaka address) must be verified by the owner before launch. Replace placeholder shipping/returns language with actual policies, supply accurate fit/measurements, confirm bundle contents in each product description and publish only genuine customer feedback. Manufacturer/GTIN/SKU/gender claims remain omitted when unsupported.

### External SEO tasks

Provide the live domain to inspect deployed HTML, robots, sitemap, certificates, CDN/WAF behavior and actual HTTP/mobile performance. Verify Google Search Console and Bing Webmaster Tools using real public verification tokens, then submit the live sitemap. Merchant Center/feed setup, analytics, business-profile eligibility and genuine editorial/backlink work require the relevant accounts and business details. No submissions, production deployment, live indexing, rankings or AI citations are claimed.

After launch, set SEO_INDEXABLE=true only for the intended public store; use false on staging. Keep NEXT_PUBLIC_SITE_URL set to the exact public origin. This makes indexing independent of temporary checkout pauses. Restart/redeploy after environment changes. Optional verification fields accept only the token values from the relevant consoles, not full HTML snippets.

## References and scope of AI readiness

Google explains that foundational SEO, crawlable textual content and accurate structured data support AI Search eligibility; special AI files or guaranteed citations are not required or promised: https://developers.google.com/search/docs/appearance/ai-features

Bing's guidance similarly connects discovery, canonical consistency, factual content and entity clarity to search and grounding eligibility: https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a

Responsive image implementation follows the Next.js getImageProps/picture guidance: https://nextjs.org/docs/app/api-reference/components/image

No FAQ rich-result promise is made. Category guidance is ordinary useful visible content, and no unsupported review/rating schema was introduced.
