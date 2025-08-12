package com.shopsahai.app;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;

import androidx.annotation.Nullable;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.util.ArrayList;
import java.util.Locale;

@CapacitorPlugin(
        name = "VoiceAssistant",
        permissions = {
                @Permission(alias = "microphone", strings = { Manifest.permission.RECORD_AUDIO })
        }
)
public class VoiceAssistantPlugin extends Plugin {
    private static final String TAG = "VoiceAssistant";
    private SpeechRecognizer speechRecognizer;
    private Intent recognizerIntent;
    private TextToSpeech textToSpeech;

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        Log.d(TAG, "requestPermissions called");
        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            Log.d(TAG, "requesting microphone permission");
            requestPermissionForAlias("microphone", call, "permissionCallback");
            return;
        }
        JSObject ret = new JSObject();
        ret.put("granted", true);
        call.resolve(ret);
    }

    @SuppressWarnings("unused")
    @PluginMethod(returnType = PluginMethod.RETURN_NONE)
    public void permissionCallback(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", getPermissionState("microphone") == PermissionState.GRANTED);
        call.resolve(ret);
    }

    @PluginMethod
    public void startListening(PluginCall call) {
        String lang = call.getString("language", "en-US");
        boolean partialResults = call.getBoolean("partialResults", true);
        Log.d(TAG, "startListening lang=" + lang + " partialResults=" + partialResults);

        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            Log.w(TAG, "startListening rejected: microphone permission not granted");
            call.reject("Microphone permission not granted");
            return;
        }

        if (!SpeechRecognizer.isRecognitionAvailable(getContext())) {
            Log.e(TAG, "Speech recognition not available on this device");
            call.reject("Speech recognition not available on this device");
            return;
        }

        Context context = getContext();
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
            speechRecognizer = null;
        }
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context);
        recognizerIntent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        recognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        recognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
        recognizerIntent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, partialResults);
        recognizerIntent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);

        PluginCall saved = call;

        speechRecognizer.setRecognitionListener(new RecognitionListener() {
            @Override public void onReadyForSpeech(@Nullable Bundle params) { }
            @Override public void onBeginningOfSpeech() { Log.d(TAG, "onBeginningOfSpeech"); }
            @Override public void onRmsChanged(float rmsdB) { }
            @Override public void onBufferReceived(byte[] buffer) { }
            @Override public void onEndOfSpeech() { Log.d(TAG, "onEndOfSpeech"); }
            @Override public void onError(int error) {
                Log.e(TAG, "onError code=" + error);
                // Notify error via event and resolve to unblock caller
                JSObject data = new JSObject();
                data.put("error", error);
                notifyListeners("onError", data);
                if (!saved.isReleased()) {
                    JSObject ret = new JSObject();
                    ret.put("matches", new JSArray());
                    saved.resolve(ret);
                }
            }
            @Override public void onResults(Bundle results) {
                ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                JSObject ret = new JSObject();
                if (matches != null) {
                    Log.d(TAG, "onResults firstMatch=" + matches.get(0));
                    JSArray arr = new JSArray(matches);
                    ret.put("matches", arr);
                    notifyPartial(arr, true);
                } else {
                    Log.d(TAG, "onResults empty");
                    ret.put("matches", new JSArray());
                }
                if (!saved.isReleased()) saved.resolve(ret);
            }
            @Override public void onPartialResults(Bundle partial) {
                ArrayList<String> matches = partial.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                if (matches != null) {
                    Log.d(TAG, "onPartialResults firstMatch=" + matches.get(0));
                    notifyPartial(new JSArray(matches), false);
                }
            }
            @Override public void onEvent(int eventType, Bundle params) { }
        });

        speechRecognizer.startListening(recognizerIntent);
    }

    @PluginMethod
    public void available(PluginCall call) {
        boolean avail = SpeechRecognizer.isRecognitionAvailable(getContext());
        JSObject ret = new JSObject();
        ret.put("available", avail);
        call.resolve(ret);
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", getPermissionState("microphone") == PermissionState.GRANTED);
        call.resolve(ret);
    }

    private void notifyPartial(JSArray matches, boolean isFinal) {
        JSObject data = new JSObject();
        data.put("matches", matches);
        data.put("final", isFinal);
        notifyListeners("onResult", data);
    }

    @PluginMethod
    public void stopListening(PluginCall call) {
        Log.d(TAG, "stopListening called");
        if (speechRecognizer != null) {
            speechRecognizer.stopListening();
            speechRecognizer.cancel();
            speechRecognizer.destroy();
            speechRecognizer = null;
        }
        call.resolve();
    }

    @PluginMethod
    public void speak(PluginCall call) {
        String text = call.getString("text", "");
        String lang = call.getString("lang", "en-US");
        Log.d(TAG, "speak text=" + (text != null ? Math.min(text.length(), 30) : 0) + " chars lang=" + lang);
        if (textToSpeech == null) {
            textToSpeech = new TextToSpeech(getContext(), status -> {
                if (status == TextToSpeech.SUCCESS) {
                    Locale locale = localeFromTag(lang);
                    textToSpeech.setLanguage(locale);
                    speakInternal(text, call);
                } else {
                    Log.e(TAG, "TTS init failed status=" + status);
                    call.reject("TTS init failed: " + status);
                }
            });
        } else {
            Locale locale = localeFromTag(lang);
            textToSpeech.setLanguage(locale);
            speakInternal(text, call);
        }
    }

    private void speakInternal(String text, PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            int r = textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, "utteranceId");
            if (r == TextToSpeech.SUCCESS) {
                call.resolve();
            } else {
                call.reject("TTS speak failed");
            }
        } else {
            @SuppressWarnings("deprecation")
            int r = textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null);
            if (r == TextToSpeech.SUCCESS) {
                call.resolve();
            } else {
                call.reject("TTS speak failed");
            }
        }
    }

    private Locale localeFromTag(String tag) {
        try {
            return Locale.forLanguageTag(tag);
        } catch (Exception e) {
            return Locale.ENGLISH;
        }
    }
}


