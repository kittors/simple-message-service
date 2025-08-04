// apps/backend/src/config/env.ts

import dotenv from 'dotenv';
import path from 'path';

/**
 * 核心原则：配置原子化。
 * 这个模块是环境中所有配置的唯一来源。它负责加载正确的 .env 文件，
 * 并以类型安全的方式导出所有配置变量。
 */

// 1. 加载环境变量文件
const envFile = `.env.${process.env.NODE_ENV || 'dev'}`;
// 核心修正：路径解析逻辑需要向上追溯四层才能从 `src/config` 目录找到项目根目录。
// __dirname -> src/config, '..' -> src, '..' -> apps/backend, '..' -> apps, '..' -> project root
const envPath = path.resolve(__dirname, '..', '..', '..', '..', envFile);

dotenv.config({ path: envPath });
console.log(`[ENV] Loading environment variables from: ${envPath}`);

// 2. 定义并导出配置变量
export const config = {
  NODE_ENV: process.env.NODE_ENV || 'dev',
  PORT: process.env.VITE_BACKEND_PORT || '3001',
  APP_KEY_PREFIX: process.env.APP_KEY_PREFIX || '',
  // 核心修正：为了同时兼容应用内部配置 (DB_*) 和 Docker 初始化配置 (POSTGRES_*)，
  // 我们优先读取 DB_*, 如果不存在则回退到 POSTGRES_*。这使得配置更加灵活。
  DB_HOST: process.env.DB_HOST,
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_USER: process.env.DB_USER || process.env.POSTGRES_USER,
  DB_PASSWORD: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD,
  DB_NAME: process.env.DB_NAME || process.env.POSTGRES_DB,
};

// 3. 校验关键环境变量是否存在
const requiredEnvs: (keyof typeof config)[] = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const key of requiredEnvs) {
  if (!config[key]) {
    // 在抛出错误时，明确指出是哪个配置文件出了问题，方便快速定位。
    throw new Error(`[ENV] Missing required environment variable: ${key}. Please check your configuration in ${envPath}.`);
  }
}
