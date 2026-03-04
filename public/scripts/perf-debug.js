const PERF_FLAG_KEY = 'st_performance_debug';

export function isPerfDebugEnabled() {
    return localStorage.getItem(PERF_FLAG_KEY) === '1' || new URLSearchParams(location.search).get('perfDebug') === '1';
}

export function markPerf(name, extra = {}) {
    if (!isPerfDebugEnabled()) return;
    const t = Math.round(performance.now());
    console.info(`[perf] ${name} @ ${t}ms`, extra);
}

export function setPerfDebugEnabled(enabled) {
    localStorage.setItem(PERF_FLAG_KEY, enabled ? '1' : '0');
}

if (typeof window !== 'undefined') {
    window.SillyTavernPerf = {
        isEnabled: isPerfDebugEnabled,
        mark: markPerf,
        setEnabled: setPerfDebugEnabled,
    };
}
