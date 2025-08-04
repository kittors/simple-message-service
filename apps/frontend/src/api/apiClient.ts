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
    
    // 即使 HTTP 状态码是 2xx，我们依然要检查业务层是否成功。
    if (!response.ok) {
      // 网络层面的错误，例如 500 Internal Server Error
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Message[]> = await response.json();

    // 核心更新：现在同时检查业务成功状态 `success: true` 和成功的业务码 `code: 200`
    if (result.success && result.code === 200 && Array.isArray(result.data)) {
      return result.data;
    } else {
      // API 返回了业务错误，例如参数错误等。
      console.error('API returned a business error:', result.message, `(code: ${result.code})`);
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch message history:', error);
    // 在生产环境中，这里可以连接到一个错误上报服务
    return []; // 返回空数组以防止UI崩溃
  }
}
