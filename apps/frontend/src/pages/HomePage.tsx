// apps/frontend/src/pages/HomePage.tsx

import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMessages } from '../hooks/useMessages';
import { LoginForm } from '../components/auth/LoginForm';
import { MessageList } from '../components/messages/MessageList';
// 核心更新：引入 Link 和 Unlink 图标
import { BellRing, LogOut, Link, Unlink } from 'lucide-react';

/**
 * 核心原则：页面级组件/模板。
 * HomePage 是一个页面级的容器组件，它的职责是“编排”和“组织”。它负责：
 * 1. 调用自定义 Hooks (`useAuth`, `useMessages`) 来获取状态和逻辑。
 * 2. 根据认证状态 (`isLoggedIn`) 决定渲染哪个视图（登录表单或消息列表）。
 * 3. 将从 Hooks 获取的数据和函数传递给相应的子组件。
 * 它本身不包含复杂的业务逻辑，只是将各个独立的“分子”和“原子”组件组合在一起，构成一个完整的页面。
 */
export function HomePage() {
  const { userKey, isLoggedIn, isInitialized, login, logout } = useAuth();
  // 核心更新：从 useMessages 中获取 isConnected 状态
  const { messages, isLoading, hasMore, isConnected, loadMoreMessages, resetMessages } = useMessages(userKey);

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
            {/* 将标题和图标组合在一起 */}
            <div className="flex items-center gap-4">
              <h2 className="flex items-center text-2xl font-bold text-gray-900 dark:text-gray-100">
                <BellRing className="w-7 h-7 mr-3 text-indigo-500" />
                消息中心
              </h2>
              {/* 核心更新：根据 isConnected 状态显示不同的图标 */}
              <div title={isConnected ? '已连接到消息服务' : '已从消息服务断开'}>
                {isConnected ? (
                  <Link className="w-6 h-6 text-green-500 animate-pulse" />
                ) : (
                  <Unlink className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                resetMessages();
              }}
              className="flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出
            </button>
          </div>
          <MessageList
            messages={messages}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={loadMoreMessages}
          />
        </div>
      ) : (
        <LoginForm onLogin={login} isLoading={isLoading} />
      )}
    </>
  );
}
