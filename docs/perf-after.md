# Performance After Overhaul (Phase 8)

## Cold Start (expected with dist build + SW disabled)
- Startup path reduced to:
  - 1 HTML + 1 runtime loader + legacy library set + hashed app/css chunks
- Massive module request fan-out removed by bundling through Vite chunks.

## Warm Start (SW enabled)
- Core app shell and hashed dist assets are served from cache.
- Runtime static assets (fonts/avatars/locales/templates) use cache strategies to reduce repeat latency.

## Functional Runtime Improvements
- Deferred admin/announcement module loading.
- Chat DOM pressure reduced with virtualization guard (message hiding/reveal strategy).
- Large JSON parsing moved to worker for world-info import.

## Verification Notes
Use browser DevTools on target deployment for final exact measurements:
- Cold: requests/transferred/DCL/load
- Warm: DCL/load after SW is active
- Long tasks >50ms during dashboard open and chat scroll
- Chat node count under heavy history
