# Simple Message Service

## 简介

这是一个基于 Node.js、Express 和 TypeScript 构建的轻量级实时消息推送服务。它利用 Server-Sent Events (SSE) 技术，允许后端向已连接的客户端推送消息，实现单向实时通信。该服务遵循原子设计原则，前端代码被分解为原子 (Atoms)、分子 (Molecules) 和有机体 (Organisms)，旨在提高代码的可重用性、可维护性和架构清晰度。

此外，项目采用 Docker 进行容器化，提供了 `dev` 和 `prod` 两种环境配置，便于开发、测试和生产部署。

## 项目亮点

- **实时消息推送**: 使用 SSE 实现低延迟、高性能的实时消息传递。
    
- **原子设计原则**: 前端代码结构化，便于理解和扩展。
    
- **容器化**: 利用 Docker 和 `docker-compose` 简化部署流程。
    
- **内存缓存**: 为每个客户端密钥缓存最新的消息，确保新连接的客户端能立即获取到最新状态。
    
- **环境隔离**: 通过 `.env` 文件和 `APP_KEY_PREFIX` 区分开发和生产环境，避免密钥冲突。
    
- **前端交互**: 提供一个简单的网页，用户输入密钥后，可以实时接收并展示消息。
    

## 文件结构

项目的目录结构清晰地展示了前后端分离以及原子设计原则的应用：

```
simple-message-service
├── .dockerignore              # Docker 构建时忽略的文件
├── .env.dev                   # 开发环境环境变量
├── .env.prod                  # 生产环境环境变量
├── .gitignore                 # Git 忽略文件
├── Dockerfile                 # Docker 镜像构建文件
├── docker-compose.yml         # Docker Compose 配置文件
├── package.json               # Node.js 包配置文件
├── public                     # 静态资源目录
│   ├── index.html             # 前端入口文件
│   └── js                     # 前端 JavaScript 模块
│       ├── atoms.js           # 原子：DOM 元素引用
│       ├── main.js            # 页面：应用入口，连接各模块
│       ├── molecules.js       # 分子：状态管理和工具函数
│       └── organisms.js       # 有机体：核心业务逻辑和视图切换
├── src                        # 后端源代码目录
│   └── server.ts              # 后端入口文件
└── tsconfig.json              # TypeScript 编译配置
```

## 技术栈

**后端**:

- **Node.js**
    
- **Express**: 快速、开放、极简的 Web 框架。
    
- **TypeScript**: 提供强类型支持，提高代码质量和可维护性。
    
- **Docker**: 容器化技术，实现环境一致性和快速部署。
    
- **PM2**: 用于生产环境的进程管理，确保应用稳定运行。
    

**前端**:

- **HTML**: 页面结构。
    
- **JavaScript (ES Module)**: 客户端逻辑，遵循原子设计。
    
- **Tailwind CSS**: 快速构建响应式界面的实用工具集框架。
    
- **Lucide Icons**: 现代化、可定制的图标库。
    

## 如何运行

### 先决条件

- 已安装 [Docker](https://www.docker.com/ "null") 和 [Docker Compose](https://docs.docker.com/compose/install/ "null")。
    
- 已安装 [Node.js](https://nodejs.org/ "null") 和 [pnpm](https://pnpm.io/ "null")（如果想在本地不使用 Docker 运行）。
    

### 使用 Docker 运行

这是推荐的运行方式，它将为你创建一个独立且配置好的环境。

1. **克隆仓库:**
    
    ```
    git clone https://github.com/kittors/simple-message-service.git
    cd simple-message-service
    ```
    
2. **启动服务:**
    
    ````
    docker-compose up --build -d
    ```-d` 参数表示在后台运行。
    
    ````
    
3. **访问应用:** 服务将在 `http://localhost:3000` 端口上运行。
    

### 本地开发运行 (不使用 Docker)

1. **安装依赖:**
    
    ```
    pnpm install
    ```
    
2. **启动开发模式:**
    
    ```
    npm run dev
    ```
    
    此命令使用 `ts-node` 启动后端服务，任何代码更改都会自动重启。
    
3. **访问应用:** 服务将在 `http://localhost:3000` 端口上运行。
    

## API 接口

### `POST /api/push`

**功能**: 用于向指定的客户端密钥推送一条新消息。

**请求体 (JSON)**:

```
{
  "key": "your-secret-key",
  "message": "Hello, this is a real-time message!"
}
```

**响应**:

- **成功**: `200 OK`
    
    ```
    {
      "success": true,
      "message": "Message received and pushed to client."
    }
    ```
    
- **失败**: `400 Bad Request`
    
    ```
    {
      "error": "Key and message are required."
    }
    ```
    

### `GET /api/sse/:key`

**功能**: 建立 Server-Sent Events 连接，用于接收实时消息。

**URL 参数**:

- `key`: 客户端的密钥。
    

**响应**:

- 此接口将返回 `text/event-stream` 类型的数据流。
    
- 当有新消息时，服务器会以以下格式推送：
    
    ```
    data: {"message": "新的实时消息"}
    
    ```
    
- 当客户端首次连接，且服务器缓存中有消息时，会立即推送缓存消息：
    
    ```
    data: {"message": "缓存中的消息", "fromCache": true}
    
    ```
    

## 架构概览

### 后端 (`src/server.ts`)

- **API 接口**: 暴露 `POST /api/push` 和 `GET /api/sse/:key` 两个核心接口。
    
- **SSE 管理**: 使用 `Map` (`clients`) 存储和管理所有活跃的 SSE 连接。
    
- **消息缓存**: 使用 `Map` (`messageCache`) 存储每个客户端密钥的最新消息，以应对客户端重新连接或页面刷新的场景。
    
- **原子化推送**: `pushMessageToClient` 函数被设计为一个原子操作，它负责更新缓存并向客户端推送消息。
    

### 前端 (`public/js/*`)

前端代码严格遵循原子设计原则，确保模块化和可维护性。

- **`atoms.js`**: 定义了所有与 DOM 交互的“原子”，如 `loginContainer` 和 `keyInput`。这是所有 UI 元素的唯一引用源。
    
- **`molecules.js`**: 包含“分子”级别的组件，如 `AppState` (`sse` 连接实例) 和 `validateKey` 工具函数。这些是独立的、可重用的逻辑单元。
    
- **`organisms.js`**: 组合原子和分子来构建功能完整的“有机体”，如 `connectToServerEvents` (SSE 连接逻辑) 和 `renderView` (视图切换逻辑)。
    
- **`main.js`**: 作为“页面”层，将所有有机体整合起来，处理顶层事件绑定和应用初始化。
    

这种设计使得前端代码结构清晰，易于理解和进行单元测试。

## 贡献

欢迎通过提交 issue 或 Pull Request 来改进此项目。