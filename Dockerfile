# Dockerfile

# 使用官方的 Node.js 18 LTS 镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
# 只安装依赖，不进行构建，以保证镜像的通用性
COPY package*.json ./

# 安装项目依赖，包括 PM2
# PM2 将用于在容器内管理 Node.js 进程
RUN npm install

# 确保 PM2 被全局安装，并且其可执行文件在 PATH 中
RUN npm install -g pm2

# 暴露端口
EXPOSE 3000

# 这是一个通用镜像，不包含具体的源代码和构建产物
# 源代码将在 docker-compose.yml 中通过 volume 挂载进来
# 使用 PM2 作为容器的入口点，以保证进程的健壮性
CMD ["pm2-runtime", "dist/server.js"]