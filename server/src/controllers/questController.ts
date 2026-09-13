import { Response } from 'express';
import { db } from '../database/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { ProgressionService } from '../services/progressionService.js';

export const getQuests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status, category, difficulty, search } = req.query;

    let sql = 'SELECT * FROM quests WHERE user_id = $1';
    const params: any[] = [userId];
    let paramIndex = 2;

    if (status && typeof status === 'string') {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (category && typeof category === 'string' && category !== 'All') {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    if (difficulty && typeof difficulty === 'string' && difficulty !== 'All') {
      sql += ` AND difficulty = $${paramIndex++}`;
      params.push(difficulty);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      sql += ` AND (LOWER(title) LIKE $${paramIndex} OR LOWER(description) LIKE $${paramIndex})`;
      params.push(`%${search.trim().toLowerCase()}%`);
      paramIndex++;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await db.query(sql, params);

    res.json({ quests: result.rows });
  } catch (err: any) {
    console.error('[Quests] GetQuests error:', err);
    res.status(500).json({ error: 'Failed to retrieve quests: ' + err.message });
  }
};

export const createQuest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, description, category, difficulty } = req.body;

    if (!title || title.trim() === '') {
      res.status(400).json({ error: 'Quest title is required.' });
      return;
    }

    const questCategory = category || 'Coding';
    const questDifficulty = difficulty || 'Medium';

    // Calculate backend validated rewards
    const rewards = ProgressionService.getQuestRewards(questDifficulty, questCategory);

    const questId = `qst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    await db.query(
      `INSERT INTO quests (id, user_id, title, description, category, difficulty, xp_reward, gold_reward, attribute_type, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE')`,
      [
        questId,
        userId,
        title.trim(),
        description ? description.trim() : '',
        questCategory,
        questDifficulty,
        rewards.xp,
        rewards.gold,
        rewards.attributeType
      ]
    );

    const newQuestRes = await db.query('SELECT * FROM quests WHERE id = $1', [questId]);

    res.status(201).json({
      message: 'Quest created successfully!',
      quest: newQuestRes.rows[0]
    });
  } catch (err: any) {
    console.error('[Quests] CreateQuest error:', err);
    res.status(500).json({ error: 'Failed to create quest: ' + err.message });
  }
};

export const updateQuest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title, description, category, difficulty } = req.body;

    // Verify ownership
    const existing = await db.query('SELECT * FROM quests WHERE id = $1 AND user_id = $2', [id, userId]);
    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'Quest not found or unauthorized.' });
      return;
    }

    const quest = existing.rows[0];
    if (quest.status === 'COMPLETED') {
      res.status(400).json({ error: 'Completed quests cannot be modified.' });
      return;
    }

    const newCategory = category || quest.category;
    const newDifficulty = difficulty || quest.difficulty;
    const rewards = ProgressionService.getQuestRewards(newDifficulty, newCategory);

    await db.query(
      `UPDATE quests
       SET title = $1, description = $2, category = $3, difficulty = $4,
           xp_reward = $5, gold_reward = $6, attribute_type = $7
       WHERE id = $8 AND user_id = $9`,
      [
        title ? title.trim() : quest.title,
        description !== undefined ? description.trim() : quest.description,
        newCategory,
        newDifficulty,
        rewards.xp,
        rewards.gold,
        rewards.attributeType,
        id,
        userId
      ]
    );

    const updated = await db.query('SELECT * FROM quests WHERE id = $1', [id]);

    res.json({
      message: 'Quest updated successfully!',
      quest: updated.rows[0]
    });
  } catch (err: any) {
    console.error('[Quests] UpdateQuest error:', err);
    res.status(500).json({ error: 'Failed to update quest: ' + err.message });
  }
};

export const deleteQuest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    // Verify ownership
    const existing = await db.query('SELECT id FROM quests WHERE id = $1 AND user_id = $2', [id, userId]);
    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'Quest not found or unauthorized.' });
      return;
    }

    await db.query('DELETE FROM quests WHERE id = $1 AND user_id = $2', [id, userId]);

    res.json({ message: 'Quest deleted successfully!', questId: id });
  } catch (err: any) {
    console.error('[Quests] DeleteQuest error:', err);
    res.status(500).json({ error: 'Failed to delete quest: ' + err.message });
  }
};

