// public/js/atoms.js

/**
 * @fileoverview 定义应用中所有需要交互的 DOM 元素。
 * 职责:
 * - 作为原子 (Atoms)，提供一个集中的、可维护的 DOM 元素引用列表。
 * - 确保所有组件都能通过单一来源访问到 DOM 元素，避免重复的 document.getElementById。
 */

export const DOM = {
    loginContainer: document.getElementById('login-container'),
    loginForm: document.getElementById('login-form'),
    keyInput: document.getElementById('key-input'),
    errorMessage: document.getElementById('error-message'),
    messageContainer: document.getElementById('message-container'),
    messageBox: document.getElementById('message-box'),
    logoutBtn: document.getElementById('logout-btn')
};