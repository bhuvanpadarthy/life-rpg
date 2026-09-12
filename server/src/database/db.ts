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

class DB {
  private pgPool: pg.Pool | null = null;
  private sqliteDb: Database<sqlite3.Database, sqlite3.Statement> | null = null;
  public isPg: boolean = false;

  async init() {
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
        console.error('[DB] PostgreSQL connection failed, falling back to local database mode:', err);
      }
    }

    // Fallback: Local SQLite database for zero-dependency local dev/evaluation
    console.log('[DB] Using local SQLite database engine.');
    const dbPath = path.resolve(process.cwd(), 'life_rpg.sqlite');
    this.sqliteDb = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    this.isPg = false;
    await this.runMigrations();
  }

  private async runMigrations() {
    const schemaPath = path.resolve(process.cwd(), 'server/src/database/schema.sql');
    const seedPath = path.resolve(process.cwd(), 'server/src/database/seed.sql');

    if (fs.existsSync(schemaPath)) {
      let schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      if (!this.isPg && this.sqliteDb) {
        // Adapt PostgreSQL DDL to SQLite syntax where needed
        schemaSql = schemaSql
          .replace(/VARCHAR\(\d+\)/gi, 'TEXT')
          .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/gi, 'TEXT DEFAULT (datetime(\'now\'))')
          .replace(/BOOLEAN DEFAULT (TRUE|FALSE)/gi, (match, p1) => `INTEGER DEFAULT ${p1.toUpperCase() === 'TRUE' ? 1 : 0}`)
          .replace(/ON CONFLICT \(id\) DO NOTHING/gi, 'ON CONFLICT DO NOTHING');
        
        await this.sqliteDb.exec(schemaSql);
      } else if (this.pgPool) {
        await this.pgPool.query(schemaSql);
      }
    }

    if (fs.existsSync(seedPath)) {
      let seedSql = fs.readFileSync(seedPath, 'utf8');
      if (!this.isPg && this.sqliteDb) {
        seedSql = seedSql.replace(/ON CONFLICT \(id\) DO NOTHING/gi, 'ON CONFLICT DO NOTHING');
        await this.sqliteDb.exec(seedSql);
      } else if (this.pgPool) {
        await this.pgPool.query(seedSql);
      }
    }
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    if (this.isPg && this.pgPool) {
      // Postgres query
      // Convert ? to $1, $2, etc if present
      let paramCount = 0;
      const pgSql = sql.replace(/\?/g, () => `$${++paramCount}`);
      const res = await this.pgPool.query(pgSql, params);
      return { rows: res.rows, rowCount: res.rowCount || res.rows.length };
    } else if (this.sqliteDb) {
      // SQLite query
      // Convert $1, $2, etc to ? if present
      const sqliteSql = sql.replace(/\$\d+/g, '?');
      
      const lowerSql = sqliteSql.trim().toLowerCase();
      if (lowerSql.startsWith('select') || lowerSql.startsWith('with')) {
        const rows = await this.sqliteDb.all<T[]>(sqliteSql, params);
        return { rows, rowCount: rows.length };
      } else {
        const result = await this.sqliteDb.run(sqliteSql, params);
        return { rows: [], rowCount: result.changes || 0 };
      }
    } else {
      throw new Error('[DB] Database not initialized');
    }
  }
}

export const db = new DB();
