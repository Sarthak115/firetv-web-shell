export interface UseFocusGroupOptions {
    onSelect?: (id: string) => void;
    /** Which arrows move focus. Default 'row'. */
    layout?: 'row' | 'column' | 'both';
    initial?: string;
    /** Turn key handling off, e.g. while another screen/dialog owns the keys. */
    enabled?: boolean;
    wrap?: boolean;
}
export declare function useFocusGroup(ids: string[], opts?: UseFocusGroupOptions): {
    focused: string;
    setFocused: import("react").Dispatch<import("react").SetStateAction<string>>;
    bind: (id: string) => {
        ref: (el: HTMLElement | null) => void;
        tabIndex: number;
        'data-focused': string | undefined;
        onClick: () => void;
        onMouseEnter: () => void;
    };
};
