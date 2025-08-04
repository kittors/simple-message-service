// apps/frontend/src/components/messages/MessageItem.tsx

import React from 'react';
import { Message } from '../../types';
import { Trash2 } from 'lucide-react';

/**
 * 核心原则：消息项原子。
 * 这是 UI 中最小的可复用单元之一。它只接收一个 `message` 对象，
 * 并负责将其以固定的格式渲染出来。它现在还包含交互元素（复选框和删除按钮），
 * 并通过回调函数将用户的操作（选中、删除）通知给父组件。
 */

interface MessageItemProps {
  message: Message;
  isSelected: boolean;
  onToggleSelection: (id: number) => void;
  onDelete: (id: number) => void;
}

export function MessageItem({ message, isSelected, onToggleSelection, onDelete }: MessageItemProps) {
  return (
    <div 
      className={`flex items-start gap-4 p-4 mb-3 rounded-lg shadow-sm transition-colors duration-200 animate-fade-in ${
        isSelected ? 'bg-indigo-50 dark:bg-indigo-900/50' : 'bg-gray-50 dark:bg-gray-700'
      }`}
    >
      {/* 复选框 */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelection(message.id)}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
      />
      {/* 消息内容 */}
      <div className="flex-1">
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{message.content}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
          {new Date(message.created_at).toLocaleString()}
        </p>
      </div>
      {/* 删除按钮 */}
      <button
        onClick={() => onDelete(message.id)}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors duration-200"
        aria-label="删除消息"
        title="删除消息"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
