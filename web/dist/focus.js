/**
 * focus.ts — dependency-free D-pad focus for TV web apps (no framework).
 *
 * Mark focusable elements with `data-focus="<id>"` inside a container:
 *
 *   <div id="menu">
 *     <button data-focus="play">Play</button>
 *     <button data-focus="settings">Settings</button>
 *   </div>
 *
 *   const group = createFocusGroup(document.getElementById('menu')!, {
 *     onSelect: (id) => console.log('pressed', id),
 *   });
 *
 * Arrow keys move focus (Left/Right for `layout: 'row'`, Up/Down for `'column'`,
 * all four for `'both'`); Enter (the Fire TV Select key) activates. The focused
 * element gets `data-focused="true"` — style that, not `:focus`, so the ring is
 * always visible. Focus is never lost: if the focused element disappears,
 * `refresh()` falls back to the first one.
 */
const ATTR = 'data-focus';
const FOCUSED = 'data-focused';
export function createFocusGroup(container, opts = {}) {
    const { layout = 'row', wrap = false, onSelect, onFocus } = opts;
    let items = [];
    let current = null;
    let enabled = true;
    const idOf = (el) => { var _a; return (_a = el.getAttribute(ATTR)) !== null && _a !== void 0 ? _a : ''; };
    function paint() {
        for (const el of items) {
            if (idOf(el) === current) {
                el.setAttribute(FOCUSED, 'true');
                el.focus({ preventScroll: true });
            }
            else {
                el.removeAttribute(FOCUSED);
            }
        }
    }
    function setFocused(id) {
        const el = items.find((x) => idOf(x) === id);
        if (!el)
            return;
        current = id;
        paint();
        onFocus === null || onFocus === void 0 ? void 0 : onFocus(id, el);
    }
    function move(delta) {
        if (!items.length)
            return;
        const i = Math.max(0, items.findIndex((x) => idOf(x) === current));
        let n = i + delta;
        n = wrap ? (n + items.length) % items.length : Math.max(0, Math.min(items.length - 1, n));
        setFocused(idOf(items[n]));
    }
    function refresh() {
        items = Array.from(container.querySelectorAll(`[${ATTR}]`));
        for (const el of items) {
            if (!el.hasAttribute('tabindex'))
                el.tabIndex = -1;
        }
        if (!current || !items.some((x) => idOf(x) === current)) {
            current = opts.initial && items.some((x) => idOf(x) === opts.initial) ? opts.initial : items[0] ? idOf(items[0]) : null;
        }
        paint();
    }
    const onKey = (e) => {
        if (!enabled)
            return;
        const horiz = layout !== 'column';
        const vert = layout !== 'row';
        if ((e.key === 'ArrowLeft' && horiz) || (e.key === 'ArrowUp' && vert)) {
            e.preventDefault();
            move(-1);
        }
        else if ((e.key === 'ArrowRight' && horiz) || (e.key === 'ArrowDown' && vert)) {
            e.preventDefault();
            move(1);
        }
        else if (e.key === 'Enter' && current) {
            e.preventDefault();
            const el = items.find((x) => idOf(x) === current);
            if (el)
                onSelect === null || onSelect === void 0 ? void 0 : onSelect(current, el);
        }
    };
    const onClick = (e) => {
        const el = e.target.closest(`[${ATTR}]`);
        if (!el || !container.contains(el))
            return;
        setFocused(idOf(el));
        onSelect === null || onSelect === void 0 ? void 0 : onSelect(idOf(el), el);
    };
    window.addEventListener('keydown', onKey);
    container.addEventListener('click', onClick);
    refresh();
    return {
        get focused() {
            return current;
        },
        setFocused,
        refresh,
        setEnabled(v) {
            enabled = v;
        },
        destroy() {
            window.removeEventListener('keydown', onKey);
            container.removeEventListener('click', onClick);
        },
    };
}
