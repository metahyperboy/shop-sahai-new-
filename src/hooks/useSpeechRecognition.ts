import { useState, useRef, useEffect } from "react";

interface UseSpeechRecognitionProps {
  language: string;
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
}

export const useSpeechRecognition = ({ language, onResult, onError }: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const stopRequested = useRef(false);

  const isEnglish = language === "english";

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language === "malayalam" ? "ml-IN" : "en-US";

        (recognitionRef.current as any).onstart = () => {
          console.log('[SpeechRecognition] Started');
        };
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setTranscript(transcript);
          console.log('[SpeechRecognition] Result:', transcript);
          if (event.results[current].isFinal) {
            onResult(transcript);
          }
        };
        recognitionRef.current.onend = () => {
          setIsListening(false);
          console.log('[SpeechRecognition] Ended');
        };
        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('[SpeechRecognition] Error:', event.error);
          setIsListening(false);
          const errorMessage = isEnglish 
            ? "Sorry, I couldn't understand. Please try again." 
            : "ക്ഷമിക്കണം, എനിക്ക് മനസ്സിലായില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക.";
          onError?.(errorMessage);
        };
        (recognitionRef.current as any).onnomatch = () => {
          console.warn('[SpeechRecognition] No match');
        };
        (recognitionRef.current as any).onaudioend = () => {
          console.log('[SpeechRecognition] Audio end');
        };
        (recognitionRef.current as any).onsoundend = () => {
          console.log('[SpeechRecognition] Sound end');
        };
        (recognitionRef.current as any).onspeechend = () => {
          console.log('[SpeechRecognition] Speech end');
        };
        (recognitionRef.current as any).onabort = () => {
          setIsListening(false);
          console.warn('[SpeechRecognition] Aborted');
          // Retry if not explicitly stopped
          if (!stopRequested.current) {
            setTimeout(() => {
              if (recognitionRef.current && !isListening) {
                try {
                  recognitionRef.current.start();
                  setIsListening(true);
                  console.log('[SpeechRecognition] Restarted after abort');
                } catch (e) {
                  console.error('[SpeechRecognition] Failed to restart:', e);
                }
              }
            }, 500);
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, isEnglish, onResult, onError]);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript("");
      setIsListening(true);
      stopRequested.current = false;
      recognitionRef.current.start();
      console.log('[SpeechRecognition] startListening called');
    } else {
      const errorMessage = isEnglish 
        ? "Voice recognition is not supported in your browser." 
        : "നിങ്ങളുടെ ബ്രൗസറിൽ വോയ്സ് റെക്കഗ്നിഷൻ പിന്തുണയില്ല.";
      onError?.(errorMessage);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      stopRequested.current = true;
      console.log('[SpeechRecognition] stopListening called');
    }
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: !!recognitionRef.current
  };
};