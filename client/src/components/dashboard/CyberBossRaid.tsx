import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  ShieldAlert, 
  Crosshair, 
  Sparkles, 
  Flame, 
  Volume2, 
  VolumeX, 
  Cpu, 
  Radio, 
  Trophy,
  RefreshCw,
  Swords
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';

// Web Audio API Sound Synthesizer (Zero External Dependencies)
class CyberAudioSynth {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playLaser() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {
      // Audio context policy fallback
    }
  }

  playScan() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {
      // Audio fallback
    }
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.value = freq;

        const startTime = this.ctx!.currentTime + idx * 0.08;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch {
      // Audio fallback
    }
  }
}

const synth = new CyberAudioSynth();

const BOSS_LIST = [
  {
    id: 'boss-1',
    name: 'CORRUPTED ALGORITHM: PROCRASTINATOR v9.0',
    title: 'Drains focus & steals daily productivity',
    maxHp: 500,
    avatar: '👾',
    rewardGold: 250,
    rewardXp: 400,
    color: 'from-cyan-500 to-pink-500'
  },
  {
    id: 'boss-2',
    name: 'TITAN OF DISTRACTION: DOOMSCROLLER',
    title: 'Hypnotizes minds with endless social feeds',
    maxHp: 750,
    avatar: '👁️',
    rewardGold: 400,
    rewardXp: 600,
    color: 'from-purple-500 to-red-500'
  },
  {
    id: 'boss-3',
    name: 'SYSTEM OVERLORD: BURNOUT NEXUS',
    title: 'Depletes mental stamina & energy reserves',
    maxHp: 1000,
    avatar: '🔥',
    rewardGold: 600,
    rewardXp: 1000,
    color: 'from-yellow-500 to-red-600'
  }
];

const MATRIX_ORACLE_QUESTS = [
  { title: 'Neural Code Sprint: 25-min Deep Focus', category: 'Coding', difficulty: 'Hard', xp: 120, gold: 80, attr: 'Intelligence' },
  { title: 'Kinetic Overdrive: 25 Pushups & Core Work', category: 'Gym', difficulty: 'Medium', xp: 90, gold: 60, attr: 'Strength' },
  { title: 'Neural Data Sync: Read 15 pages of Tech Docs', category: 'Studying', difficulty: 'Easy', xp: 60, gold: 40, attr: 'Knowledge' },
  { title: 'Cardio Boost: 20-min High Energy Run', category: 'Running', difficulty: 'Hard', xp: 130, gold: 90, attr: 'Stamina' },
  { title: 'Cyber Mind Reset: 10-min Zero-Distraction Meditation', category: 'Meditation', difficulty: 'Medium', xp: 80, gold: 50, attr: 'Discipline' }
];

