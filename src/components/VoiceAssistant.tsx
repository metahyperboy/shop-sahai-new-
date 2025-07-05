
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Mic, MicOff, Volume2 } from "lucide-react";

interface VoiceAssistantProps {
  onClose: () => void;
  language: string;
}

const VoiceAssistant = ({ onClose, language }: VoiceAssistantProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isEnglish = language === "english";

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language === "malayalam" ? "ml-IN" : "en-US";

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setTranscript(transcript);
          
          if (event.results[current].isFinal) {
            processVoiceCommand(transcript);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setResponse(isEnglish 
            ? "Sorry, I couldn't understand. Please try again." 
            : "ക്ഷമിക്കണം, എനിക്ക് മനസ്സിലായില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക."
          );
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript("");
      setResponse("");
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      setResponse(isEnglish 
        ? "Voice recognition is not supported in your browser." 
        : "നിങ്ങളുടെ ബ്രൗസറിൽ വോയ്സ് റെക്കഗ്നിഷൻ പിന്തുണയില്ല."
      );
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    
    // Simple command processing - in a real app, this would connect to your backend
    const lowerCommand = command.toLowerCase();
    
    let responseText = "";
    
    // Income commands
    if (lowerCommand.includes("income") || lowerCommand.includes("വരുമാനം")) {
      responseText = isEnglish 
        ? "I'll help you add income. Please specify the amount and category."
        : "വരുമാനം ചേർക്കാൻ ഞാൻ സഹായിക്കാം. തുകയും വിഭാഗവും വ്യക്തമാക്കുക.";
    }
    // Expense commands
    else if (lowerCommand.includes("expense") || lowerCommand.includes("ചെലവ്")) {
      responseText = isEnglish 
        ? "I'll help you add an expense. Please specify the amount and purpose."
        : "ചെലവ് ചേർക്കാൻ ഞാൻ സഹായിക്കാം. തുകയും ഉദ്ദേശ്യവും വ്യക്തമാക്കുക.";
    }
    // Purchase commands
    else if (lowerCommand.includes("purchase") || lowerCommand.includes("വാങ്ങൽ")) {
      responseText = isEnglish 
        ? "I'll help you record a purchase. Please provide supplier name, product, and amounts."
        : "വാങ്ങൽ രേഖപ്പെടുത്താൻ ഞാൻ സഹായിക്കാം. വിതരണക്കാരൻ, ഉൽപ്പാദനം, തുകകൾ എന്നിവ നൽകുക.";
    }
    // Borrow commands
    else if (lowerCommand.includes("borrow") || lowerCommand.includes("കടം")) {
      responseText = isEnglish 
        ? "I'll help you record borrowing details. Please specify the person's name and amount."
        : "കടം വിവരങ്ങൾ രേഖപ്പെടുത്താൻ ഞാൻ സഹായിക്കാം. വ്യക്തിയുടെ പേരും തുകയും വ്യക്തമാക്കുക.";
    }
    else {
      responseText = isEnglish 
        ? "I can help you with income, expenses, purchases, and borrowing. What would you like to do?"
        : "വരുമാനം, ചെലവുകൾ, വാങ്ങലുകൾ, കടം എന്നിവയിൽ ഞാൻ സഹായിക്കാം. നിങ്ങൾ എന്താണ് ചെയ്യാൻ ആഗ്രഹിക്കുന്നത്?";
    }
    
    setResponse(responseText);
    setIsProcessing(false);
    
    // Text-to-speech response
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(responseText);
      utterance.lang = language === "malayalam" ? "ml-IN" : "en-US";
      speechSynthesis.speak(utterance);
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
        <CardContent className="space-y-4">
          {/* Voice Button */}
          <div className="flex justify-center">
            <Button
              className={`rounded-full w-20 h-20 ${
                isListening ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
              }`}
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
            >
              {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>
          </div>

          {/* Status */}
          <div className="text-center">
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
          {response && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <div className="flex items-start space-x-2">
                <Volume2 className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary">
                    {isEnglish ? "Assistant:" : "സഹായി:"}
                  </p>
                  <p className="text-sm">{response}</p>
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
                ? "Try: 'Add income 500 rupees' or 'New expense 200 for travel'" 
                : "ശ്രമിക്കുക: '500 രൂപ വരുമാനം ചേർക്കുക' അല്ലെങ്കിൽ 'യാത്രയ്ക്ക് 200 ചെലവ്'"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceAssistant;
