// apps/frontend/src/components/messages/MessageItem.tsx

import React from 'react';
import { Message } from '../../types';

/**
 * 核心原则：消息项原子。
 * 这是 UI 中最小的可复用单元之一。它只接收一个 `message` 对象，
 * 并负责将其以固定的格式渲染出来。它不关心消息来自哪里，也不关心点击事件。
 * 它的唯一职责就是“展示”。
 */

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  return (
    <div className="p-4 mb-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm animate-fade-in">
      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{message.content}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
        {new Date(message.created_at).toLocaleString()}
      </p>
    </div>
  );
}
