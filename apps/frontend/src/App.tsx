// src/App.tsx

import { useState, useEffect, useRef } from 'react';

// 核心原则：原子性 - 登录表单作为一个独立的、可重用的组件
const LoginForm = ({ onLogin }: { onLogin: (key: string) => void }) => {
  const [key, setKey] = useState<string>('');
  const [error, setError] = useState<string>('');

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
          placeholder="输入密钥..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
        />
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        <button
          type="submit"
          className="mt-4 w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          解锁
        </button>
      </form>
    </div>
  );
};

// 核心原则：原子性 - 消息显示组件
const MessageDisplay = ({ message }: { message: string | null }) => (
  <div
    className="max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 flex flex-col justify-start"
    style={{ scrollbarWidth: 'thin', scrollbarColor: '#9ca3af #e5e7eb' }}
  >
    {message ? (
      <p className="text-lg md:text-xl font-medium leading-relaxed whitespace-pre-wrap text-gray-900 dark:text-gray-100">{message}</p>
    ) : (
      <p className="text-center text-gray-500 dark:text-gray-400">等待第一条消息...</p>
    )}
  </div>
);

// 核心原则：分子 - 消息容器，组合了消息显示组件和退出按钮
const MessageContainer = ({ message, onLogout }: { message: string | null; onLogout: () => void }) => (
  <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl transition-all duration-300">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold flex items-center text-gray-900 dark:text-gray-100">
        {/* 使用 SVG 图标，符合原子设计原则的图标原子 */}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell-ring mr-2 text-indigo-500">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
          <path d="M18.4 12.9a1.06 1.06 0 0 1 .6 1.1c.3 1.1.9 2.2 1.8 3.3"></path>
          <path d="M5.6 12.9a1.06 1.06 0 0 0-.6 1.1c-.3 1.1-.9 2.2-1.8 3.3"></path>
        </svg>
        最新消息
      </h2>
      <button
        onClick={onLogout}
        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        退出登录
      </button>
    </div>
    <MessageDisplay message={message} />
  </div>
);

// 核心原则：有机体 - App 组件，组合所有分子和原子，管理全局状态和逻辑
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const sseRef = useRef<EventSource | null>(null);

  // 关键修复：直接从 import.meta.env 获取环境变量，因为我们已在 vite.config.ts 中进行了注入
  const backendPort = import.meta.env.VITE_BACKEND_PORT || '3001';
  console.log('当前后端端口：', backendPort);

  // 连接 SSE 的逻辑
  const connectToServerEvents = (key: string) => {
    // 如果已经有连接，先关闭
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }

    try {
      const sse = new EventSource(`http://localhost:${backendPort}/api/sse/${key}`);
      sseRef.current = sse;

      sse.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.message) {
            setMessage(data.message);
          }
        } catch (error) {
          console.error('解析服务器消息失败:', error);
        }
      };

      sse.onerror = (error) => {
        console.error('SSE 连接发生错误:', error);
        // 如果连接断开，尝试重连或显示错误消息
        setMessage('与服务器的连接已断开，正在尝试重连...');
      };
    } catch (e) {
      console.error('EventSource 实例创建失败:', e);
      setMessage('无法建立连接，请检查密钥或网络状态。');
    }
  };

  // 处理登录
  const handleLogin = (key: string) => {
    localStorage.setItem('user-key', key);
    setIsLoggedIn(true);
    connectToServerEvents(key);
  };

  // 处理退出登录
  const handleLogout = () => {
    localStorage.removeItem('user-key');
    setIsLoggedIn(false);
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
    setMessage(null);
  };

  useEffect(() => {
    const key = localStorage.getItem('user-key');
    if (key) {
      setIsLoggedIn(true);
      connectToServerEvents(key);
    } else {
      setIsLoggedIn(false);
    }

    // 在组件卸载时关闭连接
    return () => {
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {!isLoggedIn ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <MessageContainer message={message} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;

