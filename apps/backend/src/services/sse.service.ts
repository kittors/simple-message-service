// apps/backend/src/services/sse.service.ts

import { Response } from 'express';
import { config } from '../config/env';

/**
 * 核心原则：SSE服务原子。
 * 这个服务封装了所有与 Server-Sent Events (SSE) 连接管理相关的逻辑。
 * 它维护着活跃客户端的列表，并提供了推送消息的核心功能。
 * 它不关心消息的来源或存储，只负责“推送”。
 */

// 存储活跃的 SSE 连接
const clients = new Map<string, Response>();

/**
 * 建立一个新的 SSE 连接并将其存储起来。
 * @param key 客户端的唯一标识符。
 * @param res Express 的 Response 对象。
 */
export function addClient(key: string, res: Response) {
  const prefixedKey = `${config.APP_KEY_PREFIX}${key}`;
  clients.set(prefixedKey, res);
  console.log(`[SSE] New client connected: ${prefixedKey}. Total clients: ${clients.size}`);

  res.on('close', () => {
    clients.delete(prefixedKey);
    console.log(`[SSE] Client disconnected: ${prefixedKey}. Total clients: ${clients.size}`);
  });
}

/**
 * 向指定的客户端推送消息。
 * @param key 客户端的唯一标识符（不带前缀）。
 * @param message 要推送的消息对象。
 */
export function pushMessageToClient(key: string, message: any) {
  const prefixedKey = `${config.APP_KEY_PREFIX}${key}`;
  const client = clients.get(prefixedKey);

  if (client) {
    const sseMessage = `data: ${JSON.stringify(message)}\n\n`;
    client.write(sseMessage);
    console.log(`[SSE] Pushed message to client: ${prefixedKey}`);
  } else {
    console.log(`[SSE] Client not found for key: ${prefixedKey}. Message not pushed.`);
  }
}
