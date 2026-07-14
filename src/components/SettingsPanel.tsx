import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Mic, MicOff, Settings2, Trash2 } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsPanelProps {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
}

export function SettingsPanel({ settings, updateSettings, isOpen, onClose, onClearHistory }: SettingsPanelProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      // Filter for Russian and English voices, prioritizing those that might sound male or British
      setVoices(availableVoices.filter(v => v.lang.startsWith('ru') || v.lang.startsWith('en')));
    };

    if (window.speechSynthesis) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="absolute right-0 top-0 bottom-0 w-80 bg-zinc-900/90 backdrop-blur-xl border-l border-cyan-900/50 p-6 shadow-2xl z-50 flex flex-col"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-mono text-cyan-400 font-bold tracking-widest uppercase flex items-center gap-2">
          <Settings2 size={20} />
          Настройки
        </h2>
        <button onClick={onClose} className="text-zinc-500 hover:text-cyan-400 transition-colors">
          &times;
        </button>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* Wake Word */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-cyan-600 uppercase tracking-wider block">Слово-активатор</label>
          <input
            type="text"
            value={settings.wakeWord}
            onChange={(e) => updateSettings({ wakeWord: e.target.value })}
            className="w-full bg-black/50 border border-cyan-900/30 rounded-md p-2 text-cyan-100 font-mono focus:border-cyan-500 focus:outline-none transition-colors"
          />
          <p className="text-xs text-zinc-500">Система будет слушать это слово.</p>
        </div>

        {/* Persona */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-cyan-600 uppercase tracking-wider block">Стиль общения</label>
          <select
            value={settings.persona}
            onChange={(e) => updateSettings({ persona: e.target.value as any })}
            className="w-full bg-black/50 border border-cyan-900/30 rounded-md p-2 text-cyan-100 font-mono focus:border-cyan-500 focus:outline-none transition-colors"
          >
            <option value="jarvis">Джарвис (Строгий ИИ)</option>
            <option value="sarcastic">Саркастичный</option>
            <option value="friendly">Дружелюбный</option>
          </select>
        </div>

        {/* Voice Output */}
        <div className="space-y-4 pt-4 border-t border-cyan-900/30">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.voiceEnabled}
                onChange={(e) => updateSettings({ voiceEnabled: e.target.checked })}
                className="sr-only"
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${settings.voiceEnabled ? 'bg-cyan-600' : 'bg-zinc-700'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.voiceEnabled ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <span className="text-sm font-mono text-cyan-200">Голосовой ответ</span>
          </label>

          {settings.voiceEnabled && voices.length > 0 && (
            <div className="space-y-2 mt-2">
              <label className="text-xs font-mono text-cyan-600 uppercase tracking-wider block">Голос системы</label>
              <select
                value={settings.voiceURI || ''}
                onChange={(e) => updateSettings({ voiceURI: e.target.value })}
                className="w-full bg-black/50 border border-cyan-900/30 rounded-md p-2 text-cyan-100 font-mono text-sm focus:border-cyan-500 focus:outline-none transition-colors"
              >
                <option value="">По умолчанию</option>
                {voices.map(voice => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Clear History */}
        <div className="pt-8">
          <button
            onClick={onClearHistory}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-900/20 text-red-400 rounded-md hover:bg-red-900/40 border border-red-900/30 transition-colors font-mono text-sm"
          >
            <Trash2 size={16} />
            Очистить память
          </button>
        </div>
      </div>
    </motion.div>
  );
}
