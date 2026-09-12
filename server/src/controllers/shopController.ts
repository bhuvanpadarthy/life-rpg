import { Response } from 'express';
import { db } from '../database/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { ProgressionService } from '../services/progressionService.js';

export const getShopItems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const itemsRes = await db.query('SELECT * FROM items ORDER BY price ASC');
    const userInvRes = await db.query('SELECT item_id, is_equipped FROM user_inventory WHERE user_id = $1', [userId]);

    const ownedMap = new Map<string, boolean>();
    const equippedMap = new Map<string, boolean>();

    for (const inv of userInvRes.rows) {
      ownedMap.set(inv.item_id, true);
      if (inv.is_equipped) {
        equippedMap.set(inv.item_id, true);
      }
    }

    const items = itemsRes.rows.map(item => ({
      ...item,
      isOwned: ownedMap.has(item.id),
      isEquipped: equippedMap.has(item.id)
    }));

    res.json({ items });
  } catch (err: any) {
    console.error('[Shop] GetShopItems error:', err);
    res.status(500).json({ error: 'Failed to retrieve shop items: ' + err.message });
  }
};

export const purchaseItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.body;

    if (!itemId) {
      res.status(400).json({ error: 'Item ID is required.' });
      return;
    }

    // 1. Fetch Item
    const itemRes = await db.query('SELECT * FROM items WHERE id = $1', [itemId]);
    if (itemRes.rows.length === 0) {
      res.status(404).json({ error: 'Item not found.' });
      return;
    }

    const item = itemRes.rows[0];

    // 2. Check duplicate purchase
    const invRes = await db.query('SELECT id FROM user_inventory WHERE user_id = $1 AND item_id = $2', [userId, itemId]);
    if (invRes.rows.length > 0) {
      res.status(400).json({ error: 'You already own this item.' });
      return;
    }

    // 3. Fetch User Gold
    const userRes = await db.query('SELECT gold FROM users WHERE id = $1', [userId]);
    const userGold = userRes.rows[0].gold;

    if (userGold < item.price) {
      res.status(400).json({
        error: `Insufficient Gold. You have 🪙 ${userGold} Gold, but ${item.name} costs 🪙 ${item.price} Gold.`
      });
      return;
    }

    // 4. Deduct Gold & Add to Inventory
    const newGold = userGold - item.price;
    await db.query('UPDATE users SET gold = $1 WHERE id = $2', [newGold, userId]);

    const invId = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await db.query(
      'INSERT INTO user_inventory (id, user_id, item_id, is_equipped) VALUES ($1, $2, $3, FALSE)',
      [invId, userId, itemId]
    );

    // 5. Check Achievements
    const unlockedAchievementIds = await ProgressionService.checkAndGrantAchievements(userId!);

    res.json({
      message: `Purchased ${item.name} successfully!`,
      item,
      newGold,
      unlockedAchievementIds
    });
  } catch (err: any) {
    console.error('[Shop] PurchaseItem error:', err);
    res.status(500).json({ error: 'Failed to purchase item: ' + err.message });
  }
};

export const getUserInventory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const resInv = await db.query(
      `SELECT ui.id as inventory_id, ui.is_equipped, ui.acquired_at,
              i.id as item_id, i.name, i.description, i.category, i.price, i.icon_key, i.stat_bonus, i.rarity
       FROM user_inventory ui
       JOIN items i ON ui.item_id = i.id
       WHERE ui.user_id = $1
       ORDER BY ui.acquired_at DESC`,
      [userId]
    );

    res.json({ inventory: resInv.rows });
  } catch (err: any) {
    console.error('[Shop] GetInventory error:', err);
    res.status(500).json({ error: 'Failed to retrieve inventory: ' + err.message });
  }
};

export const equipItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.body;

    const invRes = await db.query(
      'SELECT ui.id, ui.is_equipped, i.category FROM user_inventory ui JOIN items i ON ui.item_id = i.id WHERE ui.user_id = $1 AND ui.item_id = $2',
      [userId, itemId]
    );

    if (invRes.rows.length === 0) {
      res.status(404).json({ error: 'Item not found in your inventory.' });
      return;
    }

    const currentInv = invRes.rows[0];
    const newEquippedState = !currentInv.is_equipped;

    if (newEquippedState) {
      // Unequip other items in the same category first if it's a category that permits 1 equipped item
      const sameCategoryItems = await db.query(
        `SELECT ui.id FROM user_inventory ui JOIN items i ON ui.item_id = i.id WHERE ui.user_id = $1 AND i.category = $2`,
        [userId, currentInv.category]
      );

      for (const item of sameCategoryItems.rows) {
        await db.query('UPDATE user_inventory SET is_equipped = FALSE WHERE id = $1', [item.id]);
      }
    }

    await db.query('UPDATE user_inventory SET is_equipped = $1 WHERE user_id = $2 AND item_id = $3', [
      newEquippedState,
      userId,
      itemId
    ]);

    res.json({
      message: newEquippedState ? 'Item equipped!' : 'Item unequipped!',
      itemId,
      isEquipped: newEquippedState
    });
  } catch (err: any) {
    console.error('[Shop] EquipItem error:', err);
    res.status(500).json({ error: 'Failed to equip item: ' + err.message });
  }
};
