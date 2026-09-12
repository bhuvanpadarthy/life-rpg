import { Response } from 'express';
import { db } from '../database/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getAchievements = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const achievementsRes = await db.query('SELECT * FROM achievements');
    const userAchRes = await db.query(
      'SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = $1',
      [userId]
    );

    const unlockedMap = new Map<string, string>();
    for (const r of userAchRes.rows) {
      unlockedMap.set(r.achievement_id, r.unlocked_at);
    }

    const achievements = achievementsRes.rows.map(ach => ({
      ...ach,
      isUnlocked: unlockedMap.has(ach.id),
      unlockedAt: unlockedMap.get(ach.id) || null
    }));

    res.json({ achievements });
  } catch (err: any) {
    console.error('[Achievements] GetAchievements error:', err);
    res.status(500).json({ error: 'Failed to retrieve achievements: ' + err.message });
  }
};
