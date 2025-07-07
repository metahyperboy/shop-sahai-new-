
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Mic, MicOff, Volume2 } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { VoiceCommandService } from "@/services/voiceCommandService";

interface VoiceAssistantProps {
  onClose: () => void;
  language: string;
}

const VoiceAssistant = ({ onClose, language }: VoiceAssistantProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState("");

  const isEnglish = language === "english";
  const { speak } = useTextToSpeech({ language });

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    const result = await VoiceCommandService.processCommand(command, language);
    setResponse(result.message);
    setIsProcessing(false);
    speak(result.message);
  };

  const handleSpeechError = (error: string) => {
    setResponse(error);
    speak(error);
  };

  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition({
    language,
    onResult: processVoiceCommand,
    onError: handleSpeechError
  });

  const handleVoiceClick = () => {
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
        <CardContent className="space-y-4">
          {/* Voice Button */}
          <div className="flex justify-center">
            <Button
              className={`rounded-full w-20 h-20 ${
                isListening ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
              }`}
              onClick={handleVoiceClick}
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
