// apps/backend/src/config/database.ts

import { Pool } from 'pg';
import { config } from './env';

/**
 * 核心原则：连接池原子。
 * 此模块负责创建和管理数据库连接池。它是与数据库交互的基础，
 * 保证了连接的复用和高效管理。
 * 整个应用应该共享这一个连接池实例。
 */

export const pool = new Pool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
});

pool.on('connect', () => {
  console.log('[DB] Connected to PostgreSQL database.');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * 一个独立的函数，用于执行数据库表的初始化。
 * 这使得数据库结构的管理可以与应用逻辑分离。
 */
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        client_key VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[DB] "messages" table initialized successfully.');
  } catch (err) {
    console.error('[DB] Error initializing database table:', err);
    throw err;
  } finally {
    client.release();
  }
}
