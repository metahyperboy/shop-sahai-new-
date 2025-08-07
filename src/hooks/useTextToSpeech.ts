import { useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech as CapTextToSpeech } from '@capacitor-community/text-to-speech';

interface UseTextToSpeechProps {
  language: string;
  voiceURI?: string;
}

interface UseTextToSpeechReturn {
  speak: (text: string, onEnd?: () => void) => Promise<void>;
}

export function useTextToSpeech({ language, voiceURI }: UseTextToSpeechProps): UseTextToSpeechReturn {
  const speak = useCallback(
    async (text: string, onEnd?: () => void) => {
      // Native (Capacitor)
      if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
        await CapTextToSpeech.speak({
          text,
          lang: language === 'malayalam' ? 'ml-IN' : 'en-US',
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
        });
        if (onEnd) onEnd();
        return;
      }
      // Web
      if ('speechSynthesis' in window) {
        const utter = new window.SpeechSynthesisUtterance(text);
        utter.lang = language === 'malayalam' ? 'ml-IN' : 'en-US';
        if (voiceURI) {
          const voices = window.speechSynthesis.getVoices();
          const found = voices.find(v => v.voiceURI === voiceURI);
          if (found) utter.voice = found;
        }
        if (onEnd) utter.onend = onEnd;
        window.speechSynthesis.speak(utter);
      }
    },
    [language, voiceURI]
  );
  return { speak };
};