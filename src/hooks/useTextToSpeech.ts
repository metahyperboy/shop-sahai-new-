import { useCallback } from "react";

interface UseTextToSpeechProps {
  language: string;
}

export const useTextToSpeech = ({ language }: UseTextToSpeechProps) => {
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "malayalam" ? "ml-IN" : "en-US";
      speechSynthesis.speak(utterance);
    }
  }, [language]);

  return { speak };
};