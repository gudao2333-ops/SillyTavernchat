import { markPerf } from './perf-debug.js';

const MAX_VISIBLE_MESSAGES = 140;
const REVEAL_BATCH_SIZE = 120;

function getChatContainer() {
    return document.getElementById('chat');
}

function getMessages(container) {
    return Array.from(container.querySelectorAll('.mes'));
}

function hideOverflowMessages(container) {
    const messages = getMessages(container);
    if (messages.length <= MAX_VISIBLE_MESSAGES) return;

    const hiddenCount = messages.length - MAX_VISIBLE_MESSAGES;
    for (let i = 0; i < hiddenCount; i++) {
        messages[i].setAttribute('data-virtualized', '1');
        messages[i].style.display = 'none';
    }

    markPerf('chat:virtualized', { hiddenCount, total: messages.length });
}

function revealOlderMessages(container) {
    const hidden = Array.from(container.querySelectorAll('.mes[data-virtualized="1"]'));
    if (!hidden.length) return;

    const chunk = hidden.slice(Math.max(0, hidden.length - REVEAL_BATCH_SIZE));
    for (const node of chunk) {
        node.style.display = '';
        node.removeAttribute('data-virtualized');
    }
}

export function initChatVirtualization() {
    const container = getChatContainer();
    if (!container) return;

    const apply = () => {
        hideOverflowMessages(container);
        requestAnimationFrame(() => {
            container.querySelectorAll('.mes').forEach((node) => {
                node.style.contentVisibility = 'auto';
                node.style.containIntrinsicSize = '160px';
            });
        });
    };

    const observer = new MutationObserver(() => apply());
    observer.observe(container, { childList: true, subtree: false });

    container.addEventListener('scroll', () => {
        if (container.scrollTop < 120) {
            revealOlderMessages(container);
        }
    }, { passive: true });

    apply();
}
