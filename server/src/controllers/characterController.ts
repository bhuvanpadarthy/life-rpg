import { Response } from 'express';
import { db } from '../database/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { ProgressionService } from '../services/progressionService.js';

export const getCharacterStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Fetch user
    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = userRes.rows[0];
    const xpRequiredNext = ProgressionService.getXpRequiredForLevel(user.level);

    // Fetch Attributes
    const attrRes = await db.query('SELECT attribute_name, value FROM user_attributes WHERE user_id = $1', [userId]);
    const attributes: Record<string, number> = {};
    for (const r of attrRes.rows) {
      attributes[r.attribute_name] = r.value;
    }

    // Fetch Equipped Items
    const equippedRes = await db.query(
      `SELECT i.id, i.name, i.category, i.icon_key, i.stat_bonus, i.rarity
       FROM user_inventory ui
       JOIN items i ON ui.item_id = i.id
       WHERE ui.user_id = $1 AND ui.is_equipped = TRUE`,
      [userId]
    );

    // Fetch Quest Counts
    const questStatsRes = await db.query(
      `SELECT
         COUNT(*) as total_quests,
         SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_quests,
         SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_quests
       FROM quests WHERE user_id = $1`,
      [userId]
    );

    const stats = questStatsRes.rows[0] || { total_quests: 0, completed_quests: 0, active_quests: 0 };

    res.json({
      character: {
        id: user.id,
        username: user.username,
        level: user.level,
        xp: user.xp,
        xpRequiredNext,
        xpProgressPercent: Math.min(100, Math.floor((user.xp / xpRequiredNext) * 100)),
        gold: user.gold,
        currentStreak: user.current_streak,
        bestStreak: user.best_streak,
        title: user.title,
        avatarUrl: user.avatar_url,
        attributes,
        equippedItems: equippedRes.rows,
        stats: {
          totalQuests: parseInt(stats.total_quests || '0', 10),
          completedQuests: parseInt(stats.completed_quests || '0', 10),
          activeQuests: parseInt(stats.active_quests || '0', 10)
        }
      }
    });
  } catch (err: any) {
    console.error('[Character] GetCharacterStats error:', err);
    res.status(500).json({ error: 'Failed to retrieve character stats: ' + err.message });
  }
};
