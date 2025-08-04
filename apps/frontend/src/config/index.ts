// apps/frontend/src/config/index.ts

/**
 * 核心原则：配置原子。
 * 这个文件是前端应用所有环境变量的唯一、可信的来源。
 * 它从 Vite 的 `import.meta.env` 中读取变量，并以一种清晰、类型安全的方式导出。
 * 应用的其他部分应该从这里导入配置，而不是直接访问 `import.meta.env`。
 */

const VITE_BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || '3001';

export const config = {
  // 根据环境（开发/生产）确定 API 的基础 URL
  apiBaseUrl: import.meta.env.DEV
    ? `http://localhost:${VITE_BACKEND_PORT}`
    : '',
};
