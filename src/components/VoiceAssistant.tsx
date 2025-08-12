
import { useState, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Mic, MicOff, Volume2 } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { VoiceCommandService } from "@/services/voiceCommandService";
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { universalNumberParser } from "@/services/voiceCommandService";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

type BorrowConversationStep = 'idle' | 'askName' | 'askAmount' | 'askPaid' | 'confirm' | 'done';
interface BorrowConversationState {
  step: BorrowConversationStep;
  name: string;
  amount: string;
  paid: string;
}

type PurchaseConversationStep = 'idle' | 'askSupplier' | 'askAmount' | 'askPaid' | 'confirm' | 'done';
interface PurchaseConversationState {
  step: PurchaseConversationStep;
  supplier: string;
  amount: string;
  paid: string;
}

interface VoiceAssistantProps {
  onClose: () => void;
  language: string;
}

// Debounce helper
function debounce(fn: (...args: any[]) => void, delay: number) {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const VoiceAssistant = ({ onClose, language }: VoiceAssistantProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [borrowState, setBorrowState] = useState<BorrowConversationState>({
    step: 'idle',
    name: '',
    amount: '',
    paid: ''
  });
  const [purchaseState, setPurchaseState] = useState<PurchaseConversationState>({
    step: 'idle',
    supplier: '',
    amount: '',
    paid: ''
  });
  const [mlVoices, setMlVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [enVoices, setEnVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | undefined>(undefined);
  // Add state for editable confirmation fields
  const [borrowConfirmEdit, setBorrowConfirmEdit] = useState<BorrowConversationState | null>(null);
  const [purchaseConfirmEdit, setPurchaseConfirmEdit] = useState<PurchaseConversationState | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);
  const micCooldownRef = useRef<NodeJS.Timeout | null>(null);
  const [micCooldown, setMicCooldown] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const populateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Malayalam voices
        const ml = voices.filter(v => v.lang === "ml-IN");
        setMlVoices(ml);
        // English voices
        const en = voices.filter(v => v.lang === "en-US");
        setEnVoices(en);
        // Default to high-quality voice for selected language
        if (language === "malayalam" && ml.length > 0 && !selectedVoiceURI) {
          // Prefer Google, Microsoft, Apple voices
          const preferred = ml.find(v => /Google|Microsoft|Apple/i.test(v.name));
          setSelectedVoiceURI(preferred ? preferred.voiceURI : ml[0].voiceURI);
        } else if (language === "english" && en.length > 0 && !selectedVoiceURI) {
          const preferred = en.find(v => /Google|Microsoft|Apple/i.test(v.name));
          setSelectedVoiceURI(preferred ? preferred.voiceURI : en[0].voiceURI);
        }
      };
      populateVoices();
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }
  }, [language, selectedVoiceURI]);

  const isEnglish = language === "english";
  // Always use Malayalam for voice assistant language
  const voiceLang = 'malayalam';
  const { speak: speakRaw } = useTextToSpeech({ language: voiceLang, voiceURI: selectedVoiceURI });
  // Wrap speak to set isSpeaking
  const speak = useCallback((text: string, onDone?: () => void) => {
    setIsSpeaking(true);
    speakRaw(text, () => {
      setIsSpeaking(false);
      if (onDone) onDone();
    });
  }, [speakRaw]);
  const speakMemo = useCallback(speak, [speak]);

  // Helper to auto-restart listening after TTS, with cooldown
  const autoListen = () => {
    if (!isListening && !isSpeaking && borrowState.step !== 'done' && purchaseState.step !== 'done') {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
      cooldownRef.current = setTimeout(() => {
        if (!isSpeaking) startListening();
      }, 500); // 500ms cooldown
    }
  };

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    const result = await VoiceCommandService.processCommand(command, language);
    setResponse(result.message);
    setDebugInfo(result.debug || "");
    setIsProcessing(false);
    // Speak summary if available, else full message
    speakMemo(result.summary || result.message);
    // Fire event if data was added
    if (result.success && /successfully|വിജയകരമായി/.test(result.message)) {
      window.dispatchEvent(new CustomEvent('data-updated'));
    }
  };

  // Only one handleSpeechError function
  const handleSpeechError = (error: string) => {
    setResponse(error);
    setMicError(error);
    setIsSpeaking(false);
    setMicCooldown(true);
    if (micCooldownRef.current) clearTimeout(micCooldownRef.current);
    micCooldownRef.current = setTimeout(() => setMicCooldown(false), 1000);
  };

  // Helper to reset borrow conversation
  const resetBorrowConversation = () => setBorrowState({ step: 'idle', name: '', amount: '', paid: '' });

  // Conversational flow for Borrow
  const startBorrowConversation = () => {
    setBorrowState({ step: 'askName', name: '', amount: '', paid: '' });
    setResponse(isEnglish ? 'Let’s add a borrow record. Who did you borrow from?' : 'ആർക്കാണ് കടം കൊടുത്തത്?');
    speakMemo(isEnglish ? 'Let’s add a borrow record. Who did you borrow from?' : 'ആർക്കാണ് കടം കൊടുത്തത്?', autoListen);
  };

  // Process user reply in borrow flow
  const handleBorrowReply = (transcript: string) => {
    if (borrowState.step === 'askName') {
      setBorrowState(s => ({ ...s, name: transcript, step: 'askAmount' }));
      setResponse(isEnglish ? `How much did you borrow from ${transcript}?` : `${transcript} എത്ര രൂപ കടം കൊടുത്തു?`);
      speakMemo(isEnglish ? `How much did you borrow from ${transcript}?` : `${transcript} എത്ര രൂപ കടം കൊടുത്തു?`, autoListen);
    } else if (borrowState.step === 'askAmount') {
      // Extract number
      let amount = transcript.match(/\d+/)?.[0] || transcript;
      // Try to parse Malayalam/English number words
      const parsedAmount = universalNumberParser(transcript);
      if (parsedAmount !== null) amount = parsedAmount.toString();
      setBorrowState(s => ({ ...s, amount, step: 'askPaid' }));
      setResponse(isEnglish ? 'How much have you paid back so far?' : '\u0d07\u0d24\u0d41\u0d35\u0d30\u0d46 \u0d0e\u0d24\u0d4d\u0d30 \u0d30\u0d42\u0d2a \u0d24\u0d3f\u0d30\u0d3f\u0d15\u0d46 \u0d28\u0d7d\u0d15\u0d3f?');
      speakMemo(isEnglish ? 'How much have you paid back so far?' : '\u0d07\u0d24\u0d41\u0d35\u0d30\u0d46 \u0d0e\u0d24\u0d4d\u0d30 \u0d30\u0d42\u0d2a \u0d24\u0d3f\u0d30\u0d3f\u0d15\u0d46 \u0d28\u0d7d\u0d15\u0d3f?', autoListen);
    } else if (borrowState.step === 'askPaid') {
      let paid = transcript.match(/\d+/)?.[0] || transcript;
      const parsedPaid = universalNumberParser(transcript);
      if (parsedPaid !== null) paid = parsedPaid.toString();
      const newState: BorrowConversationState = { ...borrowState, paid, step: 'confirm' as BorrowConversationStep };
      setBorrowState(newState);
      setBorrowConfirmEdit(newState); // set editable fields
      setResponse(isEnglish
        ? `You borrowed 9${borrowState.amount} from ${borrowState.name} and have paid back 9${paid}. Should I save this?`
        : `നിങ്ങൾ ${borrowState.name}ക്ക് ₹${borrowState.amount} കടം കൊടുത്തു, ഇതുവരെ ₹${paid} തിരികെ നൽകി. സേവ് ചെയ്യട്ടേ?`
      );
      speakMemo(isEnglish
        ? `You borrowed 9${borrowState.amount} from ${borrowState.name} and have paid back 9${paid}. Should I save this?`
        : `നിങ്ങൾ ${borrowState.name}ക്ക് ₹${borrowState.amount} കടം കൊടുത്തു, ഇതുവരെ ₹${paid} തിരികെ നൽകി. സേവ് ചെയ്യട്ടേ?`, autoListen
      );
    } else if (borrowState.step === 'confirm') {
      if (/yes|save|okay|confirm|ശരി|സേവ്|ഉണ്ട്/i.test(transcript)) {
        // Use edited fields if present
        const data = borrowConfirmEdit || borrowState;
        window.dispatchEvent(new CustomEvent('add-borrow', { detail: {
          name: data.name,
          totalGiven: data.amount,
          amountPaid: data.paid
        }}));
        setBorrowState(s => ({ ...s, step: 'done' }));
        setBorrowConfirmEdit(null);
        setResponse(isEnglish ? 'Record added successfully!' : 'റെക്കോർഡ് വിജയകരമായി ചേർത്തു!');
      } else if (/no|change|back|വേണ്ട|മാറ്റം|തിരിച്ച്/i.test(transcript)) {
        setBorrowState(s => ({ ...s, step: 'askAmount' }));
        setBorrowConfirmEdit(null);
        setResponse(isEnglish ? 'Okay, let’s change the amount. How much did you borrow?' : 'ശരി, എത്ര രൂപ കടം എടുത്തു?');
        speakMemo(isEnglish ? 'Okay, let’s change the amount. How much did you borrow?' : 'ശരി, എത്ര രൂപ കടം എടുത്തു?', autoListen);
      } else {
        setResponse(isEnglish ? 'Please say Yes to save, or No to change.' : 'സേവ് ചെയ്യാൻ ഉണ്ട് എന്ന് പറയുക, അല്ലെങ്കിൽ മാറ്റാൻ വേണ്ട എന്ന് പറയുക.');
        speakMemo(isEnglish ? 'Please say Yes to save, or No to change.' : 'സേവ് ചെയ്യാൻ ഉണ്ട് എന്ന് പറയുക, അല്ലെങ്കിൽ മാറ്റാൻ വേണ്ട എന്ന് പറയുക.', autoListen);
      }
    }
  };

  // Listen for quick commands
  const handleQuickCommands = (transcript: string) => {
    if (/clear|reset|വ്യക്തം|റീസെറ്റ്/i.test(transcript)) {
      resetBorrowConversation();
      setResponse(isEnglish ? 'Form cleared. Let’s start again. Who did you borrow from?' : 'ഫോം ക്ലിയർ ചെയ്തു. ആരിൽ നിന്നാണ് കടം എടുത്തത്?');
      speakMemo(isEnglish ? 'Form cleared. Let’s start again. Who did you borrow from?' : 'ഫോം ക്ലിയർ ചെയ്തു. ആരിൽ നിന്നാണ് കടം എടുത്തത്?', autoListen);
      setBorrowState(s => ({ ...s, step: 'askName' }));
      return true;
    }
    if (/cancel|exit|stop|വേണ്ട|പുറത്ത്/i.test(transcript)) {
      resetBorrowConversation();
      setResponse(isEnglish ? 'Cancelled.' : 'റദ്ദാക്കി.');
      speakMemo(isEnglish ? 'Cancelled.' : 'റദ്ദാക്കി.');
      return true;
    }
    return false;
  };

  const resetPurchaseConversation = () => setPurchaseState({ step: 'idle', supplier: '', amount: '', paid: '' });
  const startPurchaseConversation = () => {
    setPurchaseState({ step: 'askSupplier', supplier: '', amount: '', paid: '' });
    setResponse(isEnglish ? 'Let’s add a purchase record. Who is the supplier?' : 'വാങ്ങൽ രേഖ ചേർക്കാം. സപ്ലയർ ആരാണ്?');
    speakMemo(isEnglish ? 'Let’s add a purchase record. Who is the supplier?' : 'വാങ്ങൽ രേഖ ചേർക്കാം. സപ്ലയർ ആരാണ്?', autoListen);
  };
  const handlePurchaseReply = (transcript: string) => {
    if (purchaseState.step === 'askSupplier') {
      setPurchaseState(s => ({ ...s, supplier: transcript, step: 'askAmount' }));
      setResponse(isEnglish ? `How much did you purchase from ${transcript}?` : `${transcript}യിൽ നിന്ന് എത്ര രൂപയ്ക്ക് വാങ്ങി?`);
      speakMemo(isEnglish ? `How much did you purchase from ${transcript}?` : `${transcript}യിൽ നിന്ന് എത്ര രൂപയ്ക്ക് വാങ്ങി?`, autoListen);
    } else if (purchaseState.step === 'askAmount') {
      let amount = transcript.match(/\d+/)?.[0] || transcript;
      const parsedAmount = universalNumberParser(transcript);
      if (parsedAmount !== null) amount = parsedAmount.toString();
      setPurchaseState(s => ({ ...s, amount, step: 'askPaid' }));
      setResponse(isEnglish ? 'How much have you paid so far?' : '\u0d07\u0d24\u0d41\u0d35\u0d30\u0d46 \u0d0e\u0d24\u0d4d\u0d30 \u0d30\u0d42\u0d2a \u0d28\u0d7d\u0d15\u0d3f?');
      speakMemo(isEnglish ? 'How much have you paid so far?' : '\u0d07\u0d24\u0d41\u0d35\u0d30\u0d46 \u0d0e\u0d24\u0d4d\u0d30 \u0d30\u0d42\u0d2a \u0d28\u0d7d\u0d15\u0d3f?', autoListen);
    } else if (purchaseState.step === 'askPaid') {
      let paid = transcript.match(/\d+/)?.[0] || transcript;
      const parsedPaid = universalNumberParser(transcript);
      if (parsedPaid !== null) paid = parsedPaid.toString();
      const newState: PurchaseConversationState = { ...purchaseState, paid, step: 'confirm' as PurchaseConversationStep };
      setPurchaseState(newState);
      setPurchaseConfirmEdit(newState); // set editable fields
      setResponse(isEnglish
        ? `You purchased for ₹${purchaseState.amount} from ${purchaseState.supplier} and have paid ₹${paid}. Should I save this?`
        : `നിങ്ങൾ ${purchaseState.supplier}യിൽ നിന്ന് ₹${purchaseState.amount}ക്ക് വാങ്ങി, ഇതുവരെ ₹${paid} നൽകി. ഇത് സേവ് ചെയ്യട്ടേ?`
      );
      speakMemo(isEnglish
        ? `You purchased for ₹${purchaseState.amount} from ${purchaseState.supplier} and have paid ₹${paid}. Should I save this?`
        : `നിങ്ങൾ ${purchaseState.supplier}യിൽ നിന്ന് ₹${purchaseState.amount}ക്ക് വാങ്ങി, ഇതുവരെ ₹${paid} നൽകി. ഇത് സേവ് ചെയ്യട്ടേ?`, autoListen
      );
    } else if (purchaseState.step === 'confirm') {
      if (/yes|save|okay|confirm|ശരി|സേവ്|ഉണ്ട്/i.test(transcript)) {
        const data = purchaseConfirmEdit || purchaseState;
        window.dispatchEvent(new CustomEvent('add-purchase', { detail: {
          supplierName: data.supplier,
          totalAmount: data.amount,
          amountPaid: data.paid
        }}));
        setPurchaseState(s => ({ ...s, step: 'done' }));
        setPurchaseConfirmEdit(null);
        setResponse(isEnglish ? 'Purchase record added successfully!' : 'വാങ്ങൽ രേഖ വിജയകരമായി ചേർത്തു!');
      } else if (/no|change|back|വേണ്ട|മാറ്റം|തിരിച്ച്/i.test(transcript)) {
        setPurchaseState(s => ({ ...s, step: 'askAmount' }));
        setPurchaseConfirmEdit(null);
        setResponse(isEnglish ? 'Okay, let’s change the amount. How much did you purchase?' : 'ശരി, എത്ര രൂപയ്ക്ക് വാങ്ങി?');
        speakMemo(isEnglish ? 'Okay, let’s change the amount. How much did you purchase?' : 'ശരി, എത്ര രൂപയ്ക്ക് വാങ്ങി?', autoListen);
      } else {
        setResponse(isEnglish ? 'Please say Yes to save, or No to change.' : 'സേവ് ചെയ്യാൻ ഉണ്ട് എന്ന് പറയുക, അല്ലെങ്കിൽ മാറ്റാൻ വേണ്ട എന്ന് പറയുക.');
        speakMemo(isEnglish ? 'Please say Yes to save, or No to change.' : 'സേവ് ചെയ്യാൻ ഉണ്ട് എന്ന് പറയുക, അല്ലെങ്കിൽ മാറ്റാൻ വേണ്ട എന്ന് പറയുക.', autoListen);
      }
    }
  };
  const handlePurchaseQuickCommands = (transcript: string) => {
    if (/clear|reset|വ്യക്തം|റീസെറ്റ്/i.test(transcript)) {
      resetPurchaseConversation();
      setResponse(isEnglish ? 'Form cleared. Let’s start again. Who is the supplier?' : 'ഫോം ക്ലിയർ ചെയ്തു. സപ്ലയർ ആരാണ്?');
      speakMemo(isEnglish ? 'Form cleared. Let’s start again. Who is the supplier?' : 'ഫോം ക്ലിയർ ചെയ്തു. സപ്ലയർ ആരാണ്?', autoListen);
      setPurchaseState(s => ({ ...s, step: 'askSupplier' }));
      return true;
    }
    if (/cancel|exit|stop|വേണ്ട|പുറത്ത്/i.test(transcript)) {
      resetPurchaseConversation();
      setResponse(isEnglish ? 'Cancelled.' : 'റദ്ദാക്കി.');
      speakMemo(isEnglish ? 'Cancelled.' : 'റദ്ദാക്കി.');
      return true;
    }
    return false;
  };

  // Main handler for transcript in conversational mode
  const handleTranscript = (transcript: string) => {
    // Purchase conversational flow
    if (purchaseState.step !== 'idle') {
      if (!handlePurchaseQuickCommands(transcript)) {
        handlePurchaseReply(transcript);
      }
      return;
    }
    // Borrow conversational flow
    if (borrowState.step !== 'idle') {
      if (!handleQuickCommands(transcript)) {
        handleBorrowReply(transcript);
      }
      return;
    }
    // Fallback: check for "add purchase" command to start flow
    if (/purchase|buy|വാങ്ങൽ|വാങ്ങി/i.test(transcript)) {
      startPurchaseConversation();
      return;
    }
    // Fallback: check for "add borrow" command to start flow
    if (/borrow|കടം/i.test(transcript)) {
      startBorrowConversation();
      return;
    }
    // Otherwise, fallback to old processVoiceCommand
    processVoiceCommand(transcript);
  };

  // Debounced transcript handler (increased to 400ms)
  const debouncedHandleTranscript = useMemo(() => debounce(handleTranscript, 400), [handleTranscript]);

  // Use debounced handler in useSpeechRecognition
  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechRecognition({
    language: voiceLang,
    onResult: debouncedHandleTranscript,
    onError: handleSpeechError
  });
  const [micError, setMicError] = useState("");
  useEffect(() => {
    // Log native plugin presence for debugging
    const hasPlugin = Boolean((window as any).Capacitor?.Plugins?.VoiceAssistant);
    console.log('[VoiceAssistant] Native plugin available:', hasPlugin);
    if (hasPlugin) {
      (window as any).Capacitor?.Plugins?.VoiceAssistant?.available?.().then((r: any) => {
        console.log('[VoiceAssistant] Speech available:', r);
      });
      (window as any).Capacitor?.Plugins?.VoiceAssistant?.checkPermissions?.().then((r: any) => {
        console.log('[VoiceAssistant] Mic permission granted:', r);
      });
    }
  }, []);

  // Detect unsupported browsers (iOS/Safari)
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (!isSupported || isIOS || isSafari) {
      setMicError(isEnglish ? "Voice assistant is not supported on this browser. Please use Chrome on Android or desktop." : "ഈ ബ്രൗസറിൽ വോയ്സ് അസിസ്റ്റന്റ് പിന്തുണയ്ക്കുന്നില്ല. Android Chrome അല്ലെങ്കിൽ ഡെസ്ക്ടോപ്പ് ഉപയോഗിക്കുക.");
    }
  }, [isSupported, isEnglish]);

  // Listen for add-borrow event and trigger BorrowManagement add
  React.useEffect(() => {
    const handler = (e: any) => {
      // Dispatch a custom event for BorrowManagement to handle
      window.dispatchEvent(new CustomEvent('data-updated'));
    };
    window.addEventListener('add-borrow', handler);
    return () => window.removeEventListener('add-borrow', handler);
  }, []);

  // Listen for add-purchase event and trigger ItemPurchase add
  React.useEffect(() => {
    const handler = (e: any) => {
      window.dispatchEvent(new CustomEvent('data-updated'));
    };
    window.addEventListener('add-purchase', handler);
    return () => window.removeEventListener('add-purchase', handler);
  }, []);

  // Listen for add-borrow-result to give accurate feedback
  useEffect(() => {
    if (borrowState.step === 'done') return; // Already handled
    const handleAddBorrowResult = (e: any) => {
      if (borrowState.step === 'done') return; // Already handled
      if (e.detail?.success) {
        setResponse(isEnglish ? 'Record added successfully!' : '\u0d31\u0d46\u0d15\u0d4d\u0d15\u0d4b\u0d7c\u0d21\u0d4d \u0d35\u0d3f\u0d1c\u0d2f\u0d15\u0d30\u0d2e\u0d3e\u0d2f\u0d3f \u0d1a\u0d47\u0d7c\u0d24\u0d4d\u0d24\u0d41!');
        toast({
          title: isEnglish ? 'Success' : 'വിജയം',
          description: isEnglish ? 'Borrow record saved and table updated.' : 'കടം രേഖ സംരക്ഷിച്ചു, പട്ടിക പുതുക്കി.',
          variant: 'default',
        });
        setBorrowState(s => ({ ...s, step: 'done' }));
        setBorrowConfirmEdit(null);
      } else {
        setResponse(isEnglish ? `Error: ${e.detail?.error || 'Failed to add record.'}` : `\u0d24\u0d3f\u0d30\u0d3f\u0d1a\u0d4d\u0d1a\u0d4d: ${e.detail?.error || '\u0d31\u0d46\u0d15\u0d4d\u0d15\u0d4b\u0d7c\u0d21\u0d4d \u0d1a\u0d47\u0d7c\u0d24\u0d3e\u0d7b'}`);
        toast({
          title: isEnglish ? 'Error' : 'പിശക്',
          description: e.detail?.error || (isEnglish ? 'Failed to add record.' : 'റെക്കോർഡ് ചേർക്കാൻ കഴിഞ്ഞില്ല.'),
          variant: 'destructive',
        });
      }
    };
    window.addEventListener('add-borrow-result', handleAddBorrowResult);
    return () => window.removeEventListener('add-borrow-result', handleAddBorrowResult);
  }, [isEnglish, borrowState.step, toast]);

  // Place handleVoiceClick above its usage
  const handleVoiceClick = () => {
    if (micCooldown) return;
    setMicError("");
    setResponse("");
    if (!isSupported) {
      setMicError(isEnglish ? "Your browser does not support voice recognition." : "നിങ്ങളുടെ ബ്രൗസർ വോയ്സ് റെക്കഗ്നിഷൻ പിന്തുണയ്ക്കുന്നില്ല.");
      return;
    }
    if (isSpeaking) {
      setMicError(isEnglish ? "Please wait for the assistant to finish speaking." : "വോയ്സ് അസിസ്റ്റന്റ് സംസാരിക്കുന്നത് കഴിയുന്നത് വരെ കാത്തിരിക്കുക.");
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      setResponse("");
      startListening();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">
            {isEnglish ? "Voice Assistant" : "വോയ്സ് അസിസ്റ്റന്റ്"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        {/* Malayalam and English voice selector */}
        {((mlVoices.length > 1) && (
          <div className="mb-2 text-center">
            <label className="text-xs mr-2">{isEnglish ? "Select Voice:" : "വോയ്സ് തിരഞ്ഞെടുക്കുക:"}</label>
            <select
              className="text-xs p-1 rounded border"
              value={selectedVoiceURI}
              onChange={e => setSelectedVoiceURI(e.target.value)}
            >
              {mlVoices.map(v => (
                <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
              ))}
            </select>
          </div>
        ))}
        <CardContent className="space-y-4">
          {/* Voice Button */}
          <div className="flex justify-center">
            <Button
              className={`rounded-full w-24 h-24 sm:w-20 sm:h-20 p-4 ${
                isListening ? "bg-red-500 hover:bg-red-600" : isSpeaking ? "bg-yellow-400 hover:bg-yellow-500" : "bg-primary hover:bg-primary/90"
              }`}
              onClick={handleVoiceClick}
              disabled={isProcessing || !isSupported || isSpeaking || micCooldown}
            >
              {isListening ? <MicOff className="h-8 w-8" /> : isSpeaking ? <span className="animate-spin">🔊</span> : <Mic className="h-8 w-8" />}
            </Button>
          </div>

          {/* Status */}
          <div className="text-center">
            {isSpeaking && !micError && (
              <p className="text-sm text-yellow-700 animate-pulse">
                {isEnglish ? "Speaking..." : "സംസാരിക്കുന്നു..."}
              </p>
            )}
            {isListening && (
              <p className="text-sm text-muted-foreground animate-pulse">
                {isEnglish ? "Listening..." : "കേൾക്കുന്നു..."}
              </p>
            )}
            {isProcessing && (
              <p className="text-sm text-muted-foreground">
                {isEnglish ? "Processing..." : "പ്രോസസ്സ് ചെയ്യുന്നു..."}
              </p>
            )}
          </div>

          {/* Error/Warning for mic issues */}
          {micError && (
            <div className="text-xs text-red-600 text-center mb-2">{micError}</div>
          )}

          {/* Transcript */}
          {transcript && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                {isEnglish ? "You said:" : "നിങ്ങൾ പറഞ്ഞത്:"}
              </p>
              <p className="text-sm text-muted-foreground">{transcript}</p>
            </div>
          )}

          {/* Response */}
          {(borrowState.step === 'confirm' && borrowConfirmEdit) && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-300 mb-2">
              <p className="text-sm font-semibold mb-2">{isEnglish ? 'Confirm Borrow Details:' : 'കടം വിശദാംശങ്ങൾ സ്ഥിരീകരിക്കുക:'}</p>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="borrower-name" className="text-xs">Name:</Label>
                  <Input id="borrower-name" className="w-full" value={borrowConfirmEdit.name} onChange={e => setBorrowConfirmEdit(s => s && ({ ...s, name: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="borrow-amount" className="text-xs">Amount:</Label>
                  <Input id="borrow-amount" className="w-full" value={borrowConfirmEdit.amount} onChange={e => setBorrowConfirmEdit(s => s && ({ ...s, amount: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="borrow-paid" className="text-xs">Paid Back:</Label>
                  <Input id="borrow-paid" className="w-full" value={borrowConfirmEdit.paid} onChange={e => setBorrowConfirmEdit(s => s && ({ ...s, paid: e.target.value }))} />
                </div>
                {debugInfo && <div className="text-xs text-muted-foreground mt-1">Debug: {debugInfo}</div>}
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => {
                    // Save with edited fields
                    window.dispatchEvent(new CustomEvent('add-borrow', { detail: {
                      name: borrowConfirmEdit.name,
                      totalGiven: borrowConfirmEdit.amount,
                      amountPaid: borrowConfirmEdit.paid
                    }}));
                    setBorrowState(s => ({ ...s, step: 'done' }));
                    setBorrowConfirmEdit(null);
                    setResponse(isEnglish ? 'Record added successfully!' : 'റെക്കോർഡ് വിജയകരമായി ചേർത്തു!');
                  }}>{isEnglish ? 'Save' : 'സേവ് ചെയ്യുക'}</Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setBorrowState(s => ({ ...s, step: 'askAmount' }));
                    setBorrowConfirmEdit(null);
                  }}>{isEnglish ? 'Edit' : 'മാറ്റം ചെയ്യുക'}</Button>
                </div>
              </div>
            </div>
          )}
          {(purchaseState.step === 'confirm' && purchaseConfirmEdit) && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-300 mb-2">
              <p className="text-sm font-semibold mb-2">{isEnglish ? 'Confirm Purchase Details:' : 'വാങ്ങൽ വിശദാംശങ്ങൾ സ്ഥിരീകരിക്കുക:'}</p>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="supplier-name" className="text-xs">Supplier:</Label>
                  <Input id="supplier-name" className="w-full" value={purchaseConfirmEdit.supplier} onChange={e => setPurchaseConfirmEdit(s => s && ({ ...s, supplier: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="purchase-amount" className="text-xs">Amount:</Label>
                  <Input id="purchase-amount" className="w-full" value={purchaseConfirmEdit.amount} onChange={e => setPurchaseConfirmEdit(s => s && ({ ...s, amount: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="purchase-paid" className="text-xs">Paid:</Label>
                  <Input id="purchase-paid" className="w-full" value={purchaseConfirmEdit.paid} onChange={e => setPurchaseConfirmEdit(s => s && ({ ...s, paid: e.target.value }))} />
                </div>
                {/* Validation and warnings */}
                {(!purchaseConfirmEdit.supplier || /unknown|blank|supplier|person|അജ്ഞാത/i.test(purchaseConfirmEdit.supplier)) && (
                  <div className="text-red-600 font-bold">{isEnglish ? 'Supplier name missing or not recognized!' : 'സപ്ലയർ പേര് കണ്ടെത്തിയില്ല!'}</div>
                )}
                {(!purchaseConfirmEdit.amount || isNaN(Number(purchaseConfirmEdit.amount))) && (
                  <div className="text-red-600 font-bold">{isEnglish ? 'Amount missing or not recognized!' : 'തുക കണ്ടെത്തിയില്ല!'}</div>
                )}
                {debugInfo && <div className="text-xs text-muted-foreground mt-1">Debug: {debugInfo}</div>}
                <div className="flex gap-2 mt-2">
                  <Button size="sm" disabled={(!purchaseConfirmEdit.supplier || /unknown|blank|supplier|person|അജ്ഞാത/i.test(purchaseConfirmEdit.supplier)) || (!purchaseConfirmEdit.amount || isNaN(Number(purchaseConfirmEdit.amount)))} onClick={() => {
                    window.dispatchEvent(new CustomEvent('add-purchase', { detail: {
                      supplierName: purchaseConfirmEdit.supplier,
                      totalAmount: purchaseConfirmEdit.amount,
                      amountPaid: purchaseConfirmEdit.paid
                    }}));
                    setPurchaseState(s => ({ ...s, step: 'done' }));
                    setPurchaseConfirmEdit(null);
                    setResponse(isEnglish ? 'Purchase record added successfully!' : 'വാങ്ങൽ രേഖ വിജയകരമായി ചേർത്തു!');
                  }}>{isEnglish ? 'Save' : 'സേവ് ചെയ്യുക'}</Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setPurchaseState(s => ({ ...s, step: 'askAmount' }));
                    setPurchaseConfirmEdit(null);
                  }}>{isEnglish ? 'Edit' : 'മാറ്റം ചെയ്യുക'}</Button>
                </div>
              </div>
            </div>
          )}
          {response && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <div className="flex items-start space-x-2">
                <Volume2 className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary">
                    {isEnglish ? "Assistant:" : "സഹായി:"}
                  </p>
                  <p className="text-sm">{response}</p>
                  {debugInfo && (
                    <p className="text-xs text-muted-foreground mt-1">Debug: {debugInfo}</p>
                  )}
                  {debugInfo && debugInfo.includes('[NAME BLANK OR UNKNOWN]') && (
                    <p className="text-xs text-red-600 mt-1">
                      {isEnglish ? 'Warning: Name could not be recognized. Please try again, speaking the name clearly.' : 'മുന്നറിയിപ്പ്: പേര് തിരിച്ചറിയാൻ കഴിഞ്ഞില്ല. ദയവായി പേര് വ്യക്തമായി പറയുക.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              {isEnglish 
                ? "Tap the microphone and speak your command" 
                : "മൈക്രോഫോണിൽ ടാപ്പ് ചെയ്ത് നിങ്ങളുടെ കമാൻഡ് പറയുക"
              }
            </p>
            <p className="text-xs text-muted-foreground">
              {isEnglish 
                ? "Try: 'Income 500 from sales' or 'Expense 200 for food' or 'Purchase 1000 from ABC' or 'John borrowed 500'"
                : "ശ്രമിക്കുക: 'വിൽപനയിൽ നിന്ന് 500 വരുമാനം' അല്ലെങ്കിൽ 'ഭക്ഷണത്തിന് 200 ചെലവ്' അല്ലെങ്കിൽ 'ABC യിൽ നിന്ന് 1000 വാങ്ങൽ'"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceAssistant;
