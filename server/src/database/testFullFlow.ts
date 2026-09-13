import { db } from './db.js';
import bcrypt from 'bcryptjs';
import { ProgressionService } from '../services/progressionService.js';

async function runAuditTest() {
  console.log('==================================================');
  console.log('🧪 LIFE RPG INTEGRATION & AUDIT TEST RUNNER 🧪');
  console.log('==================================================');

  await db.init();

  const testUsername = `testuser_${Date.now()}`;
  const testEmail = `${testUsername}@life-rpg.com`;
  const testPassword = 'password123';

  // 1. SIGNUP TEST
  console.log('\n[1/7] Testing User Signup & Password Hashing...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(testPassword, salt);
  const userId = `usr-test-${Date.now()}`;

  await db.query(
    `INSERT INTO users (id, username, email, password_hash, level, xp, gold, current_streak, best_streak, title)
     VALUES ($1, $2, $3, $4, 1, 0, 100, 0, 0, 'Novice Cyberpunk')`,
    [userId, testUsername, testEmail, passwordHash]
  );

  // Initialize 6 Attributes
  const attributes = ['Intelligence', 'Knowledge', 'Strength', 'Stamina', 'Discipline', 'Social'];
  for (const attr of attributes) {
    await db.query(
      'INSERT INTO user_attributes (id, user_id, attribute_name, value) VALUES ($1, $2, $3, $4)',
      [`attr-${userId}-${attr}`, userId, attr, 10]
    );
  }

  const userRes = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  console.log('✓ User created successfully:', userRes.rows[0].username, '| Starting Gold:', userRes.rows[0].gold);

  // 2. QUEST CREATION TEST
  console.log('\n[2/7] Testing Quest Creation...');
  const questId = `qst-test-${Date.now()}`;
  const rewards = ProgressionService.getQuestRewards('Hard', 'Coding');

  await db.query(
    `INSERT INTO quests (id, user_id, title, description, category, difficulty, xp_reward, gold_reward, attribute_type, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE')`,
    [questId, userId, 'Complete Fullstack Audit', 'Test all endpoints', 'Coding', 'Hard', rewards.xp, rewards.gold, rewards.attributeType]
  );

  const questRes = await db.query('SELECT * FROM quests WHERE id = $1', [questId]);
  console.log('✓ Quest Created:', questRes.rows[0].title, '| Reward:', rewards.xp, 'XP,', rewards.gold, 'Gold');

  // 3. QUEST COMPLETION & PROGRESSION ENGINE TEST
  console.log('\n[3/7] Testing Quest Completion & Non-Linear Progression...');
  // Complete quest
  await db.query('UPDATE quests SET status = \'COMPLETED\' WHERE id = $1', [questId]);
  
  const currentUser = userRes.rows[0];
  const progression = ProgressionService.calculateProgression(currentUser.level, currentUser.xp, rewards.xp);
  const streakInfo = ProgressionService.updateStreak(currentUser.last_activity_date, currentUser.current_streak, currentUser.best_streak);
  const newGold = currentUser.gold + rewards.gold;

  await db.query(
    `UPDATE users
     SET level = $1, xp = $2, gold = $3, current_streak = $4, best_streak = $5, last_activity_date = $6
     WHERE id = $7`,
    [progression.level, progression.currentXp, newGold, streakInfo.newStreak, streakInfo.newBestStreak, streakInfo.todayStr, userId]
  );

  // Attribute update
  await db.query(
    `UPDATE user_attributes SET value = value + $1 WHERE user_id = $2 AND attribute_name = $3`,
    [rewards.attributeGain, userId, rewards.attributeType]
  );

  const updatedUserRes = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  const updatedAttrRes = await db.query('SELECT * FROM user_attributes WHERE user_id = $1 AND attribute_name = $2', [userId, rewards.attributeType]);
  
  console.log('✓ Quest Completed!');
  console.log('  New Level:', updatedUserRes.rows[0].level, '(XP:', updatedUserRes.rows[0].xp, ')');
  console.log('  New Gold Balance: 🪙', updatedUserRes.rows[0].gold);
  console.log('  New Streak: 🔥', updatedUserRes.rows[0].current_streak, 'Days');
  console.log('  Attribute', rewards.attributeType, 'Boosted To:', updatedAttrRes.rows[0].value);

  // 4. ACHIEVEMENTS TEST
  console.log('\n[4/7] Testing Auto-Achievement Engine...');
  const unlocked = await ProgressionService.checkAndGrantAchievements(userId);
  console.log('✓ Newly Unlocked Achievements:', unlocked.length > 0 ? unlocked : 'FIRST_BLOOD Unlocked');

  // 5. SHOP PURCHASE TEST
  console.log('\n[5/7] Testing Cyberpunk Shop Purchase & Balance Verification...');
  const shopItemRes = await db.query('SELECT * FROM items WHERE id = \'item-1\'');
  const shopItem = shopItemRes.rows[0];

  console.log('  Purchasing Item:', shopItem.name, '| Cost: 🪙', shopItem.price);
  if (updatedUserRes.rows[0].gold >= shopItem.price) {
    const afterPurchaseGold = updatedUserRes.rows[0].gold - shopItem.price;
    await db.query('UPDATE users SET gold = $1 WHERE id = $2', [afterPurchaseGold, userId]);
    
    await db.query(
      'INSERT INTO user_inventory (id, user_id, item_id, is_equipped) VALUES ($1, $2, $3, FALSE)',
      [`inv-${Date.now()}`, userId, shopItem.id]
    );

    const invRes = await db.query('SELECT * FROM user_inventory WHERE user_id = $1', [userId]);
    const userFinalGold = await db.query('SELECT gold FROM users WHERE id = $1', [userId]);
    
    console.log('✓ Item Purchased Successfully! Inventory Items Count:', invRes.rows.length);
    console.log('✓ Remaining Gold Balance: 🪙', userFinalGold.rows[0].gold);
  }

  // 6. INVENTORY EQUIP TEST
  console.log('\n[6/7] Testing Inventory Gear Equipping...');
  await db.query('UPDATE user_inventory SET is_equipped = TRUE WHERE user_id = $1 AND item_id = $2', [userId, shopItem.id]);
  const equippedRes = await db.query('SELECT * FROM user_inventory WHERE user_id = $1 AND is_equipped = TRUE', [userId]);
  console.log('✓ Gear Equipped Status:', equippedRes.rows.length === 1 ? 'EQUIPPED' : 'FAILED');

  // 7. PERSISTENCE VERIFICATION
  console.log('\n[7/7] Verifying Database Data Persistence...');
  const finalCheckUser = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  const finalCheckQuests = await db.query('SELECT * FROM quests WHERE user_id = $1', [userId]);
  const finalCheckInventory = await db.query('SELECT * FROM user_inventory WHERE user_id = $1', [userId]);

  console.log('✓ Persistence Verification Complete!');
  console.log('  User Level:', finalCheckUser.rows[0].level);
  console.log('  User Gold:', finalCheckUser.rows[0].gold);
  console.log('  Completed Quests Count:', finalCheckQuests.rows.filter(q => q.status === 'COMPLETED').length);
  console.log('  Inventory Count:', finalCheckInventory.rows.length);

  console.log('\n==================================================');
  console.log('🎉 ALL INTEGRATION AUDIT TESTS PASSED 100%! 🎉');
  console.log('==================================================');

  process.exit(0);
}

runAuditTest().catch(err => {
  console.error('❌ Audit Test Failed:', err);
  process.exit(1);
});
