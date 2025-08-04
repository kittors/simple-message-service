// apps/backend/src/api/message.routes.ts

import { Router } from 'express';
import * as MessageController from '../controllers/message.controller';

/**
 * 核心原则：路由定义原子。
 * 这个文件只负责定义API的路由（端点）。
 * 它将特定的HTTP方法和URL路径映射到对应的控制器函数。
 * 这种分离使得API的结构一目了然，易于管理。
 */

const router = Router();

// 接收外部系统推送新消息的端点
router.post('/push', MessageController.handlePushMessage);

// 客户端获取历史消息的端点
router.get('/history/:key', MessageController.handleGetHistory);

// 客户端建立 SSE 连接的端点
router.get('/sse/:key', MessageController.handleSseConnection);

export default router;
