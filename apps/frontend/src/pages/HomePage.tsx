// apps/frontend/src/pages/HomePage.tsx

import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMessages } from '../hooks/useMessages';
import { LoginForm } from '../components/auth/LoginForm';
import { MessageList } from '../components/messages/MessageList';
import { BellRing, LogOut, Link, Unlink } from 'lucide-react';

export function HomePage() {
  const { userKey, isLoggedIn, isInitialized, login, logout } = useAuth();
  // 从 useMessages Hook 中获取所有需要的状态和函数
  const { 
    messages, 
    isLoading, 
    hasMore, 
    isConnected, 
    selectedIds,
    loadMoreMessages, 
    deleteMessages,
    toggleSelection
  } = useMessages(userKey);

  useEffect(() => {
    if (isLoggedIn) {
      loadMoreMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  if (!isInitialized) {
    return <div className="text-gray-400">正在初始化...</div>;
  }

  return (
    <>
      {isLoggedIn ? (
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl transition-all duration-300 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h2 className="flex items-center text-2xl font-bold text-gray-900 dark:text-gray-100">
                <BellRing className="w-7 h-7 mr-3 text-indigo-500" />
                消息中心
              </h2>
              <div title={isConnected ? '已连接到消息服务' : '已从消息服务断开'}>
                {isConnected ? (
                  <Link className="w-6 h-6 text-green-500 animate-pulse" />
                ) : (
                  <Unlink className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>
            <button
              onClick={logout} // 退出时，useMessages 的 useEffect 会自动处理清理逻辑
              className="flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出
            </button>
          </div>
          {/* 将所有需要的 props 传递给 MessageList */}
          <MessageList
            messages={messages}
            isLoading={isLoading}
            hasMore={hasMore}
            selectedIds={selectedIds}
            onLoadMore={loadMoreMessages}
            onDelete={deleteMessages}
            onToggleSelection={toggleSelection}
          />
        </div>
      ) : (
        <LoginForm onLogin={login} isLoading={isLoading} />
      )}
    </>
  );
}
