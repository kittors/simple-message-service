// public/js/organisms.js

import { DOM } from './atoms.js';
import { AppState, validateKey, renderMessage } from './molecules.js';

/**
 * @fileoverview 包含处理核心业务逻辑和 SSE 连接的有机体模块。
 * 职责:
 * - 作为有机体 (Organisms)，将原子和分子组合成复杂的、功能完整的组件。
 * - 封装 SSE 连接的创建、监听和关闭逻辑。
 * - 封装视图切换逻辑。
 */

/**
 * 建立与服务器的 SSE 连接。
 * @param {string} key - 用户的密钥。
 */
export function connectToServerEvents(key) {
    console.log(`[SSE Debug] 正在尝试建立新的 SSE 连接，密钥: ${key}`);

    // 如果已经有连接，先关闭
    if (AppState.sse) {
        AppState.sse.close();
        console.log('[SSE Debug] 现有 SSE 连接已关闭。');
    }

    // 创建一个新的 EventSource 连接
    try {
        AppState.sse = new EventSource(`/api/sse/${key}`);
    } catch (e) {
        console.error('[SSE Debug] EventSource 实例创建失败:', e);
        renderMessage('无法建立连接，请检查密钥或网络状态。');
        return;
    }

    // 监听 'message' 事件，当服务器推送新消息时触发
    AppState.sse.onmessage = (event) => {
        console.log(`[SSE Debug] 接收到原始 SSE 消息: ${event.data}`);
        try {
            const data = JSON.parse(event.data);
            
            console.log('[SSE Debug] 成功解析消息数据:', data);

            // 确保 data 对象中存在 message 属性
            if (data && data.message) {
                // 区分是缓存消息还是实时消息，这有助于调试
                if (data.fromCache) {
                    console.log('[SSE Debug] 接收到来自缓存的消息。');
                } else {
                    console.log('[SSE Debug] 接收到实时推送的新消息。');
                }
                renderMessage(data.message);
                console.log('[SSE Debug] 消息成功渲染到页面。');
            } else {
                console.warn('[SSE Debug] 服务器推送的消息格式不正确或缺少 "message" 字段:', data);
                // 仅在非空消息时才渲染警告，避免覆盖“等待消息”的初始状态
                if (event.data.trim() !== '') {
                     renderMessage('接收到无效消息格式，请检查服务器推送内容。');
                }
            }
        } catch (error) {
            console.error('[SSE Debug] 解析服务器消息失败:', error);
            renderMessage('接收到无效消息格式，请检查服务器推送内容。');
        }
    };

    // 监听 'open' 事件，当连接成功建立时触发
    AppState.sse.onopen = () => {
        console.log('[SSE Debug] SSE 连接已成功建立。');
    };

    // 监听 'error' 事件，处理连接错误
    AppState.sse.onerror = (error) => {
        console.error('[SSE Debug] SSE 连接发生错误:', error);
        // EventSource 会自动尝试重连
        renderMessage('与服务器的连接已断开，正在尝试重连...');
    };
}

/**
 * 关闭当前的 SSE 连接并清理视图。
 */
export function disconnectFromServerEvents() {
    console.log('[SSE Debug] 正在断开 SSE 连接...');
    if (AppState.sse) {
        AppState.sse.close();
        AppState.sse = null;
        console.log('[SSE Debug] SSE 连接已成功关闭。');
    }
    
    // 核心修复：退出登录时，清空消息内容，恢复到初始状态
    renderMessage('');
    console.log('[App Cleanup] 消息框内容已清空。');
}

/**
 * 根据登录状态渲染视图。
 */
export function renderView() {
    const key = localStorage.getItem('user-key');
    console.log(`[App Render] 正在渲染视图，本地密钥: ${key}`);
    
    if (key && validateKey(key)) {
        console.log('[App Render] 检测到有效密钥，渲染消息视图。');
        DOM.loginContainer.classList.add('hidden');
        DOM.messageContainer.classList.remove('hidden');
        connectToServerEvents(key);
    } else {
        console.log('[App Render] 未检测到有效密钥，渲染登录视图。');
        DOM.loginContainer.classList.remove('hidden');
        DOM.messageContainer.classList.add('hidden');
        disconnectFromServerEvents();
    }
}
