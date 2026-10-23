/**
 * useFocusGroup — the same D-pad focus model as focus.ts, as a React hook.
 * Only peer dependency: React 17+. Extracted from NaniTV (https://github.com/sarthak115/nanitv).
 *
 *   const { bind } = useFocusGroup(['ok', 'messages', 'help'], { onSelect });
 *   <button {...bind('ok')}>I'm OK</button>
 *
 * Style `[data-focused="true"]` for an always-visible focus ring.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
export function useFocusGroup(ids, opts = {}) {
    const { onSelect, layout = 'row', initial, enabled = true, wrap = false } = opts;
    const [focused, setFocused] = useState(initial !== null && initial !== void 0 ? initial : ids[0]);
    const refs = useRef(new Map());
    const idsKey = ids.join('|');
    // If the focused id disappears, fall back to the first one: focus is never lost.
    useEffect(() => {
        if (!ids.includes(focused) && ids.length)
            setFocused(ids[0]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idsKey]);
    useEffect(() => {
        var _a;
        if (enabled)
            (_a = refs.current.get(focused)) === null || _a === void 0 ? void 0 : _a.focus({ preventScroll: true });
    }, [focused, enabled]);
    const move = useCallback((delta) => {
        setFocused((cur) => {
            var _a;
            const i = ids.indexOf(cur);
            let n = i + delta;
            n = wrap ? (n + ids.length) % ids.length : Math.max(0, Math.min(ids.length - 1, n));
            return (_a = ids[n]) !== null && _a !== void 0 ? _a : cur;
        });
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [idsKey, wrap]);
    useEffect(() => {
        if (!enabled)
            return;
        const onKey = (e) => {
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
            else if (e.key === 'Enter') {
                e.preventDefault();
                onSelect === null || onSelect === void 0 ? void 0 : onSelect(focused);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [enabled, layout, move, onSelect, focused]);
    const bind = useCallback((id) => ({
        ref: (el) => {
            if (el)
                refs.current.set(id, el);
            else
                refs.current.delete(id);
        },
        tabIndex: -1,
        'data-focused': focused === id ? 'true' : undefined,
        onClick: () => {
            setFocused(id);
            onSelect === null || onSelect === void 0 ? void 0 : onSelect(id);
        },
        onMouseEnter: () => setFocused(id),
    }), [focused, onSelect]);
    return { focused, setFocused, bind };
}
