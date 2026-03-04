# Service Worker Strategy

## File
- `public/sw.js`

## Core Behavior
- Precache app shell and Vite-generated entry assets by reading `/dist/.vite/manifest.json`.
- Runtime caching strategies:
  - `/dist/**`: Cache First
  - avatars/thumbnails/images: Stale While Revalidate
  - locales/templates JSON: Stale While Revalidate
  - fonts: Cache First

## Versioning
- Cache names are versioned (`yeduguan-core-v2`, `yeduguan-runtime-v2`).
- Old cache keys are cleaned on `activate`.

## Disable Switch
- SW registration can be disabled by setting:
  - `localStorage.setItem('disableSW', '1')`
