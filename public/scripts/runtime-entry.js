import { markPerf } from './perf-debug.js';

const SCRIPT_REGISTRY = new Set();
const STYLE_REGISTRY = new Set();

function appendScript(src, type = 'text/javascript') {
    if (SCRIPT_REGISTRY.has(src) || document.querySelector(`script[src="${src}"]`)) return Promise.resolve();
    SCRIPT_REGISTRY.add(src);
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.type = type;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function appendModule(src) {
    if (SCRIPT_REGISTRY.has(src) || document.querySelector(`script[src="${src}"]`)) return;
    SCRIPT_REGISTRY.add(src);
    const script = document.createElement('script');
    script.src = src;
    script.type = 'module';
    document.head.appendChild(script);
}

function appendStyle(href) {
    if (STYLE_REGISTRY.has(href) || document.querySelector(`link[href="${href}"]`)) return;
    STYLE_REGISTRY.add(href);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}


async function loadLegacyLibraries() {
    const legacyScripts = [
        'lib/polyfill.js',
        'lib/jquery-3.5.1.min.js',
        'lib/jquery-ui.min.js',
        'lib/jquery.transit.min.js',
        'lib/jquery-cookie-1.4.1.min.js',
        'lib/jquery.ui.touch-punch.min.js',
        'lib/cropper.min.js',
        'lib/jquery-cropper.min.js',
        'lib/toastr.min.js',
        'lib/select2.min.js',
        'lib/select2-search-placeholder.js',
        'lib/pagination.js',
        'lib/toolcool-color-picker.js',
        'lib/jquery.izoomify.js',
    ];

    for (const src of legacyScripts) {
        await appendScript(src);
    }
}

async function loadFallbackLegacy() {
    markPerf('bootstrap:fallback-legacy');
    [
        'style.css',
        'css/st-tailwind.css',
        'css/rm-groups.css',
        'css/group-avatars.css',
        'css/toggle-dependent.css',
        'css/world-info.css',
        'css/extensions-panel.css',
        'css/select2-overrides.css',
        'css/mobile-styles.css',
        'css/macros.css',
        'css/user.css',
        'css/admin-extensions.css',
        'css/announcements.css',
    ].forEach(appendStyle);

    await loadLegacyLibraries();

    appendModule('lib/structured-clone/monkey-patch.js');
    appendModule('lib/swiped-events.js');
    appendModule('lib/eventemitter.js');
    appendModule('scripts/i18n.js');
    appendModule('script.js');
}

async function loadFromViteManifest() {
    await loadLegacyLibraries();
    const manifestPaths = ['/dist/.vite/manifest.json', '/dist/manifest.json'];
    let manifest;

    for (const url of manifestPaths) {
        try {
            const response = await fetch(`${url}?v=${Date.now()}`, { cache: 'no-store' });
            if (response.ok) {
                manifest = await response.json();
                break;
            }
        } catch {
            // noop, try next
        }
    }

    if (!manifest) {
        throw new Error('Vite manifest not found');
    }

    const entry = manifest['scripts/app-bundle-entry.js'] || manifest['app-bundle-entry.js'];
    if (!entry || !entry.file) {
        throw new Error('Entry bundle missing in Vite manifest');
    }

    (entry.css || []).forEach((href) => appendStyle(`/${href}`));
    appendModule(`/${entry.file}`);
}

async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (localStorage.getItem('disableSW') === '1') return;

    try {
        await navigator.serviceWorker.register('/sw.js');
        markPerf('sw:registered');
    } catch (error) {
        console.warn('[perf] Service worker registration failed', error);
    }
}

(async () => {
    markPerf('bootstrap:start');
    try {
        await loadFromViteManifest();
        markPerf('bootstrap:vite-loaded');
    } catch (error) {
        console.warn('[perf] Falling back to legacy loader:', error);
        await loadFallbackLegacy();
    }
    registerServiceWorker();
})();
