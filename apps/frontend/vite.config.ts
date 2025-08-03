import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';
import fs from 'fs';

// 核心原则：原子性 - Vite 配置是一个独立的、可重用的构建单元。
// 它只关注如何将前端代码编译成最优的生产代码，并提供开发服务器。
export default defineConfig(({ mode }) => {
    // 关键修复：直接使用 dotenv 加载根目录下的 .env 文件。
    // 这是一种更可靠的方式，可以绕过 Vite 在 monorepo 中的路径解析问题。
    // 动态确定 .env 文件名，优先使用 .env.dev
    const envFileName = mode === 'development' ? '.env.dev' : `.env.${mode}`;
    const rootPath = resolve(__dirname, '../../');
    const envFilePath = resolve(rootPath, envFileName);
    
    // 检查文件是否存在，如果不存在则加载默认的 .env 文件
    // fs.existsSync 是一个 Node.js 内置函数，用于检查文件是否存在
    if (fs.existsSync(envFilePath)) {
        dotenv.config({ path: envFilePath });
    } else {
        dotenv.config({ path: resolve(rootPath, '.env') });
    }

    // 调试日志：打印加载的环境变量，方便你确认是否正确读取。
    // 这里我们直接从 process.env 中获取，因为 dotenv 已经将它们加载到这里。
    console.log(`[Vite Config] 当前模式: ${mode}`);
    console.log(`[Vite Config] 正在加载环境变量文件: ${envFilePath}`);
    console.log(`[Vite Config] process.env.VITE_BACKEND_PORT: ${process.env.VITE_BACKEND_PORT}`);
    console.log(`[Vite Config] process.env.VITE_FRONTEND_PORT: ${process.env.VITE_FRONTEND_PORT}`);

    // 使用 process.env 而不是 loadEnv 的结果，因为我们已通过 dotenv 加载
    const backendPort = process.env.VITE_BACKEND_PORT || '3001';
    const frontendPort = process.env.VITE_FRONTEND_PORT || '3000';

    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src')
            }
        },
        build: {
            outDir: 'dist',
            assetsDir: 'assets',
            sourcemap: true,
            minify: true,
        },
        server: {
            // 从环境变量中读取前端端口，并确保它是数字类型。
            port: parseInt(frontendPort, 10),
            open: true,
        },
        // 关键修复：使用 define 选项将环境变量注入到全局范围。
        // 这是在前端代码中通过 import.meta.env 访问环境变量的唯一可靠方式。
        // JSON.stringify() 是必要的，因为它将值转换为一个字符串字面量，
        // 这样代码在被编译后才能正常工作。
        define: {
            'import.meta.env.VITE_BACKEND_PORT': JSON.stringify(backendPort),
        },
    }
});

