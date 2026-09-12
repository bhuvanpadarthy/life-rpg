import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Flame, 
  Coins, 
  Shield, 
  Sword, 
  User, 
  ShoppingBag, 
  Award, 
  LogOut, 
  Menu, 
  X,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const xpPercent = Math.min(100, Math.floor((user.xp / (user.xpRequiredNext || 100)) * 100));

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: Zap },
    { name: 'Quests', path: '/quests', icon: Sword },
    { name: 'Character', path: '/character', icon: User },
    { name: 'Shop', path: '/shop', icon: ShoppingBag },
    { name: 'Achievements', path: '/achievements', icon: Award },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#090a0f]/90 backdrop-blur-md border-b border-[#24293e]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyber-cyan to-cyber-purple flex items-center justify-center p-0.5 shadow-glow-cyan group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090a0f] rounded-[7px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyber-cyan group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <span className="font-orbitron font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-white to-cyber-pink tracking-wider">
                LIFE<span className="text-cyber-cyan">.</span>RPG
              </span>
              <span className="block text-[9px] font-rajdhani text-cyber-dim tracking-widest uppercase">
                Turn Life Into Game
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-rajdhani font-semibold transition-all ${
                    isActive
                      ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40 shadow-[0_0_12px_rgba(0,243,255,0.2)]'
                      : 'text-gray-400 hover:text-white hover:bg-[#161926]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyber-cyan' : 'text-gray-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Stats & Profile Controls */}
          <div className="hidden sm:flex items-center space-x-4">
            
            {/* Streak Counter */}
            <div className="flex items-center space-x-1.5 bg-[#161926] px-3 py-1.5 rounded-full border border-orange-500/30 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.15)]" title="Current Activity Streak">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span className="font-orbitron font-bold text-xs">{user.currentStreak}d</span>
            </div>

            {/* Gold Currency */}
            <div className="flex items-center space-x-1.5 bg-[#161926] px-3 py-1.5 rounded-full border border-cyber-yellow/40 text-cyber-yellow shadow-glow-gold" title="Cyber Gold Balance">
              <Coins className="w-4 h-4 text-cyber-yellow" />
              <span className="font-orbitron font-bold text-xs">🪙 {user.gold}</span>
            </div>

            {/* Level & XP Meter */}
            <div className="flex items-center space-x-3 bg-[#10121b] border border-[#24293e] px-3.5 py-1.5 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-cyber-purple/30 border border-cyber-purple flex items-center justify-center">
                <span className="font-orbitron text-xs font-bold text-cyber-purple">L{user.level}</span>
              </div>
              <div className="w-24">
                <div className="flex justify-between text-[10px] font-orbitron mb-1">
                  <span className="text-cyber-dim">XP</span>
                  <span className="text-cyber-cyan">{user.xp}/{user.xpRequiredNext}</span>
                </div>
                <div className="w-full bg-[#161926] h-1.5 rounded-full overflow-hidden border border-[#24293e]">
                  <div 
                    className="bg-gradient-to-r from-cyber-cyan to-cyber-purple h-full rounded-full transition-all duration-500 shadow-glow-cyan"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-cyber-red hover:bg-cyber-red/10 rounded-lg transition-colors"
              title="Logout Session"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 sm:hidden">
            <div className="flex items-center space-x-1.5 bg-[#161926] px-2.5 py-1 rounded-full border border-cyber-yellow/40 text-cyber-yellow">
              <span className="font-orbitron font-bold text-xs">🪙 {user.gold}</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#090a0f] border-b border-[#24293e] px-4 pt-3 pb-4 space-y-3">
          
          {/* User Progress Mobile Bar */}
          <div className="bg-[#10121b] p-3 rounded-xl border border-[#24293e] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-cyber-purple/30 border border-cyber-purple flex items-center justify-center font-orbitron font-bold text-cyber-purple">
                L{user.level}
              </div>
              <div>
                <p className="font-orbitron text-xs font-bold text-white">{user.username}</p>
                <p className="text-[10px] text-cyber-dim">{user.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-orange-400 text-xs font-bold bg-[#161926] px-2 py-1 rounded-md">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span>{user.currentStreak}d</span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-rajdhani font-semibold ${
                    isActive
                      ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40'
                      : 'text-gray-400 hover:text-white hover:bg-[#161926]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              logout();
            }}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 text-cyber-red bg-cyber-red/10 rounded-lg font-rajdhani font-bold hover:bg-cyber-red/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Session</span>
          </button>
        </div>
      )}
    </header>
  );
};
