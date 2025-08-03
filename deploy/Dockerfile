# deploy/Dockerfile

# 第一阶段：基础环境，用于安装生产工具，例如PM2
FROM node:18-alpine AS production-base

# 设置工作目录
WORKDIR /app

# 安装 PM2，用于在生产环境中管理Node.js进程
RUN npm install -g pm2

# 第二阶段：生产镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 从第一阶段复制PM2
COPY --from=production-base /usr/local/bin/pm2 /usr/local/bin/pm2
COPY --from=production-base /usr/local/lib/node_modules/pm2 /usr/local/lib/node_modules/pm2

# 复制已构建的应用程序和依赖
# 核心原则：只复制最终的、自包含的原子部署单元
# 注意：由于此 Dockerfile 最终位于 dist 目录，
# 这里的源路径已经不再需要 "dist/" 前缀。
COPY backend ./backend
COPY frontend ./frontend
COPY .env.prod ./.env.prod

# 暴露后端服务端口
EXPOSE 8081

# 使用 PM2 作为容器的入口点
CMD ["pm2-runtime", "backend/server.js"]