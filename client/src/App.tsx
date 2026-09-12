import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { Navbar } from './components/layout/Navbar';
import { ToastNotifications } from './components/common/ToastNotifications';
import { LevelUpModal } from './components/common/LevelUpModal';

import { Dashboard } from './components/dashboard/Dashboard';
import { QuestsView } from './components/quests/QuestsView';
import { CharacterView } from './components/character/CharacterView';
import { ShopView } from './components/shop/ShopView';
import { AchievementsView } from './components/achievements/AchievementsView';
import { AuthPage } from './pages/AuthPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-bg">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-orbitron text-xs text-cyber-cyan tracking-widest uppercase">
            LOADING SYSTEM CORE...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-cyber-bg text-gray-100 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quests"
              element={
                <ProtectedRoute>
                  <QuestsView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/character"
              element={
                <ProtectedRoute>
                  <CharacterView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop"
              element={
                <ProtectedRoute>
                  <ShopView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <ProtectedRoute>
                  <AchievementsView />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <ToastNotifications />
        <LevelUpModal />
      </div>
    </Router>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </AuthProvider>
  );
};

export default App;
