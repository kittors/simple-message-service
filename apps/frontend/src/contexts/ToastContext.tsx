// apps/frontend/src/contexts/ToastContext.tsx

import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastProps } from '../components/common/Toast';

// 定义触发 Toast 的选项
type ToastOptions = Omit<ToastProps, 'id' | 'onDismiss'>;

// 定义 Context 的类型
interface ToastContextType {
  showToast: (message: string, type: ToastOptions['type']) => void;
}

// 创建 Toast Context
export const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0; // 用于生成唯一的 Toast ID

/**
 * 核心原则：Toast Provider。
 * 这是一个全局状态管理器，负责维护所有活动的 Toast 通知。
 * 它通过 Context 向其所有子组件暴露一个 `showToast` 方法，
 * 允许应用中的任何位置都能方便地触发通知。
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  // 使用 useCallback 优化，确保 showToast 函数的引用稳定
  const showToast = useCallback((message: string, type: ToastOptions['type']) => {
    const newToast: ToastProps = {
      id: toastId++,
      message,
      type,
      onDismiss: (id) => {
        setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
      },
    };
    // 将新的 Toast 添加到列表顶部
    setToasts((currentToasts) => [newToast, ...currentToasts]);
  }, []);

  const handleDismiss = (id: number) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast 容器，固定在屏幕右上角 */}
      <div className="fixed top-5 right-5 z-50 w-full max-w-xs">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={handleDismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