export const completeQuest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    // 1. Ownership & Duplicate Completion check
    const questRes = await db.query('SELECT * FROM quests WHERE id = $1 AND user_id = $2', [id, userId]);
    if (questRes.rows.length === 0) {
      res.status(404).json({ error: 'Quest not found or unauthorized.' });
      return;
    }

    const quest = questRes.rows[0];
    if (quest.status === 'COMPLETED') {
      res.status(400).json({ error: 'Quest has already been completed.' });
      return;
    }

    // 2. Fetch User
    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];

    // 3. Mark Quest as Completed
    const completedAt = new Date().toISOString();
    await db.query(
      'UPDATE quests SET status = \'COMPLETED\', completed_at = $1 WHERE id = $2',
      [completedAt, id]
    );

    // 4. Calculate Level & XP Progression
    const rewards = ProgressionService.getQuestRewards(quest.difficulty, quest.category);
    const progression = ProgressionService.calculateProgression(user.level, user.xp, rewards.xp);

    // Update user title based on level threshold
    let newTitle = user.title;
    if (progression.level >= 10) newTitle = 'Netrunner Grandmaster';
    else if (progression.level >= 5) newTitle = 'Cyber Vanguard';
    else if (progression.level >= 3) newTitle = 'Neon Specialist';

    // 5. Update Streak
    const streakInfo = ProgressionService.updateStreak(
      user.last_activity_date,
      user.current_streak,
      user.best_streak
    );

    const currentGold = Number(user.gold) || 0;
    const rewardsGold = Number(rewards.gold) || 0;
    const newGold = currentGold + rewardsGold;

    // 6. Update User in DB
    await db.query(
      `UPDATE users
       SET level = $1, xp = $2, gold = $3, current_streak = $4, best_streak = $5,
           last_activity_date = $6, title = $7
       WHERE id = $8`,
      [
        progression.level,
        progression.currentXp,
        newGold,
        streakInfo.newStreak,
        streakInfo.newBestStreak,
        streakInfo.todayStr,
        newTitle,
        userId
      ]
    );

    // 7. Increment Associated Character Attribute (Portable SELECT/UPDATE/INSERT)
    const attrType = quest.attribute_type || rewards.attributeType;
    const attrRes = await db.query(
      'SELECT value FROM user_attributes WHERE user_id = $1 AND attribute_name = $2',
      [userId, attrType]
    );

    let currentAttrVal = 10;
    if (attrRes.rows.length > 0) {
      currentAttrVal = Number(attrRes.rows[0].value) || 10;
      const newAttrVal = currentAttrVal + rewards.attributeGain;
      await db.query(
        'UPDATE user_attributes SET value = $1 WHERE user_id = $2 AND attribute_name = $3',
        [newAttrVal, userId, attrType]
      );
    } else {
      const newAttrVal = currentAttrVal + rewards.attributeGain;
      await db.query(
        'INSERT INTO user_attributes (id, user_id, attribute_name, value) VALUES ($1, $2, $3, $4)',
        [`attr-${userId}-${attrType}`, userId, attrType, newAttrVal]
      );
    }

    // Log completion event
    const compLogId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    await db.query(
      `INSERT INTO quest_completions (id, user_id, quest_id, completed_date, xp_earned, gold_earned)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [compLogId, userId, id, streakInfo.todayStr, rewards.xp, rewards.gold]
    );

    // 8. Check Achievements
    const unlockedAchievementIds = await ProgressionService.checkAndGrantAchievements(userId!);

    // Fetch newly updated attributes list
    const allAttrsRes = await db.query('SELECT attribute_name, value FROM user_attributes WHERE user_id = $1', [userId]);
    const updatedAttributes: Record<string, number> = {};
    for (const r of allAttrsRes.rows) {
      updatedAttributes[r.attribute_name] = r.value;
    }

    res.json({
      message: 'Quest Completed! Rewards Awarded!',
      rewards: {
        xpEarned: rewards.xp,
        goldEarned: rewards.gold,
        attributeType: attrType,
        attributeGain: rewards.attributeGain
      },
      user: {
        level: progression.level,
        xp: progression.currentXp,
        xpRequiredNext: progression.xpRequiredNext,
        gold: newGold,
        currentStreak: streakInfo.newStreak,
        bestStreak: streakInfo.newBestStreak,
        title: newTitle
      },
      progression: {
        leveledUp: progression.leveledUp,
        levelsGained: progression.levelsGained,
        previousLevel: user.level,
        newLevel: progression.level
      },
      attributes: updatedAttributes,
      unlockedAchievementIds
    });
  } catch (err: any) {
    console.error('[Quests] CompleteQuest error:', err);
    res.status(500).json({ error: 'Failed to complete quest: ' + err.message });
  }
};
