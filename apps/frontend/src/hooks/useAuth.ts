// apps/frontend/src/hooks/useAuth.ts

import { useState, useCallback, useEffect } from 'react';

/**
 * 核心原则：认证逻辑原子 Hook。
 * 这个 Hook 封装了所有与用户认证状态相关的逻辑。
 * 它负责处理用户密钥的读取、设置和清除，并与 localStorage 同步。
 * 组件只需调用这个 Hook 即可获得用户的登录状态和操作函数，无需关心实现细节。
 */
export function useAuth() {
  const [userKey, setUserKey] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // 在 Hook 初始化时，尝试从 localStorage 读取已保存的密钥
  useEffect(() => {
    try {
      const storedKey = localStorage.getItem('user-key');
      if (storedKey) {
        setUserKey(storedKey);
      }
    } catch (error) {
      console.error('Failed to access localStorage:', error);
    } finally {
      setIsInitialized(true); // 标记初始化完成
    }
  }, []);

  const login = useCallback((key: string) => {
    if (key) {
      localStorage.setItem('user-key', key);
      setUserKey(key);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user-key');
    setUserKey(null);
  }, []);

  return {
    userKey,
    isLoggedIn: !!userKey,
    isInitialized,
    login,
    logout,
  };
}
