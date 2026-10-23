/**
 * native.ts — typed wrapper around the shell's `window.TvShell` bridge, with
 * browser fallbacks so the same page runs on your laptop (speechSynthesis,
 * Escape/Backspace as Back).
 */
/** True when running inside the Fire TV shell. */
export const isOnTv = () => typeof window !== 'undefined' && !!window.TvShell;
/** Speak text aloud. `lang` is BCP-47, e.g. 'en-US' or 'hi-IN'. */
export function speak(text, lang = 'en-US') {
    if (window.TvShell)
        return window.TvShell.speak(text, lang);
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        window.speechSynthesis.speak(u);
    }
}
export function stopSpeaking() {
    if (window.TvShell)
        window.TvShell.stopSpeaking();
    else if ('speechSynthesis' in window)
        window.speechSynthesis.cancel();
}
/** Locale tags the device can speak. On TV this may be [] for a second or two after launch. */
export function ttsLanguages() {
    if (window.TvShell) {
        try {
            return JSON.parse(window.TvShell.ttsLanguages());
        }
        catch (_a) {
            return [];
        }
    }
    if ('speechSynthesis' in window)
        return Array.from(new Set(window.speechSynthesis.getVoices().map((v) => v.lang)));
    return [];
}
/** Close the app (return to the Fire TV home). No-op in a browser. */
export function exitApp() {
    if (window.TvShell)
        window.TvShell.exitApp();
}
/**
 * Subscribe to the remote's Back key. Returns an unsubscribe function.
 * On TV the shell fires `tvshell-back`; in a browser, Escape/Backspace act as Back.
 */
export function onBack(handler) {
    const onShellBack = () => handler();
    const onKey = (e) => {
        const t = e.target;
        const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
        if (e.key === 'Escape' || e.key === 'GoBack' || (e.key === 'Backspace' && !typing)) {
            e.preventDefault();
            handler();
        }
    };
    window.addEventListener('tvshell-back', onShellBack);
    window.addEventListener('keydown', onKey);
    return () => {
        window.removeEventListener('tvshell-back', onShellBack);
        window.removeEventListener('keydown', onKey);
    };
}
