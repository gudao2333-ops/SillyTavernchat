let worker;
let id = 0;
const pending = new Map();

function getWorker() {
    if (!worker) {
        worker = new Worker(new URL('./workers/json-parse.worker.js', import.meta.url), { type: 'module' });
        worker.onmessage = (event) => {
            const { id, ok, parsed, error } = event.data;
            const resolver = pending.get(id);
            if (!resolver) return;
            pending.delete(id);
            ok ? resolver.resolve(parsed) : resolver.reject(new Error(error));
        };
    }
    return worker;
}

export async function parseJsonOffThread(text) {
    if (typeof Worker === 'undefined') {
        return JSON.parse(text);
    }

    const currentId = ++id;
    const w = getWorker();
    return await new Promise((resolve, reject) => {
        pending.set(currentId, { resolve, reject });
        w.postMessage({ id: currentId, text });
    });
}
