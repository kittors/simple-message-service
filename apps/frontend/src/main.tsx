import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 核心原则：原子性 - main.tsx 是 React 应用的最小启动单元。
// 它只负责将根组件 App 渲染到 DOM 中。
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
