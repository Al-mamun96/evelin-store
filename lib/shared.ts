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
