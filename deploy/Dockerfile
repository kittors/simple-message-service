# deploy/Dockerfile
# 核心原则：此 Dockerfile 被设计为在 dist/ 目录中运行。
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 在全局安装 pm2
RUN npm install -g pm2

# 复制已经构建好的后端和前端代码到容器中
COPY backend ./backend
COPY frontend ./frontend

# 安装生产依赖
RUN cd backend && npm install --omit=dev

# 暴露后端服务端口
EXPOSE 8081

# 定义容器启动时执行的命令
CMD ["sh", "-c", "cd backend && pm2-runtime server.js"]
