import React from 'react';
import { 
  User, 
  Shield, 
  Brain, 
  BookOpen, 
  Dumbbell, 
  Activity, 
  Compass, 
  Users, 
  Zap, 
  Flame, 
  Coins, 
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';

export const CharacterView: React.FC = () => {
  const { user } = useAuth();
  const { inventory } = useGame();

  if (!user) return null;

  const attributeIcons: Record<string, any> = {
    Intelligence: Brain,
    Knowledge: BookOpen,
    Strength: Dumbbell,
    Stamina: Activity,
    Discipline: Compass,
    Social: Users
  };

  const equippedItems = inventory.filter(i => i.is_equipped);

  // Calculate total attribute sum for power rating
  const totalPower = Object.values(user.attributes || {}).reduce((acc, curr) => acc + curr, 0);

  const xpPercent = Math.min(100, Math.floor((user.xp / (user.xpRequiredNext || 100)) * 100));

  // Non-linear XP curve samples
  const xpCurveSamples = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lvl => ({
    level: lvl,
    xpRequired: Math.floor(100 * Math.pow(lvl, 1.5))
  }));

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white flex items-center space-x-3">
          <User className="w-8 h-8 text-cyber-cyan" />
          <span>CYBERNETIC CHARACTER HUB</span>
        </h1>
        <p className="text-gray-400 text-sm font-sans mt-1">
          Inspect your RPG stats, equipped cybernetics, attributes, and level progression matrix.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Character Status Card */}
        <div className="space-y-6">
          
          {/* Avatar Card */}
          <div className="cyber-card p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/10 rounded-full blur-2xl -z-10" />

            <div className="relative mx-auto w-32 h-32 mb-4 rounded-full bg-gradient-to-tr from-cyber-cyan via-cyber-purple to-cyber-pink p-1 shadow-glow-cyan">
              <div className="w-full h-full bg-[#090a0f] rounded-full flex items-center justify-center overflow-hidden">
                <User className="w-16 h-16 text-cyber-cyan" />
              </div>
              <div className="absolute bottom-0 right-0 bg-cyber-purple px-2 py-0.5 rounded-full text-white font-orbitron font-bold text-xs border border-white/20">
                L{user.level}
              </div>
            </div>

            <h2 className="font-orbitron font-extrabold text-2xl text-white">
              {user.username.toUpperCase()}
            </h2>
            <p className="text-xs font-orbitron text-cyber-cyan mt-1">{user.title}</p>

            <div className="mt-4 pt-4 border-t border-[#24293e] grid grid-cols-3 gap-2 text-center font-orbitron">
              <div className="bg-[#161926] p-2 rounded-lg border border-[#24293e]">
                <span className="block text-[10px] text-cyber-dim">POWER</span>
                <span className="font-bold text-cyber-cyan text-sm">{totalPower}</span>
              </div>
              <div className="bg-[#161926] p-2 rounded-lg border border-[#24293e]">
                <span className="block text-[10px] text-cyber-dim">STREAK</span>
                <span className="font-bold text-orange-400 text-sm">🔥 {user.currentStreak}d</span>
              </div>
              <div className="bg-[#161926] p-2 rounded-lg border border-[#24293e]">
                <span className="block text-[10px] text-cyber-dim">GOLD</span>
                <span className="font-bold text-cyber-yellow text-sm">🪙 {user.gold}</span>
              </div>
            </div>
          </div>

          {/* Level Progress Bar Card */}
          <div className="cyber-card p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-orbitron">
              <span className="text-white font-bold">LEVEL {user.level} PROGRESS</span>
              <span className="text-cyber-cyan">{xpPercent}%</span>
            </div>
            <div className="w-full bg-[#161926] h-3 rounded-full overflow-hidden border border-[#24293e]">
              <div 
                className="bg-gradient-to-r from-cyber-cyan to-cyber-purple h-full rounded-full transition-all duration-500 shadow-glow-cyan"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-orbitron text-cyber-dim">
              <span>{user.xp} XP</span>
              <span>{user.xpRequiredNext} XP NEXT</span>
            </div>
          </div>

          {/* Equipped Gear Showcase */}
          <div className="cyber-card p-5 space-y-4">
            <h3 className="font-orbitron font-bold text-base text-white flex items-center space-x-2">
              <Shield className="w-4 h-4 text-cyber-cyan" />
              <span>EQUIPPED CYBERNETICS</span>
            </h3>

            {equippedItems.length === 0 ? (
              <p className="text-xs text-cyber-dim italic">
                No items equipped yet. Visit the Cyberpunk Shop to acquire weapons, armor, frames, and badges!
              </p>
            ) : (
              <div className="space-y-2">
                {equippedItems.map((item) => (
                  <div key={item.item_id} className="bg-[#161926] p-3 rounded-xl border border-cyber-cyan/30 flex items-center justify-between">
                    <div>
                      <p className="font-orbitron font-bold text-xs text-white">{item.name}</p>
                      <p className="text-[10px] text-cyber-cyan font-orbitron">{item.stat_bonus}</p>
                    </div>
                    <span className="text-[9px] font-orbitron px-2 py-0.5 rounded bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30">
                      {item.rarity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (2 Cols): Attributes Breakdown & Non-Linear XP Matrix */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Attributes Breakdown Card */}
          <div className="cyber-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-cyber-cyan" />
                <h2 className="font-orbitron font-bold text-xl text-white">CHARACTER ATTRIBUTES</h2>
              </div>
              <span className="text-xs font-orbitron text-cyber-dim">6 CORE STATS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(user.attributes || {
                Intelligence: 10,
                Knowledge: 10,
                Strength: 10,
                Stamina: 10,
                Discipline: 10,
                Social: 10
              }).map(([name, val]) => {
                const Icon = attributeIcons[name] || Brain;
                const maxVal = 100;
                const percent = Math.min(100, Math.floor((val / maxVal) * 100));

                return (
                  <div key={name} className="bg-[#161926] p-4 rounded-xl border border-[#24293e] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-lg bg-[#090a0f] text-cyber-cyan border border-[#24293e]">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-orbitron font-bold text-sm text-white">{name}</span>
                      </div>
                      <span className="font-orbitron font-bold text-base text-cyber-cyan">{val}</span>
                    </div>

                    <div className="w-full bg-[#090a0f] h-2 rounded-full overflow-hidden border border-[#24293e]">
                      <div 
                        className="bg-gradient-to-r from-cyber-cyan to-cyber-purple h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Non-Linear Progression Curve Matrix Card */}
          <div className="cyber-card p-6 space-y-4">
            <h2 className="font-orbitron font-bold text-xl text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-cyber-yellow" />
              <span>NON-LINEAR LEVEL PROGRESSION MATRIX</span>
            </h2>
            
            <p className="text-xs text-gray-400 font-sans">
              LIFE RPG enforces a non-linear XP leveling formula: <code className="text-cyber-cyan font-mono font-bold bg-[#161926] px-2 py-0.5 rounded">XP_REQUIRED(level) = ⌊100 × level^1.5⌋</code>. Higher levels require progressively more effort to achieve.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              {xpCurveSamples.map((sample) => (
                <div 
                  key={sample.level} 
                  className={`p-3 rounded-xl border text-center font-orbitron ${
                    sample.level === user.level 
                      ? 'bg-cyber-cyan/15 border-cyber-cyan text-cyber-cyan shadow-glow-cyan' 
                      : 'bg-[#161926] border-[#24293e] text-gray-300'
                  }`}
                >
                  <span className="block text-[10px] text-cyber-dim">LEVEL {sample.level}</span>
                  <span className="font-bold text-sm">{sample.xpRequired} XP</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
