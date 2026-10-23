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

export interface UseFocusGroupOptions {
  onSelect?: (id: string) => void;
  /** Which arrows move focus. Default 'row'. */
  layout?: 'row' | 'column' | 'both';
  initial?: string;
  /** Turn key handling off, e.g. while another screen/dialog owns the keys. */
  enabled?: boolean;
  wrap?: boolean;
}

export function useFocusGroup(ids: string[], opts: UseFocusGroupOptions = {}) {
  const { onSelect, layout = 'row', initial, enabled = true, wrap = false } = opts;
  const [focused, setFocused] = useState<string>(initial ?? ids[0]);
  const refs = useRef(new Map<string, HTMLElement>());
  const idsKey = ids.join('|');

  // If the focused id disappears, fall back to the first one: focus is never lost.
  useEffect(() => {
    if (!ids.includes(focused) && ids.length) setFocused(ids[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  useEffect(() => {
    if (enabled) refs.current.get(focused)?.focus({ preventScroll: true });
  }, [focused, enabled]);

  const move = useCallback(
    (delta: number) => {
      setFocused((cur) => {
        const i = ids.indexOf(cur);
        let n = i + delta;
        n = wrap ? (n + ids.length) % ids.length : Math.max(0, Math.min(ids.length - 1, n));
        return ids[n] ?? cur;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [idsKey, wrap],
  );

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const horiz = layout !== 'column';
      const vert = layout !== 'row';
      if ((e.key === 'ArrowLeft' && horiz) || (e.key === 'ArrowUp' && vert)) {
        e.preventDefault();
        move(-1);
      } else if ((e.key === 'ArrowRight' && horiz) || (e.key === 'ArrowDown' && vert)) {
        e.preventDefault();
        move(1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSelect?.(focused);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, layout, move, onSelect, focused]);

  const bind = useCallback(
    (id: string) => ({
      ref: (el: HTMLElement | null) => {
        if (el) refs.current.set(id, el);
        else refs.current.delete(id);
      },
      tabIndex: -1,
      'data-focused': focused === id ? 'true' : undefined,
      onClick: () => {
        setFocused(id);
        onSelect?.(id);
      },
      onMouseEnter: () => setFocused(id),
    }),
    [focused, onSelect],
  );

  return { focused, setFocused, bind };
}
