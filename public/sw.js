const CORE_CACHE = 'yeduguan-core-v2';
const RUNTIME_CACHE = 'yeduguan-runtime-v2';

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CORE_CACHE);
        const manifestUrls = ['/dist/.vite/manifest.json', '/dist/manifest.json'];
        let manifest = null;

        for (const url of manifestUrls) {
            try {
                const res = await fetch(url, { cache: 'no-store' });
                if (res.ok) {
                    manifest = await res.json();
                    break;
                }
            } catch {
                // noop
            }
        }

        const core = ['/', '/index.html', '/favicon.ico', '/manifest.json', '/scripts/runtime-entry.js'];

        if (manifest) {
            const entry = manifest['scripts/app-bundle-entry.js'] || manifest['app-bundle-entry.js'];
            if (entry?.file) core.push(`/${entry.file}`);
            for (const css of entry?.css || []) core.push(`/${css}`);
        }

        await cache.addAll([...new Set(core)]);
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys
            .filter((k) => ![CORE_CACHE, RUNTIME_CACHE].includes(k))
            .map((k) => caches.delete(k)));
        await self.clients.claim();
    })());
});

function staleWhileRevalidate(request) {
    return caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const networkPromise = fetch(request).then((response) => {
            if (response && response.ok) cache.put(request, response.clone());
            return response;
        }).catch(() => cached);
        return cached || networkPromise;
    });
}

function cacheFirst(request) {
    return caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response && response.ok) cache.put(request, response.clone());
        return response;
    });
}

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    if (url.origin !== location.origin) return;

    if (url.pathname.startsWith('/dist/')) {
        event.respondWith(cacheFirst(event.request));
        return;
    }

    if (/\/(User Avatars|thumbnails|avatars|images)\//.test(url.pathname)) {
        event.respondWith(staleWhileRevalidate(event.request));
        return;
    }

    if (url.pathname.includes('/locales/') || url.pathname.includes('/templates/')) {
        event.respondWith(staleWhileRevalidate(event.request));
        return;
    }

    if (/\.(woff2?|ttf)$/.test(url.pathname)) {
        event.respondWith(cacheFirst(event.request));
    }
});
