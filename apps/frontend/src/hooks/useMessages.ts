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
  // 新增：管理选中的消息ID
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
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
    setSelectedIds(new Set()); // 重置时清空选中项
    if (sseConnection.current) sseConnection.current.close();
  }, []);

  // 新增：处理消息删除的逻辑
  const deleteMessages = useCallback(async (ids: number[]) => {
    if (!userKey || ids.length === 0) return;

    const success = await apiDeleteMessages(userKey, ids);
    if (success) {
      // 从本地状态中过滤掉已删除的消息
      setMessages((prev) => prev.filter((msg) => !ids.includes(msg.id)));
      // 从选中项中移除已删除的ID
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

  // 新增：处理单个消息的选中状态切换
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
    selectedIds, // 导出选中ID
    loadMoreMessages,
    deleteMessages, // 导出删除函数
    toggleSelection, // 导出切换选中函数
  };
}
