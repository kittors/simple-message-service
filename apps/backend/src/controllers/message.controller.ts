// apps/backend/src/controllers/message.controller.ts

import { Request, Response } from 'express';
import * as MessageService from '../services/message.service';
import * as SseService from '../services/sse.service';
import { sendSuccess, sendError } from '../utils/response';
import { config } from '../config/env';

/**
 * 核心原则：控制层原子。
 * 控制器是API请求的直接处理者。它的职责是：
 * 1. 解析请求（参数、body）。
 * 2. 调用相应的服务层函数来执行业务逻辑。
 * 3. 使用标准化的响应工具来发送HTTP响应。
 * 它充当了HTTP世界和内部业务逻辑之间的桥梁。
 */

export async function handlePushMessage(req: Request, res: Response) {
  const { key, message } = req.body;

  if (!key || !message) {
    return sendError(res, 'Key and message are required.', 400);
  }

  try {
    const newMessage = await MessageService.createMessage(key, message);
    SseService.pushMessageToClient(key, newMessage);
    sendSuccess(res, { message: 'Message pushed and saved.' }, 'Message processed successfully', 201);
  } catch (error) {
    console.error('Error handling push message:', error);
    sendError(res, 'Failed to process message.');
  }
}

export async function handleGetHistory(req: Request, res: Response) {
  const { key } = req.params;
  // 从查询参数获取分页信息，并提供默认值
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;

  if (!key) {
    return sendError(res, 'Key is required.', 400);
  }

  try {
    const history = await MessageService.getMessageHistory(key, page, limit);
    sendSuccess(res, history);
  } catch (error) {
    console.error('Error fetching message history:', error);
    sendError(res, 'Failed to fetch message history.');
  }
}

export function handleSseConnection(req: Request, res: Response) {
  const { key } = req.params;
  if (!key) {
    // 对于SSE连接，我们不能发送JSON错误，只能直接关闭
    return res.end();
  }

  // 设置 SSE 头部
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*'); // 允许跨域

  // 立即发送一个心跳或欢迎消息，确认连接成功
  res.write(`data: ${JSON.stringify({ type: 'system', content: 'Connection established' })}\n\n`);

  SseService.addClient(key, res);
}
