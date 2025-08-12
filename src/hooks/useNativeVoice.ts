import { App } from '@capacitor/app';
import { useEffect, useRef } from 'react';

function useResumeGate() {
  const resumedAtRef = useRef<number>(0);
  useEffect(() => {
    const sub = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) resumedAtRef.current = Date.now();
    });
    return () => sub.remove();
  }, []);
  return () => Date.now() - resumedAtRef.current > 1000; // 1s grace after resume
}

export function useNativeVoice() {
  const canStartNow = useResumeGate();

  const ensurePermission = async () => {
    const plugin = (window as any).Capacitor?.Plugins?.VoiceAssistant;
    if (!plugin) throw new Error('VoiceAssistant plugin not available');
    const avail = await plugin.available?.();
    if (!avail?.available) throw new Error('Speech not available on this device');
    const perm = await plugin.requestPermissions?.();
    if (!perm?.granted) throw new Error('Microphone permission denied');
  };

  const startNativeListening = async () => {
    if (!canStartNow()) {
      setTimeout(startNativeListening, 800);
      return;
    }
    const plugin = (window as any).Capacitor?.Plugins?.VoiceAssistant;
    if (!plugin) throw new Error('VoiceAssistant plugin not available');

    const listener = plugin.addListener?.('onResult', (data: any) => {
      // Consumers can also add their own listener; this is a minimal default
      // eslint-disable-next-line no-console
      console.log('Native onResult:', data);
    });

    try {
      await ensurePermission();
      await plugin.startListening({ language: 'en-US', partialResults: true });
    } finally {
      listener?.remove?.();
    }
  };

  const stopNativeListening = async () => {
    const plugin = (window as any).Capacitor?.Plugins?.VoiceAssistant;
    await plugin?.stopListening?.();
  };

  return { startNativeListening, stopNativeListening, ensurePermission };
}


