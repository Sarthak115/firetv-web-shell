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
export declare function createFocusGroup(container: HTMLElement, opts?: FocusGroupOptions): FocusGroup;
