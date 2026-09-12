import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap, Coins, Award, Trophy, Info, AlertTriangle } from 'lucide-react';
import { useGame } from '../../context/GameContext';

export const ToastNotifications: React.FC = () => {
  const { notifications } = useGame();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full px-4">
      <AnimatePresence>
        {notifications.map((notif) => {
          let icon = <Zap className="w-5 h-5 text-cyber-cyan" />;
          let borderStyle = 'border-cyber-cyan/50 shadow-glow-cyan';

          if (notif.type === 'gold') {
            icon = <Coins className="w-5 h-5 text-cyber-yellow" />;
            borderStyle = 'border-cyber-yellow/50 shadow-glow-gold';
          } else if (notif.type === 'achievement') {
            icon = <Trophy className="w-5 h-5 text-cyber-pink" />;
            borderStyle = 'border-cyber-pink/50 shadow-glow-pink';
          } else if (notif.type === 'error') {
            icon = <AlertTriangle className="w-5 h-5 text-cyber-red" />;
            borderStyle = 'border-cyber-red/50 shadow-[0_0_15px_rgba(255,51,102,0.4)]';
          }

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto bg-[#10121b]/95 backdrop-blur-md border ${borderStyle} rounded-xl p-3.5 flex items-start space-x-3 text-white`}
            >
              <div className="p-2 rounded-lg bg-[#161926] shrink-0">{icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-orbitron font-bold text-xs uppercase tracking-wider text-white">
                  {notif.title}
                </p>
                <p className="text-xs text-gray-300 mt-0.5 font-sans">
                  {notif.message}
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
