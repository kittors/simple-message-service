// apps/backend/src/server.ts

import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env';
import { initializeDatabase } from './config/database';
import messageRoutes from './api/message.routes';

/**
 * 核心原则：应用入口/编排器。
 * server.ts 作为应用的入口点，其职责是“编排”和“组装”。它负责：
 * 1. 初始化环境和数据库。
 * 2. 设置全局中间件（如 CORS, JSON解析）。
 * 3. 挂载API路由。
 * 4. 启动服务器。
 * 它本身不包含任何业务逻辑，只是将各个“原子”模块组合在一起。
 */

async function startServer() {
  // 1. 初始化数据库
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('[Server] Failed to initialize database. Shutting down.');
    process.exit(1);
  }

  const app = express();

  // 2. 设置中间件
  // 核心修正：在允许的 HTTP 方法列表中添加 'DELETE'，以解决CORS预检请求失败的问题。
  app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE'] }));
  app.use(express.json());

  // 3. 挂载API路由
  app.use('/api', messageRoutes);

  // 4. 提供前端静态文件 (生产环境)
  if (config.NODE_ENV === 'production') {
    const frontendPath = path.join(__dirname, '..', 'frontend');
    app.use(express.static(frontendPath));
    console.log(`[Static] Serving static files from: ${frontendPath}`);
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  }

  // 5. 启动服务器
  app.listen(config.PORT, () => {
    console.log(`[Server] Server is running on \x1b[32mhttp://localhost:${config.PORT}\x1b[0m`);
  });
}

startServer();
