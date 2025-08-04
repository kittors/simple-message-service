// apps/frontend/src/api/apiClient.ts

import { config } from '../config';
import { ApiResponse, Message } from '../types';

/**
 * 核心原则：API 服务原子。
 * 这个模块封装了所有基于 HTTP (fetch) 的 API 请求。
 * 将所有 fetch 调用集中在这里，可以方便地进行统一的错误处理、头部设置或日志记录。
 * 它将“如何获取数据”的实现细节与使用数据的业务逻辑分离开来。
 */

/**
 * 分页获取指定 key 的历史消息。
 * @param key - 用户的唯一密钥。
 * @param page - 要获取的页码。
 * @param limit - 每页的消息数量。
 * @returns 一个包含消息数组的 Promise。
 */
export async function getMessageHistory(key: string, page: number, limit: number = 10): Promise<Message[]> {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/history/${key}?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Message[]> = await response.json();

    if (result.success && result.code === 200 && Array.isArray(result.data)) {
      return result.data;
    } else {
      console.error('API returned a business error:', result.message, `(code: ${result.code})`);
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch message history:', error);
    return [];
  }
}

/**
 * 新增：删除一条或多条消息。
 * @param key - 用户的唯一密钥。
 * @param ids - 要删除的消息 ID 数组。
 * @returns 返回一个布尔值，表示操作是否成功。
 */
export async function deleteMessages(key: string, ids: number[]): Promise<boolean> {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/messages/${key}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      // 对于删除操作，即使是 404 (Not Found) 也可能是业务逻辑的一部分（例如消息已被删除），
      // 所以我们主要依赖业务层返回的 success 字段。但其他网络错误需要抛出。
      if (response.status !== 404) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const result: ApiResponse<{ deletedCount: number }> = await response.json();

    // 只要业务层返回 success: true，就认为操作成功。
    return result.success;

  } catch (error) {
    console.error('Failed to delete messages:', error);
    return false; // 返回 false 表示删除失败
  }
}
