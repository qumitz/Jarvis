import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Message } from '../types';

interface CommandLogProps {
  messages: Message[];
  isProcessing: boolean;
}

export function CommandLog({ messages, isProcessing }: CommandLogProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto overflow-y-auto p-6 space-y-4 custom-scrollbar mask-image-fade">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 font-mono text-sm shadow-md
                ${msg.role === 'user' 
                  ? 'bg-cyan-900/20 text-cyan-100 border border-cyan-800/50' 
                  : 'bg-zinc-900/60 text-zinc-300 border border-zinc-800'}
              `}
            >
              <div className="text-[10px] opacity-50 mb-1 uppercase tracking-wider">
                {msg.role === 'user' ? 'USER' : 'SYSTEM'}
              </div>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isProcessing && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="flex justify-start"
           >
             <div className="px-4 py-3 font-mono text-sm text-cyan-400 flex items-center gap-2">
               <span className="animate-pulse">Обработка протокола...</span>
             </div>
           </motion.div>
        )}
      </AnimatePresence>
      <div ref={endRef} />
    </div>
  );
}
