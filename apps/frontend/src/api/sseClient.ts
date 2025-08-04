// apps/frontend/src/api/sseClient.ts

import { config } from '../config';
import { Message } from '../types';

/**
 * 核心原则：SSE 连接原子。
 * 这个模块专门负责管理与后端的 Server-Sent Events (SSE) 连接。
 * 它提供了一个清晰的接口来创建连接、监听消息和处理错误，
 * 将 EventSource 的原生 API 封装成一个更易于在 React 中使用的服务。
 */

// 定义 SSE 事件的回调函数类型
type SseEventCallbacks = {
  onMessage: (message: Message) => void;
  onError: (error: Event) => void;
  onOpen?: () => void;
};

/**
 * 创建并管理一个 SSE 连接。
 * @param key - 用户的唯一密钥。
 * @param callbacks - 包含 onMessage, onError, onOpen 的回调对象。
 * @returns 返回一个包含 close 方法的对象，用于手动关闭连接。
 */
export function createSseConnection(key: string, callbacks: SseEventCallbacks) {
  const { onMessage, onError, onOpen } = callbacks;
  const sse = new EventSource(`${config.apiBaseUrl}/api/sse/${key}`);

  sse.onopen = () => {
    console.log('[SSE] Connection opened.');
    if (onOpen) {
      onOpen();
    }
  };

  sse.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // 后端推送的消息有两种：系统消息和业务消息（带id）
      // 我们只处理包含实际数据的业务消息
      if (data && data.id) {
        onMessage(data as Message);
      }
    } catch (error) {
      console.error('[SSE] Failed to parse message:', error);
    }
  };

  sse.onerror = (error) => {
    console.error('[SSE] Connection error:', error);
    onError(error);
    // EventSource 会在出错后自动尝试重连，这里我们只需上报错误
  };

  return {
    close: () => {
      if (sse && sse.readyState !== EventSource.CLOSED) {
        sse.close();
        console.log('[SSE] Connection closed.');
      }
    },
  };
}
