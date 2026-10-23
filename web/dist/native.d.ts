/**
 * native.ts — typed wrapper around the shell's `window.TvShell` bridge, with
 * browser fallbacks so the same page runs on your laptop (speechSynthesis,
 * Escape/Backspace as Back).
 */
interface TvShellBridge {
    speak(text: string, lang: string): void;
    stopSpeaking(): void;
    ttsLanguages(): string;
    exitApp(): void;
}
declare global {
    interface Window {
        TvShell?: TvShellBridge;
    }
}
/** True when running inside the Fire TV shell. */
export declare const isOnTv: () => boolean;
/** Speak text aloud. `lang` is BCP-47, e.g. 'en-US' or 'hi-IN'. */
export declare function speak(text: string, lang?: string): void;
export declare function stopSpeaking(): void;
/** Locale tags the device can speak. On TV this may be [] for a second or two after launch. */
export declare function ttsLanguages(): string[];
/** Close the app (return to the Fire TV home). No-op in a browser. */
export declare function exitApp(): void;
/**
 * Subscribe to the remote's Back key. Returns an unsubscribe function.
 * On TV the shell fires `tvshell-back`; in a browser, Escape/Backspace act as Back.
 */
export declare function onBack(handler: () => void): () => void;
export {};
