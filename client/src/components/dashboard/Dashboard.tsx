import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Sword, 
  Flame, 
  Coins, 
  Award, 
  Plus, 
  CheckCircle2, 
  Brain, 
  BookOpen, 
  Dumbbell, 
  Activity, 
  Compass, 
  Users,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { quests, completeQuest, achievements } = useGame();
  const [completingId, setCompletingId] = useState<string | null>(null);

  if (!user) return null;

  const activeQuests = quests.filter(q => q.status === 'ACTIVE');
  const todaysQuests = activeQuests.slice(0, 4);

  const xpPercent = Math.min(100, Math.floor((user.xp / (user.xpRequiredNext || 100)) * 100));

  const handleComplete = async (id: string) => {
    setCompletingId(id);
    try {
      await completeQuest(id);
    } finally {
      setCompletingId(null);
    }
  };

  const attributeIcons: Record<string, any> = {
    Intelligence: Brain,
    Knowledge: BookOpen,
    Strength: Dumbbell,
    Stamina: Activity,
    Discipline: Compass,
    Social: Users
  };

  const attributeColors: Record<string, string> = {
    Intelligence: 'text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/10',
    Knowledge: 'text-cyber-purple border-cyber-purple/30 bg-cyber-purple/10',
    Strength: 'text-cyber-red border-cyber-red/30 bg-cyber-red/10',
    Stamina: 'text-cyber-green border-cyber-green/30 bg-cyber-green/10',
    Discipline: 'text-cyber-yellow border-cyber-yellow/30 bg-cyber-yellow/10',
    Social: 'text-cyber-pink border-cyber-pink/30 bg-cyber-pink/10'
  };

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Welcome Banner */}
      <div className="relative cyber-card p-6 sm:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyber-cyan/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyber-purple/10 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-xs font-orbitron">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ACTIVE CYBER SESSION</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-orbitron font-extrabold text-white">
              WELCOME BACK, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan to-cyber-pink">{user.username.toUpperCase()}</span>
            </h1>
            <p className="text-gray-400 text-sm font-sans">
              Current Rank: <span className="text-white font-semibold">{user.title}</span>. Complete your daily quests to gain XP, unlock attributes, and ascend levels.
            </p>
          </div>

          {/* Level Progress Widget */}
          <div className="w-full md:w-72 bg-[#161926] p-4 rounded-xl border border-[#24293e] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-cyber-purple/30 border border-cyber-purple flex items-center justify-center font-orbitron font-bold text-cyber-purple">
                  L{user.level}
                </div>
                <span className="font-orbitron font-bold text-xs text-white">LEVEL {user.level}</span>
              </div>
              <span className="text-xs font-orbitron text-cyber-cyan">{xpPercent}%</span>
            </div>
            <div className="w-full bg-[#090a0f] h-2 rounded-full overflow-hidden border border-[#24293e]">
              <div 
                className="bg-gradient-to-r from-cyber-cyan to-cyber-purple h-full rounded-full transition-all duration-500 shadow-glow-cyan"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-rajdhani text-cyber-dim font-semibold">
              <span>{user.xp} XP CURRENT</span>
              <span>{user.xpRequiredNext} XP NEXT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Streak */}
        <div className="cyber-card p-4 flex items-center space-x-4 border-orange-500/30 hover:border-orange-500/60">
          <div className="p-3 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-orbitron text-cyber-dim uppercase">Current Streak</p>
            <p className="text-2xl font-orbitron font-bold text-white">{user.currentStreak} Days</p>
            <p className="text-[10px] text-gray-400 font-sans">Best: {user.bestStreak} days</p>
          </div>
        </div>

        {/* Gold */}
        <div className="cyber-card p-4 flex items-center space-x-4 border-cyber-yellow/30 hover:border-cyber-yellow/60">
          <div className="p-3 rounded-xl bg-cyber-yellow/15 border border-cyber-yellow/30 text-cyber-yellow">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-orbitron text-cyber-dim uppercase">Gold Balance</p>
            <p className="text-2xl font-orbitron font-bold text-cyber-yellow">🪙 {user.gold}</p>
            <p className="text-[10px] text-gray-400 font-sans">Cyber Currency</p>
          </div>
        </div>

        {/* Quests Active */}
        <div className="cyber-card p-4 flex items-center space-x-4 border-cyber-cyan/30 hover:border-cyber-cyan/60">
          <div className="p-3 rounded-xl bg-cyber-cyan/15 border border-cyber-cyan/30 text-cyber-cyan">
            <Sword className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-orbitron text-cyber-dim uppercase">Active Quests</p>
            <p className="text-2xl font-orbitron font-bold text-white">{activeQuests.length}</p>
            <p className="text-[10px] text-gray-400 font-sans">Available to complete</p>
          </div>
        </div>

        {/* Achievements */}
        <div className="cyber-card p-4 flex items-center space-x-4 border-cyber-pink/30 hover:border-cyber-pink/60">
          <div className="p-3 rounded-xl bg-cyber-pink/15 border border-cyber-pink/30 text-cyber-pink">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-orbitron text-cyber-dim uppercase">Achievements</p>
            <p className="text-2xl font-orbitron font-bold text-white">{unlockedCount}/{achievements.length}</p>
            <p className="text-[10px] text-gray-400 font-sans">Unlocked Badges</p>
          </div>
        </div>

      </div>

      {/* Main Content Split: Quests & Character Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Today's Active Quests (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sword className="w-5 h-5 text-cyber-cyan" />
              <h2 className="font-orbitron font-bold text-xl text-white">TODAY'S QUESTS</h2>
            </div>
            <Link 
              to="/quests" 
              className="text-xs font-orbitron text-cyber-cyan hover:underline flex items-center space-x-1"
            >
              <span>VIEW ALL ({quests.length})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {todaysQuests.length === 0 ? (
            <div className="cyber-card p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#161926] border border-[#24293e] flex items-center justify-center mx-auto text-cyber-dim">
                <CheckCircle2 className="w-6 h-6 text-cyber-green" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-lg text-white">NO ACTIVE QUESTS</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto mt-1">
                  You have completed all active tasks! Create a new quest to continue your progression.
                </p>
              </div>
              <Link to="/quests" className="cyber-button-primary inline-flex">
                <Plus className="w-4 h-4 mr-2" />
                <span>CREATE QUEST</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysQuests.map((quest) => {
                const IconComponent = attributeIcons[quest.attribute_type] || Brain;
                const isCompleting = completingId === quest.id;

                return (
                  <div 
                    key={quest.id} 
                    className="cyber-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-cyber-cyan/50"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className={`p-2.5 rounded-xl border ${attributeColors[quest.attribute_type] || 'text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/10'}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-orbitron font-bold text-base text-white">{quest.title}</h3>
                          <span className="text-[10px] font-orbitron px-2 py-0.5 rounded bg-[#161926] border border-[#24293e] text-cyber-cyan">
                            {quest.difficulty}
                          </span>
                        </div>
                        {quest.description && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{quest.description}</p>
                        )}
                        <div className="flex items-center space-x-3 mt-2 text-xs font-orbitron">
                          <span className="text-cyber-cyan">+ {quest.xp_reward} XP</span>
                          <span className="text-cyber-yellow">+ 🪙 {quest.gold_reward} GOLD</span>
                          <span className="text-cyber-dim">{quest.category}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleComplete(quest.id)}
                      disabled={isCompleting}
                      className="cyber-button-primary shrink-0 text-xs py-2 px-4 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isCompleting ? 'CLAIMING...' : 'COMPLETE'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Character Attributes Overview (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-cyber-purple" />
              <h2 className="font-orbitron font-bold text-xl text-white">ATTRIBUTES</h2>
            </div>
            <Link to="/character" className="text-xs font-orbitron text-cyber-purple hover:underline">
              DETAILS
            </Link>
          </div>

          <div className="cyber-card p-5 space-y-4">
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
                <div key={name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-orbitron">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4 text-cyber-cyan" />
                      <span className="text-gray-200">{name}</span>
                    </div>
                    <span className="text-cyber-cyan font-bold">{val} PTS</span>
                  </div>
                  <div className="w-full bg-[#161926] h-2 rounded-full overflow-hidden border border-[#24293e]">
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

      </div>

    </div>
  );
};
