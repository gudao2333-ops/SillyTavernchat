self.onmessage = (event) => {
    const { id, text } = event.data;
    try {
        const parsed = JSON.parse(text);
        self.postMessage({ id, ok: true, parsed });
    } catch (error) {
        self.postMessage({ id, ok: false, error: String(error?.message || error) });
    }
};
