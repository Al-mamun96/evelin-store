# Evelin — Next.js ecommerce + Store Studio

A mobile-first fashion store for Evelin, inspired by the collection-first shopping flow of https://tabaya.com/. The design, copy and sample imagery are original. Built with Next.js, TypeScript, SQLite and Node.js 24 for one VPS application instance.

## What is included

- Responsive storefront, dynamic categories, product details, size guidance, shopping bag and Bangladesh cash-on-delivery checkout.
- Password-protected **Store Studio at `/admin`** with English labels and Bangla guidance.
- Product create/edit/delete/restore, duplicate, draft/publish, categories, prices, colours, sizes, size guidance and photo upload.
- Homepage title, announcement, banner photo, descriptions, section headings and brand story editor.
- Manual orders, order search/status filters/pagination, printable invoices; edit customer, address, products, size, quantity, shipping zone, delivery charge, discount and advance payment before dispatch/courier submission.
- Inventory per size, adjustment reasons/history, low-stock alerts, transactional stock reservation/reconciliation and controlled cancellation restocking.
- Editable shipping zones/fees, contact details, policies, and an open/paused checkout switch.
- Steadfast encrypted credential settings, connection/balance test, manual or confirmation-triggered booking, COD calculation, status sync and duplicate-booking protection.
- Setup checklist, activity history and a Bangla quick guide inside admin. See [the detailed guide](docs/admin-guide-bn.md).
- Docker/Coolify configuration, health check and database + uploaded-photo backup script.

## Local development

Requires **Node.js 24+** for built-in `node:sqlite`.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Set `ADMIN_PASSWORD` to at least 16 characters, `SESSION_SECRET` to a random 32+ character value, and `INSECURE_LOCAL_COOKIES=true` only for local HTTP testing. Generate random secrets with `openssl rand -hex 32`. Never use local insecure cookies on your public VPS.

```bash
npm test
npm run typecheck
npm run build
npm run test:http
npm start
```

Tests use temporary databases and synthetic customer data. Courier tests mock the provider; they never create real parcels. HTTP tests run the standalone production server on port 3100.

## Hostinger KVM 4 + Coolify

Create a **new application** for Evelin so your existing landing pages keep their own containers, domains and volumes.

1. Push the project to your repository, excluding secrets, `data/`, backups, `node_modules/`, `.next/` and generated source artwork. Connect it to a new Coolify application.
2. Select the **Dockerfile** build pack, `/Dockerfile`, base directory `/`, internal port **3000**. Let Coolify's proxy handle public HTTP/HTTPS; do not publish a conflicting host port.
3. Set runtime variables:
   - `NEXT_PUBLIC_SITE_URL=https://YOUR-EVELIN-DOMAIN` (the exact public origin).
   - `DATABASE_PATH=/app/data/evelin.sqlite`.
   - `ADMIN_PASSWORD` (16+ characters) and `SESSION_SECRET` (32+ random characters).
   - `SETTINGS_ENCRYPTION_KEY` (recommended: a separate stable 32+ character secret for courier credentials).
   - `STORE_LIVE=false` for the initial setup. Keep `INSECURE_LOCAL_COOKIES` unset or false.
4. Add persistent storage at **`/app/data`** and **`/app/backups`**, writable by container UID/GID **1000:1000**. `/app/data` contains the database **and uploaded images**. Without this volume, redeployments can lose store data.
5. Add your domain, point DNS at the VPS and enable HTTPS. Deploy and check `/api/health`.
6. Open `/admin`, enter the configured admin password, replace demo products/images/stock, configure policies, contacts and shipping fees.
7. Add Steadfast merchant keys in the **Steadfast** screen. Save and use **Test connection**. Keep auto-book off until a controlled live parcel test succeeds.
8. Verify a test order, image upload, stock change and a redeploy using staging data. Configure backups. Then switch on **Store settings → Store is open for orders** and save.

After the first admin settings save, the database's open/paused setting takes precedence over `STORE_LIVE`; changing that environment variable alone will not override saved settings. Daily content, order and stock maintenance requires no code changes or redeployment.

