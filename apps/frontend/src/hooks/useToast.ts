// apps/frontend/src/hooks/useToast.ts

import { useContext } from 'react';
import { ToastContext } from '../contexts/ToastContext';

/**
 * 核心原则：自定义 Hook。
 * 封装了对 ToastContext 的访问，提供了一个简洁的 API。
 * 组件只需调用 `useToast()` 即可获取 `showToast` 方法。
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
