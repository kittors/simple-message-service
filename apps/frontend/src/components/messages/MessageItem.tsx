// apps/frontend/src/components/messages/MessageItem.tsx

import React from 'react';
import { Message } from '../../types';
import { Trash2, Sparkles } from 'lucide-react'; // 引入新图标

/**
 * 核心原则：消息项原子。
 * 该组件负责展示单条消息的所有视觉元素和交互。
 * 新增功能：
 * 1. 语法高亮：通过一个内部辅助函数，为数字和字母应用不同的颜色。
 * 2. “新消息”提示：根据传入的 `isLatest` 属性，显示一个特殊的图标。
 */

interface MessageItemProps {
  message: Message;
  isSelected: boolean;
  isLatest: boolean; // 新增：接收是否为最新消息的标志
  onToggleSelection: (id: number) => void;
  onDelete: (id: number) => void;
}

// 辅助函数：用于解析文本并返回带高亮的JSX元素
const renderHighlightedContent = (content: string) => {
  // 使用正则表达式将字符串分割成不同类型的部分（字母、数字、其他）
  const parts = content.match(/([a-zA-Z]+)|([0-9]+)|([\u4e00-\u9fa5]+)|(.)/g) || [];
  
  return parts.map((part, index) => {
    // 为数字应用特殊样式
    if (/^[0-9]+$/.test(part)) {
      return <span key={index} className="text-sky-500 dark:text-sky-400 font-medium">{part}</span>;
    }
    // 为英文字母应用特殊样式
    if (/^[a-zA-Z]+$/.test(part)) {
      return <span key={index} className="text-emerald-500 dark:text-emerald-400 font-medium">{part}</span>;
    }
    // 中文和其他所有字符使用默认样式
    return <span key={index}>{part}</span>;
  });
};

export function MessageItem({ message, isSelected, isLatest, onToggleSelection, onDelete }: MessageItemProps) {
  return (
    <div 
      className={`flex items-start gap-4 p-4 mb-3 rounded-lg shadow-sm transition-colors duration-200 animate-fade-in ${
        isSelected ? 'bg-indigo-50 dark:bg-indigo-900/50' : 'bg-gray-50 dark:bg-gray-700'
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelection(message.id)}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
      />
      <div className="flex-1">
        {/* 使用高亮函数渲染消息内容 */}
        <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {renderHighlightedContent(message.content)}
        </div>
        {/* 底部信息区域，包含“新消息”提示和时间戳 */}
        <div className="flex justify-end items-center gap-3 mt-2">
          {isLatest && (
            <span className="flex items-center gap-1.5 text-xs text-amber-500 dark:text-amber-400 animate-pulse" title="最新消息">
              <Sparkles size={14} />
              New
            </span>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(message.created_at).toLocaleString()}
          </p>
        </div>
      </div>
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
