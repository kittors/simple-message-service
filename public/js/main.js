// public/js/main.js

import { DOM } from './atoms.js';
import { renderView, disconnectFromServerEvents } from './organisms.js';
import { validateKey } from './molecules.js';

/**
 * @fileoverview 应用的入口文件，负责初始化和事件绑定。
 * 职责:
 * - 作为页面 (Pages)，将所有原子、分子和有机体模块连接起来。
 * - 处理用户交互事件，如登录和退出。
 * - 确保应用在页面加载时正确初始化。
 */

/**
 * 初始化主题设置。由于你的 HTML 文件中没有主题切换按钮，
 * 这里只保留了初始化逻辑，以保持可重用性。
 */
function initializeTheme() {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let currentTheme = 'light';
    if (savedTheme) {
        currentTheme = savedTheme;
    } else if (prefersDark) {
        currentTheme = 'dark';
    }

    if (currentTheme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}

// --- 事件监听和初始化 ---

// 登录表单提交事件
DOM.loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const key = DOM.keyInput.value.trim();

    if (validateKey(key)) {
        localStorage.setItem('user-key', key);
        DOM.errorMessage.classList.add('hidden');
        renderView();
    } else {
        DOM.errorMessage.textContent = '密钥不能为空';
        DOM.errorMessage.classList.remove('hidden');
    }
});

// 退出登录事件
DOM.logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user-key');
    DOM.keyInput.value = '';
    renderView();
});

// 页面加载后执行初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    renderView(); // 渲染初始视图
    // 确保 Lucide Icons 能够被正确渲染
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});