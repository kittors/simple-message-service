// apps/frontend/src/hooks/useMessages.ts

import { useState, useCallback, useRef, useEffect } from 'react';
import { getMessageHistory, deleteMessages as apiDeleteMessages } from '../api/apiClient';
import { createSseConnection } from '../api/sseClient';
import { Message } from '../types';
import { useToast } from './useToast';

export function useMessages(userKey: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  // 新增：用于追踪最新实时消息的ID，以实现“新消息”提示。
  const [latestSseMessageId, setLatestSseMessageId] = useState<number | null>(null);
  const sseConnection = useRef<{ close: () => void } | null>(null);
  const { showToast } = useToast();

  const loadMoreMessages = useCallback(async () => {
    if (isLoading || !hasMore || !userKey) return;
    setIsLoading(true);
    try {
      const newMessages = await getMessageHistory(userKey, page);
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
    setIsConnected(false);
    setSelectedIds(new Set());
    setLatestSseMessageId(null); // 重置时清空最新消息ID
    if (sseConnection.current) sseConnection.current.close();
  }, []);

  const deleteMessages = useCallback(async (ids: number[]) => {
    if (!userKey || ids.length === 0) return;

    const success = await apiDeleteMessages(userKey, ids);
    if (success) {
      setMessages((prev) => prev.filter((msg) => !ids.includes(msg.id)));
      setSelectedIds((prev) => {
        const newSelected = new Set(prev);
        ids.forEach(id => newSelected.delete(id));
        return newSelected;
      });
      showToast(`${ids.length}条消息已删除`, 'success');
    } else {
      showToast('删除失败，请稍后重试', 'error');
    }
  }, [userKey, showToast]);

  const toggleSelection = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  }, []);

  useEffect(() => {
    if (userKey) {
      resetMessages();
      sseConnection.current = createSseConnection(userKey, {
        onMessage: (newMessage) => {
          setMessages((prev) => [newMessage, ...prev]);
          // 核心更新：当收到新消息时，更新其ID为“最新”
          setLatestSseMessageId(newMessage.id);
          showToast('收到一条新消息', 'success');
        },
        onError: () => {
          setIsConnected(false);
          showToast('与服务器的连接中断', 'error');
        },
        onOpen: () => setIsConnected(true),
      });
    } else {
      resetMessages();
    }
    return () => {
      if (sseConnection.current) sseConnection.current.close();
      setIsConnected(false);
    };
  }, [userKey, resetMessages, showToast]);

  return {
    messages,
    isLoading,
    hasMore,
    isConnected,
    selectedIds,
    latestSseMessageId, // 导出最新消息ID
    loadMoreMessages,
    deleteMessages,
    toggleSelection,
  };
}
