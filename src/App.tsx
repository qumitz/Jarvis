import { useState, useEffect } from 'react';
import { Settings, Mic, MicOff, AlertTriangle } from 'lucide-react';
import { JarvisCore } from './components/JarvisCore';
import { SettingsPanel } from './components/SettingsPanel';
import { CommandLog } from './components/CommandLog';
import { useSpeech } from './hooks/useSpeech';
import { useChatHistory } from './hooks/useChatHistory';
import { AppSettings } from './types';
import { motion } from 'motion/react';

const DEFAULT_SETTINGS: AppSettings = {
  wakeWord: 'джарвис',
  persona: 'jarvis',
  voiceEnabled: true,
  voiceURI: null,
};

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('jarvis_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { messages, addMessage, clearHistory } = useChatHistory();

  useEffect(() => {
    localStorage.setItem('jarvis_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleCommand = async (commandText: string) => {
    if (!commandText) return;
    
    addMessage('user', commandText);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: commandText,
          history: messages.slice(-10), // Send last 10 messages for context
          persona: settings.persona
        })
      });

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();
      addMessage('assistant', data.text);
      speak(data.text);
      
      // Simulate system actions based on response keywords (demo purposes)
      if (data.text.toLowerCase().includes('браузер') || commandText.toLowerCase().includes('браузер')) {
         setTimeout(() => window.open('https://google.com', '_blank'), 2000);
      }

    } catch (error) {
      console.error(error);
      const errorMsg = 'Сэр, произошла ошибка подключения к основной сети.';
      addMessage('assistant', errorMsg);
      speak(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const {
    isListening,
    isSpeaking,
    awaitingCommand,
    toggleListening,
    speak,
    supported
  } = useSpeech(
    settings,
    () => {
      // On wake word detected, you could play a small sound here
      console.log('Wake word detected!');
    },
    handleCommand
  );

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-between font-sans selection:bg-cyan-900">
      
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
           style={{ backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Header */}
      <header className="w-full flex justify-between items-center p-6 z-10">
        <div className="flex flex-col">
          <h1 className="text-2xl font-mono font-bold tracking-widest text-cyan-500 uppercase">
            J.A.R.V.I.S.
          </h1>
          <span className="text-xs font-mono text-zinc-500 tracking-widest">
            System Online // OS v3.1
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleListening}
            className={`p-3 rounded-full border transition-all ${
              isListening 
                ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-400' 
                : 'bg-zinc-900/50 border-zinc-700 text-zinc-500 hover:text-zinc-300'
            }`}
            title={isListening ? "Микрофон включен (Ожидание)" : "Включить микрофон"}
          >
            {isListening ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 rounded-full bg-zinc-900/50 border border-zinc-700 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {!supported && (
        <div className="absolute top-24 z-20 bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-2 rounded-md font-mono text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          Распознавание речи не поддерживается в этом браузере.
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center z-10 relative overflow-hidden">
        
        <CommandLog messages={messages} isProcessing={isProcessing} />

        <div className="mt-8 mb-12 relative">
           <JarvisCore 
             isListening={isListening} 
             isSpeaking={isSpeaking}
             awaitingCommand={awaitingCommand}
             onClick={toggleListening}
           />
           
           {/* Status Indicator */}
           <motion.div 
             className="absolute -bottom-10 left-1/2 -translate-x-1/2 font-mono text-xs tracking-widest text-cyan-600/70 uppercase whitespace-nowrap"
             animate={{ opacity: isListening ? 1 : 0.5 }}
           >
             {isSpeaking 
                ? 'ПЕРЕДАЧА ДАННЫХ...' 
                : awaitingCommand 
                  ? 'ОЖИДАНИЕ КОМАНДЫ...'
                  : isListening 
                    ? `РЕЖИМ ОЖИДАНИЯ: "${settings.wakeWord}"` 
                    : 'СИСТЕМА В ОФФЛАЙНЕ'}
           </motion.div>
        </div>
        
      </main>

      {/* Settings Overlay */}
      <SettingsPanel 
        settings={settings}
        updateSettings={updateSettings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearHistory={clearHistory}
      />
      
    </div>
  );
}
