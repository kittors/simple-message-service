// apps/frontend/src/hooks/useMessages.ts

import { useState, useCallback, useRef, useEffect } from 'react';
import { getMessageHistory } from '../api/apiClient';
import { createSseConnection } from '../api/sseClient';
import { Message } from '../types';
import { useToast } from './useToast';

/**
 * 核心原则：消息流管理的原子 Hook。
 * 这个 Hook 封装了所有与消息列表相关的逻辑，包括：
 * 1. 通过 HTTP 拉取历史消息（分页加载）。
 * 2. 通过 SSE 接收实时消息。
 * 3. 管理加载状态、分页、连接状态等。
 * 4. 将所有这些复杂性抽象为一个简洁的接口。
 *
 * @param userKey 用户的唯一密钥，为 null 时将重置并断开连接。
 * @returns 返回一个包含消息数据和操作函数的状态对象。
 */
export function useMessages(userKey: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  // 新增：用于跟踪 SSE 连接状态的 state
  const [isConnected, setIsConnected] = useState(false);
  const sseConnection = useRef<{ close: () => void } | null>(null);
  const { showToast } = useToast();

  const loadMoreMessages = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const newMessages = await getMessageHistory(userKey!, page);
      if (newMessages.length > 0) {
        setMessages((prev) => [...prev, ...newMessages]);
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userKey, page, isLoading, hasMore]);

  const resetMessages = useCallback(() => {
    setMessages([]);
    setPage(1);
    setHasMore(true);
    // 状态重置时，也将连接状态设为 false
    setIsConnected(false);
    if (sseConnection.current) {
      sseConnection.current.close();
      sseConnection.current = null;
    }
  }, []);

  useEffect(() => {
    if (userKey) {
      // 在建立新连接前，先重置所有状态
      resetMessages();

      sseConnection.current = createSseConnection(userKey, {
        onMessage: (newMessage) => {
          setMessages((prev) => [newMessage, ...prev]);
          showToast('收到一条新消息', 'success');
        },
        onError: () => {
          // 连接出错时，更新状态并提示用户
          setIsConnected(false);
          showToast('与服务器的连接中断', 'error');
        },
        onOpen: () => {
          // 连接成功时，只更新状态，不再弹出 toast
          setIsConnected(true);
        }
      });
    } else {
      // 如果 userKey 不存在（例如退出登录），则重置状态
      resetMessages();
    }

    // 组件卸载或 userKey 改变时，执行清理操作
    return () => {
      if (sseConnection.current) {
        sseConnection.current.close();
        // 清理时也更新连接状态
        setIsConnected(false);
      }
    };
  }, [userKey, resetMessages, showToast]);

  return {
    messages,
    isLoading,
    hasMore,
    isConnected,
    loadMoreMessages,
    resetMessages,
  };
}
