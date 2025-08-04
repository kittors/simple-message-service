// apps/frontend/src/components/common/Toast.tsx

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

// 定义 Toast 组件的属性接口
export interface ToastProps {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: (id: number) => void;
}

// 定义不同类型 Toast 的图标和样式
const toastConfig = {
  success: {
    Icon: CheckCircle2,
    barClass: 'bg-green-500',
    textClass: 'text-green-700 dark:text-green-300',
  },
  error: {
    Icon: XCircle,
    barClass: 'bg-red-500',
    textClass: 'text-red-700 dark:text-red-300',
  },
  info: {
    Icon: Info,
    barClass: 'bg-blue-500',
    textClass: 'text-blue-700 dark:text-blue-300',
  },
};

/**
 * 核心原则：Toast 原子组件。
 * 这是一个独立的、可复用的 UI 组件，仅负责展示单条 Toast 消息。
 * 它拥有精致的视觉设计，并使用 lucide-react 提供清晰的图标。
 * 动画效果由外部 CSS 控制，实现了样式与行为的分离。
 */
export function Toast({ id, message, type, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const { Icon, barClass, textClass } = toastConfig[type];

  // 封装关闭逻辑，先触发退场动画，动画结束后再从 DOM 中移除
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(id), 500);
  };

  // 设置一个计时器，4秒后自动关闭 Toast
  useEffect(() => {
    const timer = setTimeout(handleDismiss, 4000);
    // 组件卸载时清除计时器，防止内存泄漏
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`relative flex w-full max-w-sm overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-xl mb-4 ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}`}
    >
      {/* 彩色状态条，提供快速的视觉反馈 */}
      <div className={`w-2 ${barClass}`}></div>

      <div className="flex items-center px-4 py-3">
        <Icon className={`w-6 h-6 ${textClass}`} />
        <p className="mx-3 text-sm text-gray-700 dark:text-gray-200">{message}</p>
      </div>

      <button
        onClick={handleDismiss}
        className="absolute top-1 right-1 p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