`compose.yaml` is an alternative for Docker Compose deployment. It uses named volumes and exposes internal port 3000 without publishing a host port; add the domain to the `evelin` service in Coolify. Use one app replica with SQLite. Its 1 GB runtime limit is a starting allocation, not a performance guarantee; monitor the VPS and allow extra memory for builds. Use a shared database architecture before adding replicas.

## Steadfast behavior

The integration follows the [official Steadfast package documentation](https://github.com/steadfast-it/SteadFast-Courier-Laravel-Package). The default API is `https://portal.steadfast.com.bd/api/v1`; a fixed legacy Packzy endpoint is selectable for merchants who require it. Arbitrary endpoints are rejected.

- Enter both merchant keys once. They are encrypted at rest and never returned to the browser. Empty key fields retain saved values on subsequent saves.
- **Test connection** checks the balance endpoint. It does not create a parcel.
- **Confirm order** optionally creates a booking when auto-book is enabled; otherwise use **Send to Steadfast**.
- COD = products subtotal + delivery charge − discount − advance received. An advance entry records money already received; it does not process a payment.
- Booking saves the consignment/tracking codes and locks local product/address edits. Courier bookings are external records; this app does not pretend that a local edit changes an existing parcel.
- **Sync status** fetches delivery status. A delivered result updates the local order. There is no automatic background sync/webhook in this release.
- Timeout or ambiguous errors block automatic retry. Search the invoice in the merchant portal, then sync. Only use **No parcel exists — unlock** after verifying that no parcel exists; the server also enforces a one-minute wait.
- Cancel a booked parcel through the merchant portal. Sync its cancelled status, then use **Receive return & restock** only after all goods are physically back. Partial delivery/partial returns require manual reconciliation; do not restock the full order for a partial return.

Keep the encryption key stable and backed up separately. If it changes or is lost, re-enter both courier keys. Rotating `SESSION_SECRET` signs out admin sessions; with a dedicated encryption key it does not invalidate saved courier settings.

## Data, migration and backups

The database seeds the illustrative catalog once. Existing inventory/order records are preserved by additive startup migrations; seed insertion never overwrites current counts. Product deletion removes it from the storefront while preserving old orders and the ability to restore it as a draft. Historical order lines keep their selling prices; newly added lines use the current price.

Run this in the application container (or `npm run db:backup` locally):

```bash
node scripts/backup.mjs
```

Each backup produces `backups/evelin-TIMESTAMP/` with a SQLite-aware snapshot (including WAL changes), `uploads/` and restore notes. Set `BACKUP_PATH` to override the destination. Backups contain customer data and encrypted courier credentials; restrict access. Schedule the script in Coolify/VPS and copy complete backup folders to separate secure storage. No scheduler or external backup destination is configured by this project.

Restore first in staging: stop the app, preserve its current data, replace the database and uploads with the selected snapshot, remove obsolete database `-wal`/`-shm` files while stopped, restore ownership, ensure the encryption key is available, and restart. Do not simply overwrite a running SQLite file.

## Before launch and current boundaries

- All seeded products, prices, stock and generated fashion photos are illustrative. Replace them through admin with real product information and images; enter real size measurements and approved store policies.
- No deployment to your VPS has been performed. Docker is not available in the build environment; the standalone Node production output was tested directly.
- Steadfast works through the implemented API adapter, but real merchant credentials and a live parcel test are still required. No real courier request was made during validation.
- COD only; no payment gateway, SMS/email notifications, customer accounts, staff roles, bulk import/export or automated courier sync.
- One owner password, with signed HttpOnly session cookies, origin checks, request validation and login throttling. Set additional trusted-proxy per-IP rate limits for launch. Do not trust client-supplied forwarded IP headers.
- Uploaded files are immutable; deleting products does not delete their images. This protects restored products/history but means unused files can accumulate. There is no automated media cleanup.
- Application updates, secret management, backups and server maintenance still require technical administration. Review dependency security updates before public launch.

## Project map

`app/` routes and APIs · `components/admin/` Store Studio · `lib/products.ts` catalog management · `lib/store-settings.ts` homepage/zones · `lib/orders.ts` transactional orders · `lib/steadfast.ts` courier integration · `lib/db.ts` migrations/stock history · `tests/` integrity and HTTP checks.
