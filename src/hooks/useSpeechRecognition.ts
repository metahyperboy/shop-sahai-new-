import { useState, useRef, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { SpeechRecognition as CapSpeechRecognition } from "@capacitor-community/speech-recognition";

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
      CapSpeechRecognition.requestPermissions?.();
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
      CapSpeechRecognition.start({
        language: language === "malayalam" ? "ml-IN" : "en-US",
        maxResults: 1,
        prompt: "Speak now",
        partialResults: true,
        popup: true,
      })
        .then((result) => {
          if (result.matches && result.matches.length > 0) {
            setTranscript(result.matches[0]);
            onResult(result.matches[0]);
          }
        })
        .catch((err) => {
          setIsListening(false);
          if (onError) onError(err.message || String(err));
        })
        .finally(() => setIsListening(false));
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
      CapSpeechRecognition.stop?.();
      return;
    }
    // Web
    if (recognitionRef.current) recognitionRef.current.stop();
  }, []);

  return { startListening, stopListening, isListening, transcript };
}