import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface User {
  id: string;
  username: string;
  email: string;
  level: number;
  xp: number;
  xpRequiredNext: number;
  gold: number;
  currentStreak: number;
  bestStreak: number;
  title: string;
  avatarUrl?: string;
  attributes?: Record<string, number>;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedFields: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('life_rpg_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('life_rpg_token') || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const saveSession = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('life_rpg_token', newToken);
    localStorage.setItem('life_rpg_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('life_rpg_token');
    localStorage.removeItem('life_rpg_user');
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...updatedFields };
    setUser(newUser);
    localStorage.setItem('life_rpg_user', JSON.stringify(newUser));
  };

  const refreshUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      if (res.data && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('life_rpg_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    const res = await api.post('/auth/login', { usernameOrEmail, password });
    saveSession(res.data.token, res.data.user);
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { username, email, password });
    saveSession(res.data.token, res.data.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
