// apps/frontend/src/components/messages/MessageList.tsx

import React, { useRef, useCallback } from 'react';
import { Message } from '../../types';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function MessageList({ messages, hasMore, isLoading, onLoadMore }: MessageListProps) {
  const observer = useRef<IntersectionObserver>();
  const listRef = useRef<HTMLDivElement>(null);

  // 核心修正：懒加载的触发器现在位于列表底部。
  const loaderRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, onLoadMore]);

  // 核心修正：移除了 useLayoutEffect 和相关的 scrollHeightBeforeLoad 逻辑，
  // 因为现在是标准的向下滚动加载模式，不再需要手动校正滚动位置。
  
  return (
    // 核心修正：移除了 `flex-col-reverse`，恢复为标准的从上到下的块级布局。
    // 这确保了列表在加载时默认滚动条在顶部。
    <div ref={listRef} className="w-full h-96 overflow-y-auto bg-gray-100 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-600">
      {/* 渲染消息列表 */}
      <div>
        {messages.map(msg => <MessageItem key={msg.id} message={msg} />)}
      </div>

      {/* 空状态显示 */}
      {!isLoading && messages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-center text-gray-500">暂无消息，等待推送...</p>
        </div>
      )}
      
      {/* 核心修正：加载触发器和状态显示移到了列表底部。 */}
      <div ref={loaderRef} className="text-center p-4 text-gray-500">
        {isLoading && '加载中...'}
        {!isLoading && !hasMore && messages.length > 0 && '没有更多消息了'}
      </div>
    </div>
  );
}
