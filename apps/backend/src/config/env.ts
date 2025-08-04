// apps/backend/src/config/env.ts

import dotenv from 'dotenv';
import path from 'path';

/**
 * 核心原则：配置原子化。
 * 这个模块是环境中所有配置的唯一来源。
 * 核心修正：在生产环境中，我们不再依赖于从文件加载环境变量。
 * 我们信任容器运行时（如 Docker Compose）已经通过环境变量注入了所有必要的配置。
 * `dotenv` 仅用于开发环境。
 */

const nodeEnv = process.env.NODE_ENV || 'dev';

// 仅在非生产环境下加载 .env 文件
if (nodeEnv !== 'production') {
  const envFile = `.env.${nodeEnv}`;
  // 开发环境中，我们从项目根目录查找配置文件。
  const envPath = path.resolve(__dirname, '..', '..', '..', '..', envFile);
  
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.error(`[ENV] DEV_MODE: Failed to load environment variables from: ${envPath}`);
    // 在开发模式下，这可能不是致命错误，但需要警告
  } else {
    console.log(`[ENV] DEV_MODE: Loading environment variables from: ${envPath}`);
  }
} else {
    console.log(`[ENV] PROD_MODE: Reading configuration from process.env.`);
}


// 定义并导出配置变量
// 这些变量现在统一从 process.env 读取，这是在生产和开发环境之间保持一致的最佳实践。
// 在开发环境中，dotenv 会将文件内容加载到 process.env。
// 在生产环境中，Docker Compose 的 env_file 会将文件内容加载到 process.env。
export const config = {
  NODE_ENV: nodeEnv,
  PORT: process.env.VITE_BACKEND_PORT || '3001',
  APP_KEY_PREFIX: process.env.APP_KEY_PREFIX || '',
  DB_HOST: process.env.DB_HOST,
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_USER: process.env.DB_USER || process.env.POSTGRES_USER,
  DB_PASSWORD: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD,
  DB_NAME: process.env.DB_NAME || process.env.POSTGRES_DB,
};

// 校验关键环境变量是否存在
const requiredEnvs: (keyof typeof config)[] = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const key of requiredEnvs) {
  if (!config[key]) {
    throw new Error(`[ENV] FATAL: Missing required environment variable: ${key}. Please check your configuration.`);
  }
}
