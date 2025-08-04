// apps/backend/src/data/migrate.ts

import { initializeDatabase, pool } from '../config/database';

/**
 * 核心原则：关注点分离。
 * 这是一个独立的迁移脚本，它的唯一职责就是初始化数据库结构。
 * 它可以独立于主应用运行（例如，通过 `npm run db:migrate`），
 * 这对于CI/CD流程和开发设置非常有用。
 */
async function runMigration() {
  console.log('[Migrate] Starting database migration...');
  try {
    await initializeDatabase();
    console.log('[Migrate] Migration completed successfully.');
  } catch (error) {
    console.error('[Migrate] Migration failed:', error);
    process.exit(1);
  } finally {
    // 确保在脚本执行完毕后关闭连接池，以允许进程正常退出
    await pool.end();
  }
}

runMigration();
