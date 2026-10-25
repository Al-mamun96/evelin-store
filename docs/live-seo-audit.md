# Evelin live SEO audit — 26 October 2026 (Asia/Dhaka)

Public origin confirmed by the owner: https://evelinbd.site. This supplements the earlier code audit in `seo-audit.md`; its deployment and domain limitations are historical, not the current live status.

## Measured baseline

Lighthouse 13.5.0, local headless Chrome against the public homepage. These are single-run lab scores, not rankings, field Core Web Vitals, or a guarantee of Google indexing.

| Profile | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Mobile baseline | 81 | 93 | 100 | 69 |
| Desktop baseline | 93 | 96 | 100 | 69 |
| Mobile after first deployment (9489cf4) | 64 | 100 | 100 | 100 |
| Mobile final deployment (b2f92fe) | 80 | 100 | 100 | 100 |
| Desktop final deployment (b2f92fe) | 93 | 100 | 100 | 100 |

Final deployment was confirmed through its responsive logo markup and stylesheet fingerprint before measurement. Final mobile: FCP 3.5s, LCP 4.0s, TBT 60ms, CLS 0. Final desktop: FCP 0.9s, LCP 1.5s, TBT 0ms, CLS 0.002. Performance remains below 100; mobile score is essentially unchanged from the baseline, not a demonstrated improvement. Final reports: `test-results/live-mobile-final.json` and `test-results/live-desktop-final.json`.

Mobile baseline: FCP 2.3s, LCP 4.2s, TBT 30ms, CLS 0. First post-deployment run: FCP 4.0s, LCP 6.5s, TBT 100ms, CLS 0. Performance did not improve in that run. Network/render-blocking CSS and Google Fonts delays remain measurable; the lower score is retained rather than hidden. The PageSpeed API returned quota errors, so no PageSpeed/CrUX field-data result is claimed.

## Implemented and pushed

- `lib/seo.ts`, `.env.example`, `tests/seo.test.ts`: confirmed public domain can be indexed while checkout is paused. Explicit `SEO_INDEXABLE=false` still wins; staging retains the previous fallback. No store-opening setting was changed.
- `app/sitemap.ts`: sitemap now contains the public catalog even when ordering is paused, while empty review content stays excluded.
- `lib/reviews.ts`, `app/reviews/page.tsx`, `components/admin/settings.tsx`: hide only the exact old starter testimonial from public reviews, noindex an empty review page, and stop pre-filling new reviews with fabricated starter content. Stored records are not deleted; genuine feedback remains untouched.
- `lib/shared.ts`, `app/globals.css`: remove redundant Google Fonts CSS import, deduplicate font families, preserve configured heading/body fonts and menu Inter, and request supported weights for single-weight families.
- `components/product-card.tsx`: include visible product badge text in the accessible image-link label.
- `app/globals.css`: retain theme colors while increasing text contrast, provide a readable image-caption backdrop and improve slider-dot tap targets without enlarging their visible dots. Keep mobile CTA above the dots.
- `lib/structured-data.ts`: deduplicate configured social profile identifiers. No invented social URLs, ratings, policies, or availability.
- `components/store-logo.tsx`: responsive optimization for uploaded local logos; external logos preserve existing behavior. No logo asset is overwritten or deleted.
- `tests/seo-crawl.mjs`: recognize the noindex empty-review page in regression checks.

## Validation

- Production build and TypeScript passed.
- 36 unit/integration tests passed.
- Production HTTP smoke tests passed, including admin protection, checkout totals/idempotency, inventory/order edits, uploads, homepage settings and paused checkout.
- Local rendered-HTML crawl: 18 sitemap pages, 18 unique titles/descriptions, 995 checked internal links, parsed/asserted structured data; passed.
- Read-only live crawl after 9489cf4: 18 sitemap URLs returned successfully, 18 unique titles, one H1 per page, canonical tags present, no unintended noindex and 15 JSON-LD scripts parsed. Cart, checkout, account, empty reviews and internal search retained noindex. Missing product returned 404. No issues in those checks.
- Public homepage now returns `index, follow`; public sitemap changed from empty to 18 entries. This proves crawl eligibility, not that Google has indexed the pages.
- No production orders, inventory, secrets, or database records were modified by this audit.

## Remaining work and honest boundaries

### Runtime / performance

Google Fonts and stylesheet loading still affect slow-mobile rendering. Origin latency varies between runs. Further font self-hosting and CDN/server tuning should preserve all admin font choices and cache freshness for inventory and orders; do not cache checkout or admin pages just to inflate a score. Browser automation tooling was unavailable; Lighthouse's browser-based checks ran successfully, but real-device gesture/visual testing remains separate.

### Business information

The live store remains paused for orders. Shipping timelines and returns text still contain pre-launch placeholders. The catalog includes seeded entries that require owner verification against real stock, prices, photos and measurements. All four social settings point to the same Facebook share URL; the owner should provide real official profile URLs. Do not manufacture policy terms, reviews, identifiers, contact details or claims to satisfy an audit.

### External accounts

Google Search Console / Bing Webmaster verification and sitemap submission require account access or real verification tokens. No submissions, Merchant Center approval, backlinks, ranking position or AI citation is claimed. A Lighthouse SEO score of 100 only means its limited automated checks passed; it does not mean complete SEO or guaranteed top placement.

Raw audit reports are retained locally in ignored `test-results/` files, not added to production assets.
