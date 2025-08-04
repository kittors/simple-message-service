// apps/frontend/src/App.tsx

import { HomePage } from './pages/HomePage';
import { ToastProvider } from './contexts/ToastContext';

/**
 * 核心原则：应用根。
 * 在应用的顶层包裹 ToastProvider，确保整个应用都能访问 Toast 功能。
 */
function App() {
  return (
    <ToastProvider>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <HomePage />
      </div>
    </ToastProvider>
  );
}

export default App;
