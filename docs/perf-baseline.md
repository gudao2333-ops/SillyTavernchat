# Performance Baseline (Phase 0)

## Source
Baseline numbers are from the reported production/login experience before this overhaul:

- Requests: ~448
- Transferred: ~31 MB
- DOMContentLoaded: ~20s

## Initial Render Long-Task Hotspots (top 5)
From code-path inspection and startup module graph analysis:

1. Eager module graph evaluation from `public/script.js` (many static imports).
2. Eager side-effect loading for admin and announcements modules.
3. Synchronous heavy JSON parsing during world-info import flows.
4. Large CSS/JS fan-out from HTML startup includes.
5. Full chat DOM rendering for large histories (many `.mes` nodes alive at once).

## Instrumentation Added
A runtime perf debug toggle was added:

- `localStorage.setItem('st_performance_debug', '1')`
- or query param `?perfDebug=1`

Milestones logged:
- `bootstrap:start`
- `bootstrap:vite-loaded` or fallback
- `app:bootstrap-start`
- `app:deferred-modules-ready`
- `app:ready`
- `chat:virtualized`
- `sw:registered`
