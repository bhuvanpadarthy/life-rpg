import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLoginTab) {
        await login(username || email, password);
      } else {
        if (!username || !email || !password) {
          setError('Please complete all required fields.');
          setIsLoading(false);
          return;
        }
        await register(username, email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cyber-bg bg-cyber-grid relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-cyan/15 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-pink/15 rounded-full blur-3xl -z-10 animate-pulse" />

      <div className="max-w-md w-full cyber-card-glow p-8 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyber-cyan to-cyber-purple p-0.5 shadow-glow-cyan mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-[#090a0f] rounded-[14px] flex items-center justify-center">
              <Shield className="w-8 h-8 text-cyber-cyan" />
            </div>
          </div>

          <h1 className="font-orbitron font-extrabold text-3xl text-white tracking-wider">
            LIFE<span className="text-cyber-cyan">.</span>RPG
          </h1>
          <p className="text-xs font-rajdhani text-cyber-dim uppercase tracking-widest">
            Turn Your Real Life Into A Game
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-2 bg-[#161926] p-1 rounded-xl border border-[#24293e]">
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-orbitron font-bold transition-all ${
              isLoginTab ? 'bg-cyber-cyan text-black shadow-glow-cyan' : 'text-gray-400 hover:text-white'
            }`}
          >
            LOGIN
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-orbitron font-bold transition-all ${
              !isLoginTab ? 'bg-cyber-pink text-white shadow-glow-pink' : 'text-gray-400 hover:text-white'
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-cyber-red/10 border border-cyber-red/40 p-3 rounded-xl flex items-center space-x-2 text-cyber-red text-xs font-sans">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isLoginTab ? (
            <div>
              <label className="block text-xs font-orbitron text-cyber-dim uppercase mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-cyber-dim absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Enter username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="cyber-input w-full pl-9 text-sm"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-orbitron text-cyber-dim uppercase mb-1.5">
                  Username *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-cyber-dim absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Cyber handle (e.g. NeoRunner)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="cyber-input w-full pl-9 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-orbitron text-cyber-dim uppercase mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-cyber-dim absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="netrunner@life-rpg.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="cyber-input w-full pl-9 text-sm"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-orbitron text-cyber-dim uppercase mb-1.5">
              Security Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cyber-dim absolute left-3 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cyber-input w-full pl-9 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-orbitron font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
              isLoginTab ? 'cyber-button-primary' : 'cyber-button-pink'
            }`}
          >
            <span>{isLoading ? 'AUTHENTICATING...' : isLoginTab ? 'INITIALIZE SESSION' : 'CREATE CHARACTER'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-center text-cyber-dim font-rajdhani">
          Protected by Cyberpunk JWT Token Auth & Password Hashing.
        </p>

      </div>
    </div>
  );
};
