Simple Message Service
这是一个功能完善、遵循原子设计原则的全栈消息推送与展示服务。项目采用 pnpm 和 Turbo 构建的 Monorepo 架构，实现了前后端的清晰分离、高效的开发流程和一键式容器化部署。

Clone 地址: https://github.com/kittors/simple-message-service.git

✨ 功能特性
实时消息推送: 基于 Server-Sent Events (SSE) 实现，服务器可向客户端实时推送消息。

历史消息拉取: 支持分页加载历史消息，实现无限滚动。

原子化设计: 前后端代码均遵循原子设计原则，模块高度内聚、低耦合，易于维护和扩展。

用户身份隔离: 通过唯一的 key 来隔离不同用户的消息数据。

批量操作: 支持多选和批量删除消息，提升用户操作效率。

精美的前端界面:

使用 React, TypeScript 和 Tailwind CSS 构建，界面美观且响应式。

提供 Toast 全局通知，对操作结果给予即时反馈。

包含加载、空状态、连接状态等细致的 UI/UX 设计。

消息内容支持代码高亮，提升可读性。

一键复制消息内容。

完善的开发与部署流程:

Monorepo 架构: 使用 pnpm 和 Turborepo 管理多包项目，提升构建和开发效率。

环境隔离: 使用 .env 文件区分开发和生产环境配置。

容器化部署: 提供 Dockerfile 和 docker-compose.yml，实现一键启动应用和数据库服务。

平滑构建: 自动化脚本处理生产环境的依赖安装和文件拷贝。

🛠️ 技术栈
前端:

框架: React 18

语言: TypeScript

样式: Tailwind CSS

构建工具: Vite

UI 图标: Lucide React

后端:

框架: Node.js, Express

语言: TypeScript

数据库: PostgreSQL

实时通信: Server-Sent Events (SSE)

开发与部署:

包管理器: pnpm

Monorepo 工具: Turborepo

容器化: Docker, Docker Compose

进程管理: PM2

🚀 快速开始
1. 环境准备
在开始之前，请确保你的开发环境中安装了以下软件：

Node.js (v18 或更高版本)

pnpm (v9 或更高版本)

Docker 和 Docker Compose

2. 克隆与安装
# 克隆项目
git clone https://github.com/kittors/simple-message-service.git

# 进入项目目录
cd simple-message-service

# 安装所有依赖
pnpm install

3. 配置开发环境
项目使用 .env.dev 文件进行开发环境配置。

复制环境变量文件:
项目根目录下已经提供了 .env.dev 文件，无需手动创建。

启动开发数据库:
项目使用 Docker Compose 来管理开发环境的 PostgreSQL 数据库。

# 在项目根目录下，启动数据库服务
docker-compose -f docker-compose.dev.yml up -d

该命令会根据 .env.dev 中的配置，在后台启动一个 PostgreSQL 容器。

初始化数据库表:
数据库启动后，需要初始化 messages 表结构。

# 运行数据库迁移脚本
pnpm --filter simple-message-service-backend db:migrate

4. 启动开发服务
一切准备就绪后，在项目根目录运行以下命令来同时启动前端和后端开发服务器：

pnpm dev

前端服务 将运行在: http://localhost:3000 (或 .env.dev 中 VITE_FRONTEND_PORT 指定的端口)

后端服务 将运行在: http://localhost:3001 (或 .env.dev 中 VITE_BACKEND_PORT 指定的端口)

现在，你可以在浏览器中打开 http://localhost:3000，输入任意密钥（例如 my-secret-key）即可开始使用。

📦 构建与部署
1. 构建生产包
运行以下命令来为前端和后端创建优化后的生产版本：

pnpm build

此命令会执行以下操作：

清理旧的 dist 目录。

使用 Vite 构建前端应用。

使用 tsc 编译后端 TypeScript 代码。

自动将生产环境所需的 Dockerfile, docker-compose.yml 和 .env.prod 文件复制到 dist 目录。

为 dist/backend 生成一个干净的 package.json 并安装生产依赖。

所有构建产物最终都位于项目根目录下的 dist 文件夹内。

2. 使用 Docker 部署
dist 目录是一个独立的、可直接部署的单元。

进入 dist 目录:

cd dist

配置生产环境变量:
dist 目录中已经包含了一个 .env 文件（由 .env.prod 复制而来）。你可以根据实际部署需求修改其中的数据库密码、端口等信息。

启动服务:
使用 Docker Compose 一键启动应用和数据库服务。

docker-compose up --build -d

服务启动后，应用将通过 .env 文件中 VITE_BACKEND_PORT 指定的端口对外提供服务。

⚙️ 环境变量
项目通过不同的 .env 文件管理环境配置：

.env.dev: 开发环境配置。用于本地开发时连接开发数据库和定义服务端口。

.env.prod: 生产环境配置。用于 Docker 部署时，会被复制为 dist/.env。

.env.example: 生产环境变量的模板文件，用于说明需要哪些配置项。

📜 可用脚本
在项目根目录的 package.json 中定义了多个便捷脚本：

pnpm dev: 并行启动前端和后端开发服务器。

pnpm dev:backend: 单独启动后端开发服务器。

pnpm dev:frontend: 单独启动前端开发服务器。

pnpm build: 构建生产版本。

pnpm start: 在生产模式下启动后端服务 (需要先执行 pnpm build)。

pnpm clean: 删除 dist 目录。

📝 API 端点
后端服务提供了以下主要的 API 端点：

POST /api/push: 推送一条新消息。

Body: { "key": "string", "message": "string" }

GET /api/history/:key: 分页获取历史消息。

Query Params: page, limit

GET /api/sse/:key: 建立一个 SSE 连接用于接收实时消息。

DELETE /api/messages/:key: 批量删除消息。

Body: { "ids": [1, 2, 3] }