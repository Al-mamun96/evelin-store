# Customer accounts

The Account page supports email/password registration, sign-in, sign-out, profile editing (name, Bangladesh mobile number and address) and password changes. Email is the immutable login identifier. Guest checkout and order-number/phone tracking remain available without an account. Saved profile details do not automatically overwrite checkout details.

Customer accounts are separate from admin access. Existing orders are not linked by matching an unverified email or phone. This release does not offer email verification, automated forgotten-password recovery, or authenticated order history. Do not imply that a registered email is verified. An email provider and secure single-use recovery flow are needed before adding password-reset links.

The first customer request that needs storage creates only the new customers and customer_sessions tables in the existing SQLite database. Existing inventory, orders and settings are untouched. Include the database in normal protected backups; it now contains customer personal details and password hashes.

Passwords use salted scrypt; opaque random sessions are stored as hashes. Production uses a Secure, HttpOnly, SameSite=Strict host-only cookie over HTTPS. Sessions expire after seven days or 24 hours of inactivity. Password changes revoke every previous session. State-changing requests check the origin and are rate-limited. Customer responses are private/no-store. Keep NEXT_PUBLIC_SITE_URL set to the exact HTTPS public origin. The insecure local cookie override works only with explicitly configured HTTP localhost/127.0.0.1.

Run `npm test`, `npm run build`, and `node tests/customer-browser.mjs` to validate the implementation. Browser tests use disposable local databases, not production registrations.
