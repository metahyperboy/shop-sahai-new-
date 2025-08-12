import { useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

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
      // Native (Capacitor Java plugin)
      if (Capacitor.getPlatform && Capacitor.getPlatform() === 'android') {
        const plugin = (window as any).Capacitor?.Plugins?.VoiceAssistant;
        if (plugin?.speak) {
          await plugin.speak({ text, lang: language === 'malayalam' ? 'ml-IN' : 'en-US' });
          if (onEnd) onEnd();
          return;
        }
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