import { useState, useRef, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";

interface UseSpeechRecognitionProps {
  language: string;
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
}

interface UseSpeechRecognitionReturn {
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
  transcript: string;
}

export function useSpeechRecognition({
  language,
  onResult,
  onError,
}: UseSpeechRecognitionProps): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (Capacitor.getPlatform && Capacitor.getPlatform() === "android") {
      // Request using native plugin
      (window as any).Capacitor?.Plugins?.VoiceAssistant?.requestPermissions?.();
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const startListening = useCallback(() => {
    
    setTranscript("");
    setIsListening(true);

    // Native (Capacitor)
    if (Capacitor.getPlatform && Capacitor.getPlatform() === "android") {
      const plugin = (window as any).Capacitor?.Plugins?.VoiceAssistant;
      if (!plugin) {
        setIsListening(false);
        if (onError) onError("Native VoiceAssistant plugin not available");
        return;
      }
      // Listen for partial results once
      const listener = plugin.addListener?.("onResult", (data: any) => {
        const match = data?.matches?.[0];
        if (match) setTranscript(match);
      });
      plugin
        .startListening({ language: language === "malayalam" ? "ml-IN" : "en-US", partialResults: true })
        .then((result: any) => {
          const match = result?.matches?.[0];
          if (match) {
            setTranscript(match);
            onResult(match);
          }
        })
        .catch((err: any) => {
          setIsListening(false);
          if (onError) onError(err?.message || String(err));
        })
        .finally(() => {
          listener?.remove?.();
          setIsListening(false);
        });
      return;
    }

    // Web
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsListening(false);
      if (onError) onError("Speech recognition is not supported in this browser.");
      return;
    }
    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language === "malayalam" ? "ml-IN" : "en-US";
    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const t = event.results[event.resultIndex][0].transcript;
      setTranscript(t);
      if (event.results[event.resultIndex].isFinal) {
        onResult(t);
        setTranscript("");
      }
    };
    recognitionRef.current.onerror = (e: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      if (onError) onError(e.error || String(e));
    };
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.start();
  }, [language, onResult, onError]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    // Native (Capacitor)
    if (Capacitor.getPlatform && Capacitor.getPlatform() === "android") {
      (window as any).Capacitor?.Plugins?.VoiceAssistant?.stopListening?.();
      return;
    }
    // Web
    if (recognitionRef.current) recognitionRef.current.stop();
  }, []);

  return { startListening, stopListening, isListening, transcript };
}