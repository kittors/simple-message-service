// apps/frontend/src/components/messages/MessageList.tsx

import React, { useRef, useCallback } from 'react';
import { Message } from '../../types';
import { MessageItem } from './MessageItem';
import { Trash2 } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  hasMore: boolean;
  isLoading: boolean;
  selectedIds: Set<number>;
  latestSseMessageId: number | null; // 新增：接收最新消息ID
  onLoadMore: () => void;
  onDelete: (ids: number[]) => void;
  onToggleSelection: (id: number) => void;
}

export function MessageList({ 
  messages, 
  hasMore, 
  isLoading, 
  selectedIds,
  latestSseMessageId, // 接收
  onLoadMore, 
  onDelete,
  onToggleSelection
}: MessageListProps) {
  const observer = useRef<IntersectionObserver>();
  
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

  const handleDeleteSelected = () => {
    if (selectedIds.size > 0) {
      onDelete(Array.from(selectedIds));
    }
  };
  
  return (
    <div className="flex flex-col h-[32rem]">
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-600">
        <span className="text-sm text-gray-500">
          已选中 {selectedIds.size} / {messages.length} 项
        </span>
        <button
          onClick={handleDeleteSelected}
          disabled={selectedIds.size === 0}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-100 dark:bg-red-900/50 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 size={14} />
          删除选中
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-800 p-2">
        {messages.map(msg => (
          <MessageItem 
            key={msg.id} 
            message={msg}
            isSelected={selectedIds.has(msg.id)}
            isLatest={msg.id === latestSseMessageId} // 新增：判断是否为最新消息
            onToggleSelection={onToggleSelection}
            onDelete={() => onDelete([msg.id])}
          />
        ))}

        {!isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-gray-500">暂无消息，等待推送...</p>
          </div>
        )}
        
        <div ref={loaderRef} className="text-center p-4 text-gray-500 h-10">
          {isLoading && '加载中...'}
          {!isLoading && !hasMore && messages.length > 0 && '没有更多消息了'}
        </div>
      </div>
    </div>
  );
}
