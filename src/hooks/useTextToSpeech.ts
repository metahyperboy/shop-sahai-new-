import { useCallback } from "react";

interface UseTextToSpeechProps {
  language: string;
  voiceURI?: string;
}

export const useTextToSpeech = ({ language, voiceURI }: UseTextToSpeechProps) => {
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "malayalam" ? "ml-IN" : "en-US";
      // Select Malayalam voice if available and requested
      if (language === "malayalam") {
        const voices = window.speechSynthesis.getVoices();
        let mlVoice = undefined;
        if (voiceURI) {
          mlVoice = voices.find(v => v.voiceURI === voiceURI);
        } else {
          mlVoice = voices.find(v => v.lang === "ml-IN");
        }
        if (mlVoice) utterance.voice = mlVoice;
      }
      if (onEnd) utterance.onend = onEnd;
      speechSynthesis.speak(utterance);
    }
  }, [language, voiceURI]);

  return { speak };
};