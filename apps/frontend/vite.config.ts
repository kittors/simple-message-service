import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';
import fs from 'fs';

// 核心原则：环境配置的原子化。确保Vite在构建时能正确找到并加载环境变量文件。
export default defineConfig(({ mode }) => {
    // 确保从项目根目录加载正确的环境变量文件
    const envFileName = `.env.${mode}`;
    const rootPath = resolve(__dirname, '../../');
    const envFilePath = resolve(rootPath, envFileName);
    
    if (fs.existsSync(envFilePath)) {
        dotenv.config({ path: envFilePath });
    } else {
        // 如果特定环境文件不存在，则回退到默认的 .env 文件
        dotenv.config({ path: resolve(rootPath, '.env') });
    }

    console.log(`[Vite Config] 当前模式: ${mode}`);
    console.log(`[Vite Config] 正在加载环境变量文件: ${envFilePath}`);
    console.log(`[Vite Config] process.env.VITE_BACKEND_PORT: ${process.env.VITE_BACKEND_PORT}`);
    console.log(`[Vite Config] process.env.VITE_FRONTEND_PORT: ${process.env.VITE_FRONTEND_PORT}`);

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
            outDir: resolve(__dirname, '../../dist/frontend'),
            assetsDir: 'assets',
            sourcemap: true,
            minify: true,
            emptyOutDir: true,
        },
        server: {
            port: parseInt(frontendPort, 10),
            open: true,
        },
        define: {
            'import.meta.env.VITE_BACKEND_PORT': JSON.stringify(backendPort),
        },
    }
});