-- LIFE RPG Default Seed Items & Achievements

-- Items
INSERT INTO items (id, name, description, category, price, icon_key, stat_bonus, rarity) VALUES
('item-1', 'Cyber Katana', 'High-frequency blade infused with plasma edge. Boosts combat discipline.', 'weapon', 150, 'sword', '+5 Discipline', 'Rare'),
('item-2', 'Neural Interface Shield', 'Defends your mind against distraction and fatigue.', 'armor', 250, 'shield', '+8 Intelligence', 'Rare'),
('item-3', 'Neon Overdrive Theme', 'Transforms UI with hyper-glowing cyan-pink neon aesthetics.', 'theme', 300, 'palette', 'Cosmetic Glow', 'Epic'),
('item-4', 'Quantum Core Badge', 'Display of raw computational mastery.', 'badge', 100, 'award', '+3 Knowledge', 'Common'),
('item-5', 'Holographic Cyber Frame', 'Futuristic animated aura surrounding your avatar.', 'frame', 400, 'sparkles', '+10 All Attributes', 'Legendary'),
('item-6', 'Exo-Suit Stabilizer', 'Enhances physical stamina for intense real-world workouts.', 'armor', 200, 'activity', '+7 Stamina', 'Rare'),
('item-7', 'Titanium Dumbbell', 'Forged in heavy industry for max strength gains.', 'weapon', 120, 'dumbbell', '+5 Strength', 'Common'),
('item-8', 'Cyberdeck Transmitter', 'Augments social communication bandwidth.', 'weapon', 180, 'message-square', '+6 Social', 'Rare')
ON CONFLICT (id) DO NOTHING;

-- Achievements
INSERT INTO achievements (id, key_name, title, description, icon, category, required_value) VALUES
('ach-1', 'FIRST_BLOOD', 'First Blood', 'Complete your very first real-world quest.', 'zap', 'quests', 1),
('ach-2', 'WEEK_WARRIOR', 'Week Warrior', 'Maintain a 7-day consecutive activity streak.', 'flame', 'streak', 7),
('ach-3', 'HERO_LEVEL_5', 'Cyber Hero (Level 5)', 'Ascend to Level 5.', 'shield-alert', 'level', 5),
('ach-4', 'HERO_LEVEL_10', 'Netrunner Master (Level 10)', 'Reach Level 10 mastery.', 'crown', 'level', 10),
('ach-5', 'CODE_MASTER', 'Code Master', 'Complete 10 Coding quests.', 'code', 'category_coding', 10),
('ach-6', 'BOOKWORM', 'Neural Knowledge', 'Complete 10 Studying quests.', 'book-open', 'category_studying', 10),
('ach-7', 'FITNESS_PARAGON', 'Titan Physicality', 'Complete 10 Gym or Running quests.', 'dumbbell', 'category_fitness', 10),
('ach-8', 'CYBER_SHOPPER', 'Cyberpunk Elite', 'Purchase your first item from the Shop.', 'shopping-bag', 'shop', 1)
ON CONFLICT (id) DO NOTHING;
