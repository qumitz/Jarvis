import { useState, useEffect, useRef, useCallback } from 'react';
import { Message, AppSettings } from '../types';

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeech(
  settings: AppSettings,
  onWakeWordDetected: () => void,
  onCommandRecognized: (text: string) => void
) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  
  // State to track if we are actively listening for a command after wake word
  const [awaitingCommand, setAwaitingCommand] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true; // Keep listening
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'ru-RU'; // Assume Russian based on prompt

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript.trim().toLowerCase();
          
          console.log('Recognized:', transcript);

          // Remove punctuation for wake word matching
          const cleanTranscript = transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
          
          const wakeWordLower = settings.wakeWord.toLowerCase();

          if (cleanTranscript.includes(wakeWordLower)) {
            // Wake word detected
            onWakeWordDetected();
            setAwaitingCommand(true);
            
            // Extract command if it follows the wake word immediately
            const wakeWordIndex = cleanTranscript.indexOf(wakeWordLower);
            const commandAfterWakeWord = transcript.slice(wakeWordIndex + wakeWordLower.length).trim();
            
            if (commandAfterWakeWord.length > 3) {
              onCommandRecognized(commandAfterWakeWord);
              setAwaitingCommand(false);
            }
          } else if (awaitingCommand) {
            // Treat the next phrase as the command
            onCommandRecognized(transcript);
            setAwaitingCommand(false);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          if (event.error !== 'aborted') {
            console.error('Speech recognition error', event.error);
          }
          if (event.error === 'not-allowed') {
            setIsListening(false);
          }
        };

        recognitionRef.current.onend = () => {
          // Auto-restart if we are supposed to be listening
          if (isListening && !isSpeaking) {
             try {
               recognitionRef.current.start();
             } catch(e) {}
          }
        };

      } else {
        setSupported(false);
      }

      synthesisRef.current = window.speechSynthesis;
    }
  }, [settings.wakeWord, awaitingCommand, isListening, isSpeaking, onWakeWordDetected, onCommandRecognized]);

  const toggleListening = useCallback(() => {
    if (!supported) return;
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setAwaitingCommand(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch(e) {
        console.error("Could not start recognition", e);
      }
    }
  }, [isListening, supported]);

  const speak = useCallback((text: string) => {
    if (!settings.voiceEnabled || !synthesisRef.current) return;

    // Pause recognition while speaking to avoid feedback loop
    setIsSpeaking(true);
    if (isListening) {
       recognitionRef.current?.stop();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    
    if (settings.voiceURI) {
      const voices = synthesisRef.current.getVoices();
      const selectedVoice = voices.find(v => v.voiceURI === settings.voiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      if (isListening) {
        try {
          recognitionRef.current?.start();
        } catch(e) {}
      }
    };

    synthesisRef.current.speak(utterance);
  }, [settings.voiceEnabled, settings.voiceURI, isListening]);

  return {
    isListening,
    isSpeaking,
    awaitingCommand,
    toggleListening,
    speak,
    supported
  };
}
