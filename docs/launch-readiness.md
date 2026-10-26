# Launch readiness — 26 October 2026

## Completed in this continuation

- Self-host Poppins, Playfair Display, Italiana, DM Sans and Inter. Preserve the existing font selections, font weights and all other admin font options (other families retain Google delivery). Default/current combinations no longer need Google font stylesheets. Fontsource uses `font-display: swap` and unicode ranges; unused faces are not requested by the browser.
- Update Next.js to 16.4.3, Sharp to 0.35.5, Zod to 4.6.7 and affected transitive dependencies. Zod's major update was explicitly checked against the existing schema tests and production build; no database migration or website redesign was added. The dependency audit reports zero known vulnerabilities at this check, not a security guarantee.
- Add automated Chrome mobile regression tests with a separate temporary SQLite database and synthetic customers. Check 320, 375, 390, 768 and 1440px widths, mobile menu, mandatory size selection, touch pinch zoom, one-page checkout, retained details after network failure and idempotent retry after a saved order's response is lost.
- Add Telegram tests with mocked network calls: missing configuration, expected order/customer/item/COD content, rejected responses and successful sending. No real Telegram message or courier booking is created.
- Retain and run the migration/backup regression: synthetic legacy order and stock survive migration; a SQLite snapshot and uploaded fixture are copied and reopened successfully. This does not verify the production server's backup schedule or off-server storage.

## Validation commands

Run `npm test`, `npm run build`, `npm run test:http`, `npm run test:seo`, `npm run test:mobile` and `npm audit`.

The mobile test requires Chrome installed and uses local port 3102. It never accepts a production origin. The production Docker image uses Node 24; this Windows validation environment currently has Node 22.22.3 and emits SQLite/engine warnings.

## Owner/access-dependent work — not completed or fabricated

1. **Search Console and Bing:** obtain public verification tokens from the property owner, set `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` in the deployment environment, redeploy, verify ownership and submit `https://evelinbd.site/sitemap.xml`. No account submission has been made.
2. **Policies and catalog:** supply actual delivery timelines, exchange eligibility/window/costs, official social profiles, product measurements, real stock/photos/prices and business identity. Existing placeholder policy text and seeded data must be reviewed before accepting orders.
3. **Telegram:** set the private bot token and chat ID directly in the server's protected environment, never in source control or public messages. Use the admin notification test with an explicitly approved test order. Mocked tests are not proof that a real chat receives messages.
4. **Courier:** enter real merchant keys through the existing protected admin screen and check the connection. Only run a real parcel booking with the owner's explicit approval and real delivery details. Existing mocked courier regression tests do not constitute a live courier test.
5. **Production backups:** run the existing backup command in the application container, copy the complete snapshot/uploads off-server, preserve encryption keys separately, and test a restore in an isolated staging environment. Do not overwrite the running live database.
6. **Opening orders:** keep ordering paused until policies, stock, integrations and backups have been verified. This continuation does not change the live/paused switch.
7. **Physical devices:** Chrome touch emulation passed; a real iPhone/Safari and Android device test is still advisable before launch.

## References

- Font delivery: https://fontsource.org/docs/getting-started/install and https://fontsource.org/docs/getting-started/display
- Next.js security advisory: https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw
- Sharp security advisory: https://github.com/lovell/sharp/security/advisories/GHSA-wq5f-xc86-pv6w

Live Lighthouse measurements after this deployment are recorded separately; do not interpret local test timings as a new performance score.
