import { db } from '../database/db.js';

export interface LevelInfo {
  level: number;
  currentXp: number;
  xpRequiredNext: number;
  progressPercent: number;
  leveledUp: boolean;
  levelsGained: number;
}

export class ProgressionService {
  /**
   * Non-Linear XP required for a given level
   * Formula: XP_REQUIRED(level) = Math.floor(100 * (level ^ 1.5))
   */
  static getXpRequiredForLevel(level: number): number {
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  /**
   * Calculates new level, remaining XP, and levels gained
   */
  static calculateProgression(currentLevel: number, currentXp: number, addedXp: number): LevelInfo {
    let level = currentLevel;
    let totalXp = currentXp + addedXp;
    let xpForNext = this.getXpRequiredForLevel(level);
    let levelsGained = 0;

    while (totalXp >= xpForNext) {
      totalXp -= xpForNext;
      level += 1;
      levelsGained += 1;
      xpForNext = this.getXpRequiredForLevel(level);
    }

    const progressPercent = Math.min(100, Math.floor((totalXp / xpForNext) * 100));

    return {
      level,
      currentXp: totalXp,
      xpRequiredNext: xpForNext,
      progressPercent,
      leveledUp: levelsGained > 0,
      levelsGained
    };
  }

  /**
   * Updates user streak based on activity date
   */
  static updateStreak(lastActivityDate: string | null, currentStreak: number, bestStreak: number): {
    newStreak: number;
    newBestStreak: number;
    todayStr: string;
    isFirstToday: boolean;
  } {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (!lastActivityDate) {
      // First activity ever
      return {
        newStreak: 1,
        newBestStreak: Math.max(1, bestStreak),
        todayStr,
        isFirstToday: true
      };
    }

    if (lastActivityDate === todayStr) {
      // Already active today
      return {
        newStreak: currentStreak,
        newBestStreak: bestStreak,
        todayStr,
        isFirstToday: false
      };
    }

    const lastDate = new Date(lastActivityDate);
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = currentStreak;
    if (diffDays === 1) {
      // Consecutive day!
      newStreak += 1;
    } else {
      // Missed one or more days -> reset to 1
      newStreak = 1;
    }

    const newBestStreak = Math.max(newStreak, bestStreak);

    return {
      newStreak,
      newBestStreak,
      todayStr,
      isFirstToday: true
    };
  }

  /**
   * Returns default attribute boosts based on quest difficulty and category
   */
  static getQuestRewards(difficulty: string, category: string): {
    xp: number;
    gold: number;
    attributeType: string;
    attributeGain: number;
  } {
    // Map category to attribute
    const attributeMap: Record<string, string> = {
      Coding: 'Intelligence',
      Studying: 'Knowledge',
      Gym: 'Strength',
      Running: 'Stamina',
      Meditation: 'Discipline',
      Communication: 'Social'
    };

    const attributeType = attributeMap[category] || 'Intelligence';

    const diffRewards: Record<string, { xp: number; gold: number; gain: number }> = {
      Easy: { xp: 50, gold: 20, gain: 2 },
      Medium: { xp: 100, gold: 45, gain: 4 },
      Hard: { xp: 200, gold: 90, gain: 8 },
      Epic: { xp: 350, gold: 160, gain: 14 },
      Legendary: { xp: 550, gold: 280, gain: 25 }
    };

    const reward = diffRewards[difficulty] || diffRewards.Medium;

    return {
      xp: reward.xp,
      gold: reward.gold,
      attributeType,
      attributeGain: reward.gain
    };
  }

  /**
   * Checks and awards achievements automatically based on user progress
   */
  static async checkAndGrantAchievements(userId: string): Promise<string[]> {
    const newlyUnlocked: string[] = [];

    try {
      // Fetch user stats
      const userRes = await db.query('SELECT level, current_streak, gold FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length === 0) return [];
      const user = userRes.rows[0];

      // Fetch quest counts
      const questCountRes = await db.query(
        'SELECT COUNT(*) as total, category FROM quests WHERE user_id = $1 AND status = \'COMPLETED\' GROUP BY category',
        [userId]
      );

      let totalCompleted = 0;
      const categoryCounts: Record<string, number> = {};
      for (const r of questCountRes.rows) {
        const cnt = parseInt(r.total || '0', 10);
        totalCompleted += cnt;
        categoryCounts[r.category] = cnt;
      }

      // Fetch inventory item count
      const inventoryRes = await db.query('SELECT COUNT(*) as total FROM user_inventory WHERE user_id = $1', [userId]);
      const itemsBought = parseInt(inventoryRes.rows[0]?.total || '0', 10);

      // Fetch existing achievements
      const existingRes = await db.query('SELECT achievement_id FROM user_achievements WHERE user_id = $1', [userId]);
      const unlockedSet = new Set(existingRes.rows.map(r => r.achievement_id));

      // All possible achievements
      const achievementsRes = await db.query('SELECT id, key_name, required_value, category FROM achievements');

      for (const ach of achievementsRes.rows) {
        if (unlockedSet.has(ach.id)) continue;

        let unlock = false;
        switch (ach.key_name) {
          case 'FIRST_BLOOD':
            unlock = totalCompleted >= 1;
            break;
          case 'WEEK_WARRIOR':
            unlock = user.current_streak >= 7;
            break;
          case 'HERO_LEVEL_5':
            unlock = user.level >= 5;
            break;
          case 'HERO_LEVEL_10':
            unlock = user.level >= 10;
            break;
          case 'CODE_MASTER':
            unlock = (categoryCounts['Coding'] || 0) >= ach.required_value;
            break;
          case 'BOOKWORM':
            unlock = (categoryCounts['Studying'] || 0) >= ach.required_value;
            break;
          case 'FITNESS_PARAGON':
            unlock = ((categoryCounts['Gym'] || 0) + (categoryCounts['Running'] || 0)) >= ach.required_value;
            break;
          case 'CYBER_SHOPPER':
            unlock = itemsBought >= 1;
            break;
        }

        if (unlock) {
          const userAchId = `uach-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          await db.query(
            'INSERT INTO user_achievements (id, user_id, achievement_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
            [userAchId, userId, ach.id]
          );
          newlyUnlocked.push(ach.id);
        }
      }
    } catch (err) {
      console.error('[ProgressionService] Error checking achievements:', err);
    }

    return newlyUnlocked;
  }
}
