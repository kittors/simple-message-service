// apps/frontend/src/components/auth/LoginForm.tsx

import React, { useState } from 'react';

/**
 * 核心原则：登录表单分子。
 * 这是一个独立的、自包含的表单组件。它管理自己的内部状态（输入框的值、错误信息），
 * 并通过 `onLogin` 回调将最终的用户输入（key）传递给父组件。
 * 这种设计使得它可以在任何需要登录功能的地方被复用。
 */

interface LoginFormProps {
  onLogin: (key: string) => void;
  isLoading: boolean;
}

export function LoginForm({ onLogin, isLoading }: LoginFormProps) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onLogin(key.trim());
      setError('');
    } else {
      setError('密钥不能为空');
    }
  };

  return (
    <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl transition-all duration-300">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">请输入密钥</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="输入您的密钥..."
          disabled={isLoading}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50"
        />
        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {isLoading ? '验证中...' : '解锁'}
        </button>
      </form>
    </div>
  );
}
