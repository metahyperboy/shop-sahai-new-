
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Mic, MicOff, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language === "malayalam" ? "ml-IN" : "en-US";

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
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

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
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
  }, [language, isEnglish]);

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
    
    const lowerCommand = command.toLowerCase();
    let responseText = "";
    
    try {
      // Extract amount from command
      const amountMatch = lowerCommand.match(/(\d+)/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : null;
      
      // Income commands
      if (lowerCommand.includes("income") || lowerCommand.includes("വരുമാനം")) {
        if (amount) {
          const category = lowerCommand.includes("sales") || lowerCommand.includes("വിൽപന") ? (isEnglish ? "Sales" : "വിൽപന") :
                          lowerCommand.includes("service") || lowerCommand.includes("സേവനം") ? (isEnglish ? "Service" : "സേവനം") :
                          lowerCommand.includes("investment") || lowerCommand.includes("നിക്ഷേപം") ? (isEnglish ? "Investment" : "നിക്ഷേപം") :
                          (isEnglish ? "Other" : "മറ്റുള്ളവ");
          
          const { data, error } = await supabase
            .from('transactions')
            .insert({
              type: 'income',
              amount: amount,
              category: category,
              description: `Added via voice: ${command}`,
              user_id: (await supabase.auth.getUser()).data.user?.id || ''
            });

          if (error) throw error;
          
          responseText = isEnglish 
            ? `Successfully added income of ₹${amount} in ${category} category.`
            : `₹${amount} വരുമാനം ${category} വിഭാഗത്തിൽ വിജയകരമായി ചേർത്തു.`;
        } else {
          responseText = isEnglish 
            ? "Please specify the amount. Try: 'Add income 500 rupees'"
            : "തുക വ്യക്തമാക്കുക. ശ്രമിക്കുക: '500 രൂപ വരുമാനം ചേർക്കുക'";
        }
      }
      // Expense commands
      else if (lowerCommand.includes("expense") || lowerCommand.includes("ചെലവ്")) {
        if (amount) {
          const category = lowerCommand.includes("travel") || lowerCommand.includes("യാത്ര") ? (isEnglish ? "Travel" : "യാത്ര") :
                          lowerCommand.includes("food") || lowerCommand.includes("ഭക്ഷണം") ? (isEnglish ? "Food" : "ഭക്ഷണം") :
                          lowerCommand.includes("utilities") || lowerCommand.includes("യൂട്ടിലിറ്റി") ? (isEnglish ? "Utilities" : "യൂട്ടിലിറ്റി") :
                          lowerCommand.includes("supplies") || lowerCommand.includes("സാധനങ്ങൾ") ? (isEnglish ? "Supplies" : "സാധനങ്ങൾ") :
                          (isEnglish ? "Other" : "മറ്റുള്ളവ");
          
          const { data, error } = await supabase
            .from('transactions')
            .insert({
              type: 'expense',
              amount: amount,
              category: category,
              description: `Added via voice: ${command}`,
              user_id: (await supabase.auth.getUser()).data.user?.id || ''
            });

          if (error) throw error;
          
          responseText = isEnglish 
            ? `Successfully added expense of ₹${amount} in ${category} category.`
            : `₹${amount} ചെലവ് ${category} വിഭാഗത്തിൽ വിജയകരമായി ചേർത്തു.`;
        } else {
          responseText = isEnglish 
            ? "Please specify the amount. Try: 'Add expense 200 for travel'"
            : "തുക വ്യക്തമാക്കുക. ശ്രമിക്കുക: 'യാത്രയ്ക്ക് 200 ചെലവ് ചേർക്കുക'";
        }
      }
      // Purchase commands
      else if (lowerCommand.includes("purchase") || lowerCommand.includes("വാങ്ങൽ")) {
        if (amount) {
          // Extract supplier name (simple approach - look for "from" keyword)
          const fromMatch = lowerCommand.match(/from\s+(\w+)/i) || lowerCommand.match(/(\w+)\s+from/i);
          const supplierName = fromMatch ? fromMatch[1] : (isEnglish ? "Unknown Supplier" : "അജ്ഞാത വിതരണക്കാരൻ");
          
          const { data, error } = await supabase
            .from('purchases')
            .insert({
              supplier_name: supplierName,
              total_amount: amount,
              amount_paid: 0,
              balance: amount,
              user_id: (await supabase.auth.getUser()).data.user?.id || ''
            });

          if (error) throw error;
          
          responseText = isEnglish 
            ? `Successfully recorded purchase of ₹${amount} from ${supplierName}.`
            : `${supplierName} ൽ നിന്ന് ₹${amount} വാങ്ങൽ വിജയകരമായി രേഖപ്പെടുത്തി.`;
        } else {
          responseText = isEnglish 
            ? "Please specify the amount. Try: 'Purchase 1000 from supplier ABC'"
            : "തുക വ്യക്തമാക്കുക. ശ്രമിക്കുക: 'ABC വിതരണക്കാരനിൽ നിന്ന് 1000 വാങ്ങൽ'";
        }
      }
      // Borrow commands
      else if (lowerCommand.includes("borrow") || lowerCommand.includes("കടം")) {
        if (amount) {
          // Extract person name (simple approach - look for common patterns)
          const nameMatch = lowerCommand.match(/(?:to|from|give|gave)\s+(\w+)/i) || lowerCommand.match(/(\w+)\s+(?:borrowed|gave|give)/i);
          const borrowerName = nameMatch ? nameMatch[1] : (isEnglish ? "Unknown Person" : "അജ്ഞാത വ്യക്തി");
          
          const { data, error } = await supabase
            .from('borrows')
            .insert({
              borrower_name: borrowerName,
              total_given: amount,
              amount_paid: 0,
              balance: amount,
              user_id: (await supabase.auth.getUser()).data.user?.id || ''
            });

          if (error) throw error;
          
          responseText = isEnglish 
            ? `Successfully recorded ₹${amount} borrowed by ${borrowerName}.`
            : `${borrowerName} കടം വാങ്ങിയ ₹${amount} വിജയകരമായി രേഖപ്പെടുത്തി.`;
        } else {
          responseText = isEnglish 
            ? "Please specify the amount. Try: 'John borrowed 500 rupees'"
            : "തുക വ്യക്തമാക്കുക. ശ്രമിക്കുക: 'ജോൺ 500 രൂപ കടം വാങ്ങി'";
        }
      }
      else {
        responseText = isEnglish 
          ? "I can help you add income, expenses, purchases, and borrowing. Try commands like 'Add income 500' or 'Expense 200 for food'."
          : "വരുമാനം, ചെലവുകൾ, വാങ്ങലുകൾ, കടം എന്നിവ ചേർക്കാൻ ഞാൻ സഹായിക്കാം. '500 വരുമാനം ചേർക്കുക' അല്ലെങ്കിൽ 'ഭക്ഷണത്തിന് 200 ചെലവ്' പോലെ പറയുക.";
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      responseText = isEnglish 
        ? "Sorry, there was an error processing your request. Please try again."
        : "ക്ഷമിക്കണം, നിങ്ങളുടെ അഭ്യർത്ഥന പ്രോസസ്സ് ചെയ്യുന്നതിൽ പിശക്. ദയവായി വീണ്ടും ശ്രമിക്കുക.";
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
