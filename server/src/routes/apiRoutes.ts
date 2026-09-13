import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { getQuests, createQuest, updateQuest, deleteQuest, completeQuest } from '../controllers/questController.js';
import { getShopItems, purchaseItem, getUserInventory, equipItem } from '../controllers/shopController.js';
import { getCharacterStats } from '../controllers/characterController.js';
import { getAchievements } from '../controllers/achievementController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Auth Routes (Public & Protected) - Supports both /auth/* and direct routes
router.post('/auth/register', register);
router.post('/register', register);

router.post('/auth/login', login);
router.post('/login', login);

router.get('/auth/me', authenticateToken, getMe);
router.get('/me', authenticateToken, getMe);

// Quest Routes (Protected)
router.get('/quests', authenticateToken, getQuests);
router.post('/quests', authenticateToken, createQuest);
router.put('/quests/:id', authenticateToken, updateQuest);
router.delete('/quests/:id', authenticateToken, deleteQuest);
router.post('/quests/:id/complete', authenticateToken, completeQuest);

// Character Routes (Protected)
router.get('/character', authenticateToken, getCharacterStats);

// Shop & Inventory Routes (Protected)
router.get('/shop/items', authenticateToken, getShopItems);
router.post('/shop/purchase', authenticateToken, purchaseItem);
router.get('/inventory', authenticateToken, getUserInventory);
router.post('/inventory/equip', authenticateToken, equipItem);

// Achievement Routes (Protected)
router.get('/achievements', authenticateToken, getAchievements);

export default router;
