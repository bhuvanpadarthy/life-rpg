import pg from 'pg';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

interface QueryResult<T = any> {
  rows: T[];
  rowCount?: number;
}

const DEFAULT_SCHEMA_SQL = `
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
  category VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  xp_reward INT NOT NULL,
  gold_reward INT NOT NULL,
  attribute_type VARCHAR(30) NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_attributes (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attribute_name VARCHAR(50) NOT NULL,
  value INT DEFAULT 10,
  UNIQUE(user_id, attribute_name)
);

CREATE TABLE IF NOT EXISTS items (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(30) NOT NULL,
  price INT NOT NULL,
  icon_key VARCHAR(50) NOT NULL,
  stat_bonus VARCHAR(50),
  rarity VARCHAR(20) DEFAULT 'Common'
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
`;

const DEFAULT_SEED_SQL = `
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
`;

class DB {
  private pgPool: pg.Pool | null = null;
  private sqliteDb: Database<sqlite3.Database, sqlite3.Statement> | null = null;
  public isPg: boolean = false;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }
    this.initPromise = this._doInit();
    return this.initPromise;
  }

  private async _doInit(): Promise<void> {
    const connectionString = process.env.DATABASE_URL;

    if (connectionString && connectionString.trim() !== '') {
      try {
        console.log('[DB] Connecting to PostgreSQL database...');
        this.pgPool = new Pool({
          connectionString,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        // Test connection
        await this.pgPool.query('SELECT 1');
        this.isPg = true;
        console.log('[DB] Connected successfully to PostgreSQL.');
        await this.runMigrations();
        return;
      } catch (err) {
        console.error('[DB] PostgreSQL connection failed, attempting SQLite fallback:', err);
      }
    }

    // Fallback: SQLite database (handles read-only Vercel serverless filesystem)
    console.log('[DB] Using SQLite database engine.');
    const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    const dbPath = isVercel
      ? path.resolve('/tmp', 'life_rpg.sqlite')
      : path.resolve(process.cwd(), 'life_rpg.sqlite');

    try {
      this.sqliteDb = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });
      this.isPg = false;
      await this.runMigrations();
      console.log(`[DB] Connected successfully to SQLite (${dbPath}).`);
    } catch (sqliteErr) {
      console.error('[DB] SQLite file initialization failed, using in-memory fallback:', sqliteErr);
      try {
        this.sqliteDb = await open({
          filename: ':memory:',
          driver: sqlite3.Database
        });
        this.isPg = false;
        await this.runMigrations();
        console.log('[DB] Connected to in-memory SQLite fallback.');
      } catch (memErr) {
        console.error('[DB] In-memory SQLite failed:', memErr);
        throw new Error('Database connection failed. Please ensure DATABASE_URL is set in Vercel settings.');
      }
    }
  }

  private async runMigrations() {
    const schemaPath = path.resolve(process.cwd(), 'server/src/database/schema.sql');
    const seedPath = path.resolve(process.cwd(), 'server/src/database/seed.sql');

    let schemaSql = DEFAULT_SCHEMA_SQL;
    if (fs.existsSync(schemaPath)) {
      try {
        schemaSql = fs.readFileSync(schemaPath, 'utf8');
      } catch {
        schemaSql = DEFAULT_SCHEMA_SQL;
      }
    }

    let seedSql = DEFAULT_SEED_SQL;
    if (fs.existsSync(seedPath)) {
      try {
        seedSql = fs.readFileSync(seedPath, 'utf8');
      } catch {
        seedSql = DEFAULT_SEED_SQL;
      }
    }

    if (!this.isPg && this.sqliteDb) {
      // Adapt PostgreSQL DDL to SQLite syntax where needed
      const adaptedSchemaSql = schemaSql
        .replace(/VARCHAR\(\d+\)/gi, 'TEXT')
        .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/gi, "TEXT DEFAULT (datetime('now'))")
        .replace(/BOOLEAN DEFAULT (TRUE|FALSE)/gi, (match, p1) => `INTEGER DEFAULT ${p1.toUpperCase() === 'TRUE' ? 1 : 0}`)
        .replace(/ON CONFLICT \(id\) DO NOTHING/gi, 'ON CONFLICT DO NOTHING');

      await this.sqliteDb.exec(adaptedSchemaSql);

      const adaptedSeedSql = seedSql.replace(/ON CONFLICT \(id\) DO NOTHING/gi, 'ON CONFLICT DO NOTHING');
      await this.sqliteDb.exec(adaptedSeedSql);
    } else if (this.pgPool) {
      await this.pgPool.query(schemaSql);
      await this.pgPool.query(seedSql);
    }
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    if (!this.initPromise) {
      await this.init();
    } else {
      await this.initPromise;
    }

    if (this.isPg && this.pgPool) {
      // Postgres query
      // Convert ? to $1, $2, etc if present
      let paramCount = 0;
      const pgSql = sql.replace(/\?/g, () => `$${++paramCount}`);
      const res = await this.pgPool.query(pgSql, params);
      return { rows: res.rows, rowCount: res.rowCount || res.rows.length };
    } else if (this.sqliteDb) {
      // SQLite query: map $1, $2, etc. (even if repeated) to ? and build aligned params
      const sqliteParams: any[] = [];
      let sqliteSql = sql;
      if (sql.includes('$')) {
        sqliteSql = sql.replace(/\$(\d+)/g, (_, numStr) => {
          const index = parseInt(numStr, 10) - 1;
          if (index >= 0 && index < params.length) {
            sqliteParams.push(params[index]);
          }
          return '?';
        });
      } else {
        sqliteParams.push(...params);
      }

      const lowerSql = sqliteSql.trim().toLowerCase();
      if (lowerSql.startsWith('select') || lowerSql.startsWith('with')) {
        const rows = await this.sqliteDb.all<T[]>(sqliteSql, sqliteParams);
        return { rows, rowCount: rows.length };
      } else {
        const result = await this.sqliteDb.run(sqliteSql, sqliteParams);
        return { rows: [], rowCount: result.changes || 0 };
      }
    } else {
      throw new Error('[DB] Database not initialized');
    }
  }
}

export const db = new DB();
