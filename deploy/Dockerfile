# deploy/Dockerfile

# 使用一个稳定的 Node.js Alpine 镜像作为基础
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 核心修正：直接在最终镜像中安装 PM2。
# 这种方法比多阶段构建更简单、更稳健，可以避免因复制不完整而导致“pm2-runtime”找不到的问题。
RUN npm install -g pm2

# 复制已构建的应用程序和依赖
# 注意：此 Dockerfile 在构建时位于 dist 目录中，因此源路径不需要 "dist/" 前缀。
COPY backend ./backend
COPY frontend ./frontend
COPY .env.prod ./.env.prod

# 暴露后端服务端口
EXPOSE 8081

# 关键修正：为了确保 pm2 能在正确的上下文中找到 server.js,
# 并且让 server.js 中的相对路径正确解析，我们将工作目录切换到 backend。
WORKDIR /app/backend

# 启动服务。PM2 会在当前工作目录（/app/backend）中寻找 server.js。
CMD ["pm2-runtime", "server.js"]
