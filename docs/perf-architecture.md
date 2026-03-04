# Performance Architecture

## Bundling / Splitting
- Added Vite build (`vite.config.js`) with hashed output to `public/dist`.
- Runtime loader (`public/scripts/runtime-entry.js`) loads one entry module from Vite manifest.
- Legacy fallback path preserved when dist bundle is absent.

## Compatibility
- Existing `public/scripts/*` and legacy URLs remain unchanged/reachable.
- Legacy extension/global assumptions remain supported through fallback and existing global shims.

## Startup Deferral
- Admin and announcement modules are deferred to idle time using dynamic imports.
- Non-critical work shifted out of bootstrap path where safe.

## Service Worker
- Core bundle precache + runtime cache for static hot paths (avatars/fonts/locales/templates).

## Chat Runtime
- Added lightweight chat virtualization guard:
  - keep old message nodes hidden when above threshold
  - reveal progressively on scroll-up
  - apply `content-visibility` hints for message nodes

## Worker Usage
- Added JSON parse worker (`public/scripts/workers/json-parse.worker.js`) and helper (`public/scripts/json-worker-parse.js`).
- Integrated into world-info JSON import path to reduce main-thread blocking for large files.
