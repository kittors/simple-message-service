// apps/backend/src/services/message.service.ts

import { pool } from '../config/database';
import { Message } from '../models/message.model';
import { config } from '../config/env';

/**
 * 核心原则：业务逻辑原子。
 * 这个服务封装了所有与消息相关的业务逻辑和数据库操作。
 * 它定义了如何创建消息、如何查询历史消息，将业务规则与底层的数据库交互分离开来。
 */

/**
 * 创建一条新消息并将其存入数据库。
 * @param key 客户端密钥。
 * @param content 消息内容。
 * @returns 创建的消息对象。
 */
export async function createMessage(key: string, content: string): Promise<Message> {
  const prefixedKey = `${config.APP_KEY_PREFIX}${key}`;
  const query = `
    INSERT INTO messages (client_key, content)
    VALUES ($1, $2)
    RETURNING id, client_key, content, created_at;
  `;
  const values = [prefixedKey, content];
  
  try {
    const result = await pool.query<Message>(query, values);
    console.log(`[DB] Message saved for key: ${prefixedKey}`);
    return result.rows[0];
  } catch (error) {
    console.error(`[DB] Error saving message for key ${prefixedKey}:`, error);
    throw error;
  }
}

/**
 * 分页查询指定 key 的历史消息。
 * @param key 客户端密钥。
 * @param page 页码 (从 1 开始)。
 * @param limit 每页数量。
 * @returns 消息数组。
 */
export async function getMessageHistory(key: string, page: number, limit: number): Promise<Message[]> {
  const prefixedKey = `${config.APP_KEY_PREFIX}${key}`;
  const offset = (page - 1) * limit;
  const query = `
    SELECT id, client_key, content, created_at
    FROM messages
    WHERE client_key = $1
    ORDER BY created_at DESC
    LIMIT $2
    OFFSET $3;
  `;
  const values = [prefixedKey, limit, offset];

  try {
    const result = await pool.query<Message>(query, values);
    console.log(`[DB] Fetched ${result.rows.length} messages for key: ${prefixedKey}, page: ${page}`);
    return result.rows;
  } catch (error) {
    console.error(`[DB] Error fetching history for key ${prefixedKey}:`, error);
    throw error;
  }
}
