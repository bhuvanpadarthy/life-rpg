import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Zap, Trophy, ChevronRight, Sparkles } from 'lucide-react';
import { useGame } from '../../context/GameContext';

export const LevelUpModal: React.FC = () => {
  const { levelUpState, closeLevelUpModal } = useGame();

  if (!levelUpState.isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          className="relative max-w-md w-full bg-[#10121b] border-2 border-cyber-cyan rounded-2xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(0,243,255,0.4)] overflow-hidden"
        >
          {/* Cyber light beam background effect */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyber-cyan/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyber-pink/20 rounded-full blur-3xl" />

          {/* Badge Icon */}
          <div className="relative mx-auto w-20 h-20 mb-4 rounded-2xl bg-gradient-to-tr from-cyber-cyan to-cyber-purple p-1 shadow-glow-cyan">
            <div className="w-full h-full bg-[#090a0f] rounded-xl flex items-center justify-center">
              <Trophy className="w-10 h-10 text-cyber-cyan animate-bounce" />
            </div>
            <div className="absolute -top-2 -right-2 bg-cyber-pink p-1 rounded-full text-white shadow-glow-pink">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <h2 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-white to-cyber-pink tracking-wider">
            LEVEL UP!
          </h2>
          
          <p className="text-cyber-dim text-xs font-rajdhani tracking-widest uppercase mt-1">
            NEURAL ASCENSION DETECTED
          </p>

          <div className="my-6 bg-[#161926] p-4 rounded-xl border border-[#24293e] flex items-center justify-around">
            <div className="text-center">
              <span className="block text-[10px] font-orbitron text-cyber-dim uppercase">Previous</span>
              <span className="font-orbitron font-extrabold text-2xl text-gray-400">L{levelUpState.previousLevel}</span>
            </div>

            <ChevronRight className="w-6 h-6 text-cyber-cyan animate-pulse" />

            <div className="text-center">
              <span className="block text-[10px] font-orbitron text-cyber-cyan uppercase">New Rank</span>
              <span className="font-orbitron font-extrabold text-3xl text-cyber-cyan shadow-glow-cyan">L{levelUpState.newLevel}</span>
            </div>
          </div>

          <p className="text-sm text-gray-300 mb-6">
            Congratulations! You have grown stronger in real life. Your attributes and status have expanded.
          </p>

          <button
            onClick={closeLevelUpModal}
            className="w-full cyber-button-primary py-3 text-base flex items-center justify-center space-x-2"
          >
            <span>CLAIM REWARDS</span>
            <Zap className="w-5 h-5 fill-current" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
