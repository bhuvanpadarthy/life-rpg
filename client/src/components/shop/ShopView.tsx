import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Shield, 
  Sword, 
  Coins, 
  CheckCircle2, 
  Sparkles, 
  Palette, 
  Award, 
  Activity, 
  Dumbbell, 
  MessageSquare, 
  Zap,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGame, ShopItem } from '../../context/GameContext';

export const ShopView: React.FC = () => {
  const { user } = useAuth();
  const { shopItems, inventory, purchaseItem, equipItem } = useGame();
  const [activeTab, setActiveTab] = useState<'SHOP' | 'INVENTORY'>('SHOP');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  if (!user) return null;

  const itemIcons: Record<string, any> = {
    sword: Sword,
    shield: Shield,
    palette: Palette,
    award: Award,
    sparkles: Sparkles,
    activity: Activity,
    dumbbell: Dumbbell,
    'message-square': MessageSquare
  };

  const rarityBorders: Record<string, string> = {
    Common: 'border-gray-700 hover:border-gray-500',
    Rare: 'border-cyber-cyan/50 hover:border-cyber-cyan shadow-glow-cyan',
    Epic: 'border-cyber-pink/50 hover:border-cyber-pink shadow-glow-pink',
    Legendary: 'border-cyber-yellow/60 hover:border-cyber-yellow shadow-glow-gold'
  };

  const rarityBadges: Record<string, string> = {
    Common: 'bg-gray-800 text-gray-300 border-gray-700',
    Rare: 'bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/30',
    Epic: 'bg-cyber-pink/15 text-cyber-pink border-cyber-pink/30',
    Legendary: 'bg-cyber-yellow/15 text-cyber-yellow border-cyber-yellow/30'
  };

  const handleBuy = async (item: ShopItem) => {
    setPurchasingId(item.id);
    try {
      await purchaseItem(item.id);
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white flex items-center space-x-3">
            <ShoppingBag className="w-8 h-8 text-cyber-yellow" />
            <span>CYBERPUNK MARKETPLACE</span>
          </h1>
          <p className="text-gray-400 text-sm font-sans mt-1">
            Spend your earned Cyber Gold on weapons, armor, avatar frames, themes, and badges.
          </p>
        </div>

        {/* User Balance Badge */}
        <div className="flex items-center space-x-2 bg-[#10121b] border border-cyber-yellow/40 px-4 py-2 rounded-xl text-cyber-yellow shadow-glow-gold">
          <Coins className="w-5 h-5 text-cyber-yellow" />
          <span className="font-orbitron font-bold text-base">🪙 {user.gold} GOLD</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 bg-[#161926] p-1 rounded-xl border border-[#24293e] max-w-xs">
        <button
          onClick={() => setActiveTab('SHOP')}
          className={`flex-1 py-2 rounded-lg text-xs font-orbitron font-bold transition-all ${
            activeTab === 'SHOP'
              ? 'bg-cyber-yellow text-black shadow-glow-gold'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          CATALOG ({shopItems.length})
        </button>
        <button
          onClick={() => setActiveTab('INVENTORY')}
          className={`flex-1 py-2 rounded-lg text-xs font-orbitron font-bold transition-all ${
            activeTab === 'INVENTORY'
              ? 'bg-cyber-cyan text-black shadow-glow-cyan'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          INVENTORY ({inventory.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'SHOP' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shopItems.map((item) => {
            const Icon = itemIcons[item.icon_key] || Sword;
            const isPurchasing = purchasingId === item.id;
            const isOwned = item.isOwned;

            return (
              <div 
                key={item.id} 
                className={`cyber-card p-5 border flex flex-col justify-between space-y-4 ${rarityBorders[item.rarity] || 'border-gray-700'}`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-[#161926] border border-[#24293e] text-cyber-yellow">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-orbitron px-2.5 py-0.5 rounded border ${rarityBadges[item.rarity]}`}>
                      {item.rarity}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-orbitron font-bold text-lg text-white">{item.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                  </div>

                  {item.stat_bonus && (
                    <div className="inline-flex items-center space-x-1.5 bg-[#161926] border border-cyber-cyan/30 px-2.5 py-1 rounded-md text-cyber-cyan text-xs font-orbitron">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{item.stat_bonus}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#24293e] flex items-center justify-between">
                  <span className="font-orbitron font-bold text-cyber-yellow text-sm">
                    🪙 {item.price} GOLD
                  </span>

                  {isOwned ? (
                    <span className="text-xs font-orbitron text-cyber-green flex items-center space-x-1 bg-cyber-green/10 border border-cyber-green/30 px-3 py-1.5 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>OWNED</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={isPurchasing || user.gold < item.price}
                      className={`cyber-button text-xs py-2 px-4 rounded-lg flex items-center space-x-1.5 ${
                        user.gold < item.price 
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-cyber-yellow to-amber-600 text-black hover:shadow-glow-gold'
                      }`}
                    >
                      <Coins className="w-4 h-4" />
                      <span>{isPurchasing ? 'BUYING...' : user.gold < item.price ? 'LOCKED' : 'PURCHASE'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Inventory Tab */
        <div>
          {inventory.length === 0 ? (
            <div className="cyber-card p-12 text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-cyber-dim mx-auto" />
              <div>
                <h3 className="font-orbitron font-bold text-lg text-white">INVENTORY EMPTY</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto mt-1">
                  You haven't acquired any cybernetic items yet. Browse the shop catalog to unlock upgrades!
                </p>
              </div>
              <button onClick={() => setActiveTab('SHOP')} className="cyber-button-primary inline-flex text-xs">
                <span>GO TO CATALOG</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventory.map((inv) => {
                const Icon = itemIcons[inv.icon_key] || Sword;
                const isEquipped = inv.is_equipped;

                return (
                  <div key={inv.inventory_id} className="cyber-card p-5 space-y-4 border-cyber-cyan/40">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-[#161926] border border-[#24293e] text-cyber-cyan">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-orbitron px-2.5 py-0.5 rounded border ${rarityBadges[inv.rarity]}`}>
                        {inv.rarity}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-orbitron font-bold text-lg text-white">{inv.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{inv.description}</p>
                    </div>

                    {inv.stat_bonus && (
                      <div className="inline-flex items-center space-x-1.5 bg-[#161926] border border-cyber-cyan/30 px-2.5 py-1 rounded-md text-cyber-cyan text-xs font-orbitron">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{inv.stat_bonus}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-[#24293e] flex items-center justify-between">
                      <span className="text-[10px] font-orbitron text-cyber-dim">CATEGORY: {inv.category.toUpperCase()}</span>
                      <button
                        onClick={() => equipItem(inv.item_id)}
                        className={`cyber-button text-xs py-1.5 px-4 rounded-lg ${
                          isEquipped
                            ? 'bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/40 hover:bg-cyber-purple/30'
                            : 'cyber-button-secondary'
                        }`}
                      >
                        {isEquipped ? 'EQUIPPED' : 'EQUIP'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