export const CyberBossRaid: React.FC = () => {
  const { user } = useAuth();
  const { createQuest } = useGame();

  const [currentBossIdx, setCurrentBossIdx] = useState(0);
  const [bossHp, setBossHp] = useState(350);
  const [combo, setCombo] = useState(1);
  const [isAttacking, setIsAttacking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [oracleDecrypting, setOracleDecrypting] = useState(false);
  const [oracleMsg, setOracleMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentBoss = BOSS_LIST[currentBossIdx];
  const hpPercent = Math.max(0, Math.min(100, Math.floor((bossHp / currentBoss.maxHp) * 100)));

  // Canvas particle background effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{ x: number; y: number; size: number; speedX: number; speedY: number; opacity: number }> = [];

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = canvas.parentElement?.clientHeight || 250;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5,
        opacity: Math.random() * 0.7 + 0.3
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f0ff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleAttackBoss = () => {
    synth.enabled = soundEnabled;
    synth.playLaser();

    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 300);

    const damage = Math.floor(Math.random() * 35) + 25;
    const newHp = Math.max(0, bossHp - damage);
    setBossHp(newHp);
    setCombo((prev) => prev + 1);

    if (newHp === 0) {
      synth.playVictory();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        const nextIdx = (currentBossIdx + 1) % BOSS_LIST.length;
        setCurrentBossIdx(nextIdx);
        setBossHp(BOSS_LIST[nextIdx].maxHp);
        setCombo(1);
      }, 1500);
    }
  };

  const handleSummonOracleQuest = async () => {
    synth.enabled = soundEnabled;
    synth.playScan();
    setOracleDecrypting(true);
    setOracleMsg(null);

    setTimeout(async () => {
      const randomQuest = MATRIX_ORACLE_QUESTS[Math.floor(Math.random() * MATRIX_ORACLE_QUESTS.length)];
      try {
        await createQuest({
          title: `[ORACLE] ${randomQuest.title}`,
          description: `Generated by Neural AI Matrix to optimize ${randomQuest.attr} attribute.`,
          category: randomQuest.category,
          difficulty: randomQuest.difficulty,
          xpReward: randomQuest.xp,
          goldReward: randomQuest.gold,
          attributeType: randomQuest.attr
        });
        setOracleMsg(`SUCCESS! Quest "${randomQuest.title}" added to your active matrix.`);
      } catch {
        setOracleMsg(`Quest decrypted: "${randomQuest.title}"!`);
      } finally {
        setOracleDecrypting(false);
      }
    }, 800);
  };

  if (!user) return null;

  return (
    <div className="relative cyber-card p-6 sm:p-8 overflow-hidden border-2 border-cyber-cyan/40 shadow-glow-cyan">
      
      {/* Background Canvas Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-40" />

      {/* Background Glow Orbs */}
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-cyber-pink/20 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-cyber-cyan/20 rounded-full blur-3xl -z-10" />

      <div className="relative z-10 space-y-6">
        
        {/* Header HUD */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#24293e] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-cyan to-cyber-pink p-0.5 animate-pulse">
              <div className="w-full h-full bg-[#090a0f] rounded-[10px] flex items-center justify-center">
                <Swords className="w-5 h-5 text-cyber-cyan" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 text-[10px] font-orbitron font-extrabold text-cyber-pink uppercase tracking-widest">
                <Radio className="w-3 h-3 animate-ping" />
                <span>LIVE CYBER RAID BOSS EVENT</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-orbitron font-black text-white tracking-wide">
                NEURAL MATRIX BOSS BATTLE
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-[#161926] border border-[#24293e] text-cyber-cyan hover:text-white hover:border-cyber-cyan transition-all text-xs flex items-center space-x-1 font-orbitron"
              title="Toggle Cyber Synth Audio"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'SFX ON' : 'SFX MUTED'}</span>
            </button>

            <div className="px-3 py-1.5 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/40 text-cyber-cyan font-orbitron text-xs font-bold shadow-glow-cyan">
              {combo}X COMBO MULTIPLIER
            </div>
          </div>
        </div>

        {/* Boss Display Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-[#0d0f17]/90 p-5 rounded-2xl border border-[#24293e]">
          
          {/* 3D Boss Avatar Artwork */}
          <div className="flex flex-col items-center justify-center space-y-2 text-center md:border-r border-[#24293e] md:pr-6">
            <div className={`relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-cyber-pink/60 shadow-glow-pink transition-all duration-200 ${isAttacking ? 'scale-110 rotate-3 shadow-glow-pink filter brightness-125' : 'hover:scale-105'}`}>
              <img 
                src="/assets/cyber_boss_3d.jpg" 
                alt="Cyber Mecha Raid Boss 3D" 
                className="w-full h-full object-cover animate-pulse"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute top-2 right-2 text-xl">{currentBoss.avatar}</div>
            </div>
            <span className="text-xs font-orbitron text-cyber-pink font-bold uppercase tracking-wider animate-pulse">
              {bossHp === 0 ? '💥 BOSS DEFEATED!' : '3D MECHA TARGET ACQUIRED'}
            </span>
          </div>

          {/* Boss Stats & HP Bar */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-orbitron font-extrabold text-base text-white">
                  {currentBoss.name}
                </h3>
                <span className="font-orbitron text-xs text-cyber-cyan font-bold">
                  {bossHp} / {currentBoss.maxHp} HP
                </span>
              </div>
              <p className="text-xs text-gray-400 font-sans mb-3">
                {currentBoss.title}
              </p>

              {/* Dynamic Health Bar */}
              <div className="w-full bg-[#161926] h-4 rounded-full overflow-hidden border border-[#24293e] relative">
                <div 
                  className="h-full bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink transition-all duration-300 shadow-glow-cyan"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>

            {/* Boss Rewards & Attack Trigger */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-4 text-xs font-orbitron">
                <span className="text-cyber-yellow flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+{currentBoss.rewardGold} GOLD</span>
                </span>
                <span className="text-cyber-purple flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>+{currentBoss.rewardXp} XP</span>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAttackBoss}
                  disabled={bossHp === 0}
                  className="cyber-button-primary px-4 py-2 text-xs font-orbitron font-bold flex items-center space-x-1.5"
                >
                  <Crosshair className="w-4 h-4" />
                  <span>{bossHp === 0 ? 'BOSS DEFEATED' : 'NEURAL DAMAGE STRIKE'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Neural Quest Oracle Bar */}
        <div className="bg-[#121522] p-4 rounded-xl border border-[#24293e] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-cyber-purple/20 border border-cyber-purple/40 flex items-center justify-center text-cyber-purple">
              <Cpu className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h4 className="font-orbitron font-bold text-xs text-white uppercase">
                AI NEURAL MATRIX ORACLE
              </h4>
              <p className="text-[11px] text-gray-400">
                Summon an instant AI-generated real-world Quest tailored for your attributes.
              </p>
            </div>
          </div>

          <button
            onClick={handleSummonOracleQuest}
            disabled={oracleDecrypting}
            className="cyber-button-pink px-4 py-2 text-xs font-orbitron font-bold flex items-center space-x-2 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${oracleDecrypting ? 'animate-spin' : ''}`} />
            <span>{oracleDecrypting ? 'DECRYPTING...' : 'SUMMON MATRIX QUEST'}</span>
          </button>
        </div>

        {/* Oracle Message Notification */}
        {oracleMsg && (
          <div className="bg-cyber-cyan/10 border border-cyber-cyan/40 p-3 rounded-xl flex items-center space-x-2 text-cyber-cyan text-xs font-orbitron">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{oracleMsg}</span>
          </div>
        )}

      </div>
    </div>
  );
};
