-- LIFE RPG PostgreSQL DDL Schema

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  gold INT DEFAULT 100,
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  last_activity_date VARCHAR(10),
  avatar_url VARCHAR(255) DEFAULT 'default_cyber_hero',
  title VARCHAR(100) DEFAULT 'Novice Cyberpunk',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quests (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- Coding, Studying, Gym, Running, Meditation, Communication
  difficulty VARCHAR(20) NOT NULL, -- Easy, Medium, Hard, Epic, Legendary
  xp_reward INT NOT NULL,
  gold_reward INT NOT NULL,
  attribute_type VARCHAR(30) NOT NULL, -- Intelligence, Knowledge, Strength, Stamina, Discipline, Social
  status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_attributes (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attribute_name VARCHAR(50) NOT NULL, -- Intelligence, Knowledge, Strength, Stamina, Discipline, Social
  value INT DEFAULT 10,
  UNIQUE(user_id, attribute_name)
);

CREATE TABLE IF NOT EXISTS items (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(30) NOT NULL, -- weapon, armor, frame, theme, badge
  price INT NOT NULL,
  icon_key VARCHAR(50) NOT NULL,
  stat_bonus VARCHAR(50),
  rarity VARCHAR(20) DEFAULT 'Common' -- Common, Rare, Epic, Legendary
);

CREATE TABLE IF NOT EXISTS user_inventory (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id VARCHAR(64) NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  is_equipped BOOLEAN DEFAULT FALSE,
  acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, item_id)
);

CREATE TABLE IF NOT EXISTS achievements (
  id VARCHAR(64) PRIMARY KEY,
  key_name VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  category VARCHAR(30) NOT NULL,
  required_value INT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(64) NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS quest_completions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_id VARCHAR(64) NOT NULL,
  completed_date VARCHAR(10) NOT NULL,
  xp_earned INT NOT NULL,
  gold_earned INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quests_user ON quests(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_user ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
