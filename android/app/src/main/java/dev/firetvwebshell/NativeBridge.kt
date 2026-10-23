package dev.firetvwebshell

import android.app.Activity
import android.speech.tts.TextToSpeech
import android.util.Log
import android.webkit.JavascriptInterface
import org.json.JSONArray
import java.util.Locale

/**
 * Exposed to the page as `window.TvShell`:
 *   TvShell.speak(text, "en-US")   TvShell.stopSpeaking()
 *   TvShell.ttsLanguages()  -> '["en-GB","en-US"]'
 *   TvShell.exitApp()
 *
 * Fire OS quirk: on older sticks the default engine (com.ivona.tts.oem) reports every
 * locale as unsupported to third-party apps, so if it can't speak English we fall back
 * to the bundled Pico engine.
 */
class NativeBridge(private val activity: Activity) {

    @Volatile private var ready = false
    @Volatile private var tts: TextToSpeech = createTts(null)

    private fun createTts(engine: String?): TextToSpeech {
        lateinit var created: TextToSpeech
        val listener = TextToSpeech.OnInitListener { status ->
            if (status != TextToSpeech.SUCCESS) {
                Log.w(TAG, "TTS init failed (engine=${engine ?: "default"}, status=$status)")
                return@OnInitListener
            }
            val englishOk = created.isLanguageAvailable(Locale.US) >= TextToSpeech.LANG_AVAILABLE
            val hasPico = created.engines.any { it.name == PICO }
            if (engine == null && !englishOk && hasPico) {
                Log.w(TAG, "Default TTS engine ${created.defaultEngine} can't speak en-US; using $PICO")
                created.shutdown()
                tts = createTts(PICO)
                return@OnInitListener
            }
            ready = true
            Log.i(TAG, "TTS ready (${engine ?: created.defaultEngine}): ${ttsLanguages()}")
        }
        created = if (engine == null) TextToSpeech(activity.applicationContext, listener)
        else TextToSpeech(activity.applicationContext, listener, engine)
        return created
    }

    /** Speak `text` in BCP-47 `lang` (e.g. "en-US", "hi-IN"); falls back to en-US if unavailable. */
    @JavascriptInterface
    fun speak(text: String, lang: String) {
        if (!ready) {
            Log.w(TAG, "speak() before TTS was ready")
            return
        }
        val t = tts
        val result = t.setLanguage(Locale.forLanguageTag(lang))
        if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
            t.setLanguage(Locale.US)
        }
        t.setSpeechRate(0.9f)
        @Suppress("DEPRECATION")
        t.speak(text, TextToSpeech.QUEUE_FLUSH, null)
    }

    @JavascriptInterface
    fun stopSpeaking() {
        tts.stop()
    }

    /** JSON array of locale tags the active engine can speak. */
    @JavascriptInterface
    fun ttsLanguages(): String {
        if (!ready) return "[]"
        val t = tts
        val tags = sortedSetOf<String>()
        try {
            t.availableLanguages?.forEach { tags.add(it.toLanguageTag()) }
        } catch (e: Exception) {
            // Pico on Fire OS 5 doesn't implement the voices API; the probe below covers it.
        }
        for (tag in PROBE_TAGS) {
            if (t.isLanguageAvailable(Locale.forLanguageTag(tag)) >= TextToSpeech.LANG_AVAILABLE) tags.add(tag)
        }
        return JSONArray(tags.toList()).toString()
    }

    @JavascriptInterface
    fun exitApp() {
        activity.runOnUiThread { activity.finish() }
    }

    fun shutdown() {
        tts.shutdown()
    }

    companion object {
        private const val TAG = MainActivity.TAG
        private const val PICO = "com.svox.pico"
        private val PROBE_TAGS = listOf("en-US", "en-GB", "en-IN", "hi-IN", "es-ES", "de-DE", "fr-FR")
    }
}
