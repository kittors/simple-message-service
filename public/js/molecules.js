// public/js/molecules.js

/**
 * @fileoverview 包含应用的状态管理和通用工具函数。
 * 职责:
 * - 作为分子 (Molecules)，管理全局应用状态，如 SSE 连接实例。
 * - 提供可重用的工具函数，例如密钥验证。
 */

// 核心修复：从 atoms.js 导入 DOM 对象
import { DOM } from './atoms.js';

/**
 * 管理应用的全局状态。
 * @type {{sse: EventSource | null}}
 */
export const AppState = {
    sse: null // SSE 连接实例
};

/**
 * 验证用户输入的密钥是否有效。
 * @param {string} key - 用户输入的密钥。
 * @returns {boolean} - 密钥是否有效。
 */
export function validateKey(key) {
    return key && key.trim() !== '';
}

/**
 * 渲染消息到消息框中。
 * @param {string} message - 要显示的消息内容。
 */
export function renderMessage(message) {
    const { messageBox } = DOM;
    if (message) {
        messageBox.innerHTML = `
            <p class="text-lg md:text-xl font-medium leading-relaxed whitespace-pre-wrap">${message}</p>
        `;
    } else {
        messageBox.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400">等待第一条消息...</p>`;
    }
    // 确保滚动条自动定位到最底部
    messageBox.scrollTop = messageBox.scrollHeight;
}