import React from 'react';
import { Award, Zap, Flame, ShieldAlert, Code, BookOpen, Dumbbell, ShoppingBag, Lock, CheckCircle2, Trophy } from 'lucide-react';
import { useGame } from '../../context/GameContext';

export const AchievementsView: React.FC = () => {
  const { achievements } = useGame();

  const iconMap: Record<string, any> = {
    zap: Zap,
    flame: Flame,
    'shield-alert': ShieldAlert,
    crown: Trophy,
    code: Code,
    'book-open': BookOpen,
    dumbbell: Dumbbell,
    'shopping-bag': ShoppingBag
  };

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const percent = achievements.length > 0 ? Math.min(100, Math.floor((unlockedCount / achievements.length) * 100)) : 0;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white flex items-center space-x-3">
            <Award className="w-8 h-8 text-cyber-pink" />
            <span>ACHIEVEMENTS & BADGES</span>
          </h1>
          <p className="text-gray-400 text-sm font-sans mt-1">
            Unlock achievements by completing real-world quests, keeping streaks, leveling up, and acquiring items.
          </p>
        </div>

        {/* Unlocked Counter Card */}
        <div className="bg-[#10121b] border border-cyber-pink/40 px-4 py-2 rounded-xl space-y-1 w-full sm:w-56 shadow-glow-pink">
          <div className="flex items-center justify-between text-xs font-orbitron">
            <span className="text-cyber-dim">UNLOCKED</span>
            <span className="text-cyber-pink font-bold">{unlockedCount}/{achievements.length}</span>
          </div>
          <div className="w-full bg-[#161926] h-2 rounded-full overflow-hidden border border-[#24293e]">
            <div 
              className="bg-gradient-to-r from-cyber-pink to-cyber-purple h-full rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((ach) => {
          const Icon = iconMap[ach.icon] || Award;
          const isUnlocked = ach.isUnlocked;

          return (
            <div 
              key={ach.id} 
              className={`cyber-card p-5 border flex items-start space-x-4 transition-all ${
                isUnlocked 
                  ? 'border-cyber-pink/50 bg-[#10121b]/90 shadow-glow-pink' 
                  : 'border-[#24293e] opacity-60 bg-[#10121b]/40'
              }`}
            >
              <div className={`p-3.5 rounded-xl border shrink-0 ${
                isUnlocked 
                  ? 'bg-cyber-pink/15 text-cyber-pink border-cyber-pink/40 shadow-glow-pink' 
                  : 'bg-[#161926] text-gray-500 border-[#24293e]'
              }`}>
                {isUnlocked ? <Icon className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-orbitron font-bold text-base ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                    {ach.title}
                  </h3>
                  {isUnlocked && (
                    <CheckCircle2 className="w-4 h-4 text-cyber-pink shrink-0" />
                  )}
                </div>

                <p className="text-xs text-gray-400 font-sans">{ach.description}</p>

                {isUnlocked && ach.unlockedAt && (
                  <p className="text-[10px] font-orbitron text-cyber-dim pt-2">
                    UNLOCKED: {new Date(ach.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
