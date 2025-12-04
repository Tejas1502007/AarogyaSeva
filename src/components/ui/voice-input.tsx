"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, className, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      setIsSupported(!!SpeechRecognition);
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onTranscript(transcript);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };
      }
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current || disabled) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  if (!isSupported) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleListening}
      disabled={disabled}
      className={cn(
        "p-2 h-8 w-8 relative",
        isListening ? "bg-[#009688] text-white border-[#009688]" : "border-[#26A69A] text-[#00796B] hover:bg-[#26A69A]/10",
        className
      )}
    >
      {isListening && (
        <div className="absolute inset-0 rounded-md bg-[#009688] animate-pulse" />
      )}
      <div className={cn("relative z-10", isListening && "animate-bounce")}>
        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </div>
    </Button>
  );
}

interface TextToSpeechProps {
  text: string;
  className?: string;
  disabled?: boolean;
}

export function TextToSpeech({ text, className, disabled }: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  const toggleSpeech = () => {
    if (!isSupported || disabled || !text) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isSupported) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleSpeech}
      disabled={disabled || !text}
      className={cn(
        "p-2 h-8 w-8 relative",
        isSpeaking ? "bg-[#009688] text-white border-[#009688]" : "border-[#26A69A] text-[#00796B] hover:bg-[#26A69A]/10",
        className
      )}
    >
      {isSpeaking && (
        <div className="absolute inset-0 rounded-md bg-[#009688] animate-pulse" />
      )}
      <div className={cn("relative z-10", isSpeaking && "animate-pulse")}>
        {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </div>
    </Button>
  );
}