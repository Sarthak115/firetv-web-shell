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

export type FocusLayout = 'row' | 'column' | 'both';

export interface FocusGroupOptions {
  /** Which arrows move focus. Default 'row'. */
  layout?: FocusLayout;
  /** Wrap from last to first (and back). Default false. */
  wrap?: boolean;
  /** Id to focus first. Default: the first element. */
  initial?: string;
  /** Called on Enter / Select (and on mouse click). */
  onSelect?: (id: string, el: HTMLElement) => void;
  /** Called whenever focus moves. */
  onFocus?: (id: string, el: HTMLElement) => void;
}

export interface FocusGroup {
  readonly focused: string | null;
  setFocused(id: string): void;
  /** Re-scan the container after its children change. */
  refresh(): void;
  /** Temporarily ignore keys (e.g. while a dialog is on top). */
  setEnabled(enabled: boolean): void;
  destroy(): void;
}

const ATTR = 'data-focus';
const FOCUSED = 'data-focused';

export function createFocusGroup(container: HTMLElement, opts: FocusGroupOptions = {}): FocusGroup {
  const { layout = 'row', wrap = false, onSelect, onFocus } = opts;
  let items: HTMLElement[] = [];
  let current: string | null = null;
  let enabled = true;

  const idOf = (el: HTMLElement) => el.getAttribute(ATTR) ?? '';

  function paint() {
    for (const el of items) {
      if (idOf(el) === current) {
        el.setAttribute(FOCUSED, 'true');
        el.focus({ preventScroll: true });
      } else {
        el.removeAttribute(FOCUSED);
      }
    }
  }

  function setFocused(id: string) {
    const el = items.find((x) => idOf(x) === id);
    if (!el) return;
    current = id;
    paint();
    onFocus?.(id, el);
  }

  function move(delta: number) {
    if (!items.length) return;
    const i = Math.max(0, items.findIndex((x) => idOf(x) === current));
    let n = i + delta;
    n = wrap ? (n + items.length) % items.length : Math.max(0, Math.min(items.length - 1, n));
    setFocused(idOf(items[n]));
  }

  function refresh() {
    items = Array.from(container.querySelectorAll<HTMLElement>(`[${ATTR}]`));
    for (const el of items) {
      if (!el.hasAttribute('tabindex')) el.tabIndex = -1;
    }
    if (!current || !items.some((x) => idOf(x) === current)) {
      current = opts.initial && items.some((x) => idOf(x) === opts.initial) ? opts.initial : items[0] ? idOf(items[0]) : null;
    }
    paint();
  }

  const onKey = (e: KeyboardEvent) => {
    if (!enabled) return;
    const horiz = layout !== 'column';
    const vert = layout !== 'row';
    if ((e.key === 'ArrowLeft' && horiz) || (e.key === 'ArrowUp' && vert)) {
      e.preventDefault();
      move(-1);
    } else if ((e.key === 'ArrowRight' && horiz) || (e.key === 'ArrowDown' && vert)) {
      e.preventDefault();
      move(1);
    } else if (e.key === 'Enter' && current) {
      e.preventDefault();
      const el = items.find((x) => idOf(x) === current);
      if (el) onSelect?.(current, el);
    }
  };

  const onClick = (e: MouseEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>(`[${ATTR}]`);
    if (!el || !container.contains(el)) return;
    setFocused(idOf(el));
    onSelect?.(idOf(el), el);
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
    setEnabled(v: boolean) {
      enabled = v;
    },
    destroy() {
      window.removeEventListener('keydown', onKey);
      container.removeEventListener('click', onClick);
    },
  };
}
