# Dockerfile

# 第一阶段：构建阶段 (builder)
# 使用 node:18-alpine 作为构建环境
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml，并使用 pnpm 安装依赖
# 这会安装所有依赖，包括 devDependencies，以确保 tsc 可用
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# 复制源代码和公共文件
COPY src src
COPY public public
COPY tsconfig.json ./

# 编译 TypeScript 源代码
# 确保所有类型定义都已安装，tsc可以成功执行
RUN npm run build

# 第二阶段：生产阶段 (production)
# 使用更轻量级的镜像作为最终运行环境
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 从构建阶段复制已编译的代码和生产依赖
# 这里只复制 dist 文件夹和 production-only 的 node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
# 使用 pnpm 复制生产依赖，确保自包含
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod

# 安装 PM2
RUN npm install -g pm2

# 暴露端口
EXPOSE 3000

# 使用 PM2 作为容器的入口点
CMD ["pm2-runtime", "dist/server.js"]