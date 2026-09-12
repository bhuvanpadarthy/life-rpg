import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useAuth } from './AuthContext';

export interface Quest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  xp_reward: number;
  gold_reward: number;
  attribute_type: string;
  status: 'ACTIVE' | 'COMPLETED';
  created_at: string;
  completed_at?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  icon_key: string;
  stat_bonus: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  isOwned?: boolean;
  isEquipped?: boolean;
}

export interface Achievement {
  id: string;
  key_name: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  required_value: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

interface LevelUpState {
  isOpen: boolean;
  previousLevel: number;
  newLevel: number;
  levelsGained: number;
}

interface NotificationState {
  id: string;
  title: string;
  message: string;
  type: 'xp' | 'gold' | 'level' | 'achievement' | 'error' | 'info';
}

interface GameContextType {
  quests: Quest[];
  shopItems: ShopItem[];
  inventory: any[];
  achievements: Achievement[];
  isLoadingQuests: boolean;
  levelUpState: LevelUpState;
  notifications: NotificationState[];
  closeLevelUpModal: () => void;
  fetchQuests: (filters?: any) => Promise<void>;
  createQuest: (title: string, description: string, category: string, difficulty: string) => Promise<void>;
  updateQuest: (id: string, title: string, description: string, category: string, difficulty: string) => Promise<void>;
  deleteQuest: (id: string) => Promise<void>;
  completeQuest: (id: string) => Promise<void>;
  fetchShopItems: () => Promise<void>;
  purchaseItem: (itemId: string) => Promise<void>;
  fetchInventory: () => Promise<void>;
  equipItem: (itemId: string) => Promise<void>;
  fetchAchievements: () => Promise<void>;
  addNotification: (title: string, message: string, type: NotificationState['type']) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, updateUser } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoadingQuests, setIsLoadingQuests] = useState<boolean>(false);

  const [levelUpState, setLevelUpState] = useState<LevelUpState>({
    isOpen: false,
    previousLevel: 1,
    newLevel: 1,
    levelsGained: 0
  });

  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  const addNotification = (title: string, message: string, type: NotificationState['type']) => {
    const id = `notif-${Date.now()}-${Math.random()}`;
    setNotifications(prev => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const closeLevelUpModal = () => {
    setLevelUpState(prev => ({ ...prev, isOpen: false }));
  };

  const fetchQuests = async (filters?: any) => {
    if (!isAuthenticated) return;
    setIsLoadingQuests(true);
    try {
      const res = await api.get('/quests', { params: filters });
      setQuests(res.data.quests || []);
    } catch (err: any) {
      console.error('Error fetching quests:', err);
    } finally {
      setIsLoadingQuests(false);
    }
  };

  const createQuest = async (title: string, description: string, category: string, difficulty: string) => {
    const res = await api.post('/quests', { title, description, category, difficulty });
    if (res.data && res.data.quest) {
      setQuests(prev => [res.data.quest, ...prev]);
      addNotification('Quest Initiated', `Created quest "${title}"`, 'info');
    }
  };

  const updateQuest = async (id: string, title: string, description: string, category: string, difficulty: string) => {
    const res = await api.put(`/quests/${id}`, { title, description, category, difficulty });
    if (res.data && res.data.quest) {
      setQuests(prev => prev.map(q => q.id === id ? res.data.quest : q));
      addNotification('Quest Updated', `Updated "${title}"`, 'info');
    }
  };

  const deleteQuest = async (id: string) => {
    await api.delete(`/quests/${id}`);
    setQuests(prev => prev.filter(q => q.id !== id));
    addNotification('Quest Terminated', 'Quest has been deleted', 'info');
  };

  const completeQuest = async (id: string) => {
    const res = await api.post(`/quests/${id}/complete`);
    const data = res.data;

    // Update quest list
    setQuests(prev => prev.map(q => q.id === id ? { ...q, status: 'COMPLETED' as const, completed_at: new Date().toISOString() } : q));

    // Update user auth context
    if (data.user) {
      updateUser({
        level: data.user.level,
        xp: data.user.xp,
        xpRequiredNext: data.user.xpRequiredNext,
        gold: data.user.gold,
        currentStreak: data.user.currentStreak,
        bestStreak: data.user.bestStreak,
        title: data.user.title,
        attributes: data.attributes
      });
    }

    // Trigger XP Notification
    addNotification(
      'QUEST COMPLETED! ⚔️',
      `+${data.rewards.xpEarned} XP | +🪙 ${data.rewards.goldEarned} Gold | +${data.rewards.attributeGain} ${data.rewards.attributeType}`,
      'xp'
    );

    // Trigger Level Up Celebration if leveled up
    if (data.progression && data.progression.leveledUp) {
      // Trigger canvas confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      setLevelUpState({
        isOpen: true,
        previousLevel: data.progression.previousLevel,
        newLevel: data.progression.newLevel,
        levelsGained: data.progression.levelsGained
      });
    }

    // Trigger Unlocked Achievements notification
    if (data.unlockedAchievementIds && data.unlockedAchievementIds.length > 0) {
      addNotification('ACHIEVEMENT UNLOCKED! 🏆', 'Check your achievements tab!', 'achievement');
      fetchAchievements();
    }
  };

  const fetchShopItems = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/shop/items');
      setShopItems(res.data.items || []);
    } catch (err: any) {
      console.error('Error fetching shop items:', err);
    }
  };

  const purchaseItem = async (itemId: string) => {
    const res = await api.post('/shop/purchase', { itemId });
    const data = res.data;

    addNotification('ITEM ACQUIRED! 🛍️', `Purchased ${data.item.name}!`, 'gold');

    if (data.newGold !== undefined) {
      updateUser({ gold: data.newGold });
    }

    fetchShopItems();
    fetchInventory();
  };

  const fetchInventory = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/inventory');
      setInventory(res.data.inventory || []);
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
    }
  };

  const equipItem = async (itemId: string) => {
    const res = await api.post('/inventory/equip', { itemId });
    addNotification('EQUIPMENT UPDATED ⚔️', res.data.message, 'info');
    fetchInventory();
    fetchShopItems();
  };

  const fetchAchievements = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/achievements');
      setAchievements(res.data.achievements || []);
    } catch (err: any) {
      console.error('Error fetching achievements:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchQuests();
      fetchShopItems();
      fetchInventory();
      fetchAchievements();
    }
  }, [isAuthenticated]);

  return (
    <GameContext.Provider
      value={{
        quests,
        shopItems,
        inventory,
        achievements,
        isLoadingQuests,
        levelUpState,
        notifications,
        closeLevelUpModal,
        fetchQuests,
        createQuest,
        updateQuest,
        deleteQuest,
        completeQuest,
        fetchShopItems,
        purchaseItem,
        fetchInventory,
        equipItem,
        fetchAchievements,
        addNotification
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
