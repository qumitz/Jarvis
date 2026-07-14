import { motion } from 'motion/react';

interface JarvisCoreProps {
  isListening: boolean;
  isSpeaking: boolean;
  awaitingCommand: boolean;
  onClick: () => void;
}

export function JarvisCore({ isListening, isSpeaking, awaitingCommand, onClick }: JarvisCoreProps) {
  
  // Determine state for animations
  const isActive = isSpeaking || awaitingCommand;
  
  return (
    <div className="relative flex items-center justify-center" onClick={onClick}>
      {/* Outer Glow */}
      <motion.div
        animate={{
          scale: isActive ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: isActive ? [0.4, 0.8, 0.4] : [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: isActive ? 1.5 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none"
      />

      {/* Outer Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-48 h-48 rounded-full border border-cyan-500/30 border-dashed pointer-events-none"
      />
      
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute w-40 h-40 rounded-full border-t border-b border-cyan-400/50 pointer-events-none"
      />

      {/* Core Orb */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: isSpeaking 
            ? ["0 0 20px #06b6d4", "0 0 60px #06b6d4", "0 0 20px #06b6d4"] 
            : awaitingCommand 
              ? ["0 0 10px #3b82f6", "0 0 40px #3b82f6", "0 0 10px #3b82f6"]
              : isListening 
                ? "0 0 15px rgba(6, 182, 212, 0.3)" 
                : "0 0 0px rgba(6, 182, 212, 0)",
        }}
        transition={{ duration: isSpeaking ? 0.5 : 1.5, repeat: Infinity }}
        className={`w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-500 z-10
          ${isListening ? 'bg-cyan-900' : 'bg-zinc-800'} 
          shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] border-2 ${isListening ? 'border-cyan-400' : 'border-zinc-700'}
        `}
      >
        <div className="relative w-16 h-16 rounded-full bg-black flex items-center justify-center overflow-hidden">
           {/* Inner dynamic lines */}
           {isActive && (
             <div className="absolute inset-0 flex items-center justify-center gap-1">
                {[1,2,3,4,5].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: isSpeaking ? ["20%", "80%", "20%"] : ["40%", "60%", "40%"] }}
                    transition={{
                      duration: isSpeaking ? 0.4 : 1,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut"
                    }}
                    className="w-1 bg-cyan-400 rounded-full"
                  />
                ))}
             </div>
           )}
           {!isActive && (
             <div className="w-8 h-8 rounded-full bg-cyan-900/50 blur-sm" />
           )}
        </div>
      </motion.div>
    </div>
  );
}
