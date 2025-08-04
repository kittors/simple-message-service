// apps/backend/src/services/message.service.ts

import { pool } from '../config/database';
import { Message } from '../models/message.model';
import { config } from '../config/env';

/**
 * 核心原则：业务逻辑原子。
 * 这个服务封装了所有与消息相关的业务逻辑和数据库操作。
 * 它定义了如何创建、查询和删除消息，将业务规则与底层的数据库交互分离开来。
 */

export async function createMessage(key: string, content: string): Promise<Message> {
  const prefixedKey = `${config.APP_KEY_PREFIX}${key}`;
  const query = `
    INSERT INTO messages (client_key, content)
    VALUES ($1, $2)
    RETURNING id, client_key, content, created_at, deleted_at;
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
  // 核心更新：在查询时，只选择 `deleted_at` 字段为 NULL 的消息。
  // 这确保了已逻辑删除的消息不会被返回给前端。
  const query = `
    SELECT id, client_key, content, created_at, deleted_at
    FROM messages
    WHERE client_key = $1 AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT $2
    OFFSET $3;
  `;
  const values = [prefixedKey, limit, offset];

  try {
    const result = await pool.query<Message>(query, values);
    console.log(`[DB] Fetched ${result.rows.length} active messages for key: ${prefixedKey}, page: ${page}`);
    return result.rows;
  } catch (error) {
    console.error(`[DB] Error fetching history for key ${prefixedKey}:`, error);
    throw error;
  }
}

/**
 * 核心更新：将物理删除改为逻辑删除。
 * 此函数不再使用 DELETE 语句，而是使用 UPDATE 语句来设置 `deleted_at` 字段。
 * @param key 客户端密钥，用于验证权限。
 * @param messageIds 要删除的消息ID数组。
 * @returns 返回被标记为删除的消息的数量。
 */
export async function deleteMessages(key: string, messageIds: number[]): Promise<number> {
  const prefixedKey = `${config.APP_KEY_PREFIX}${key}`;
  
  // 使用 UPDATE 将 deleted_at 设置为当前时间，实现逻辑删除。
  // 增加 `AND deleted_at IS NULL` 条件可以防止重复“删除”已经被删除的消息。
  const query = `
    UPDATE messages
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE client_key = $1 AND id = ANY($2::int[]) AND deleted_at IS NULL
    RETURNING id;
  `;
  const values = [prefixedKey, messageIds];

  try {
    const result = await pool.query(query, values);
    console.log(`[DB] Logically deleted ${result.rowCount} messages for key: ${prefixedKey}`);
    return result.rowCount || 0;
  } catch (error) {
    console.error(`[DB] Error logically deleting messages for key ${prefixedKey}:`, error);
    throw error;
  }
}
