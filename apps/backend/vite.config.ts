import { defineConfig } from 'vite';
import { resolve } from 'path';

// 核心原则：原子性 - Vite 配置是一个独立的、可重用的构建单元。
// 它只关注如何将后端代码编译成最优的生产代码。
export default defineConfig({
  build: {
    // 启用压缩，以减小生产包的体积。
    minify: true,
    // 配置 Vite 以构建 Node.js 后端应用。
    // 这将生成一个适合在 Node.js 环境中运行的包。
    ssr: true,
    // 指定构建的入口文件
    lib: {
      entry: resolve(__dirname, 'src/server.ts'),
      fileName: 'server',
      formats: ['cjs'] // Node.js 通常使用 CommonJS 模块格式
    },
    rollupOptions: {
      // 外部化依赖，以避免将它们打包到最终的产物中。
      // 这可以显著减小最终文件的大小，并利用运行环境已有的依赖。
      external: ['express', 'dotenv', 'cors']
    }
  }
});
