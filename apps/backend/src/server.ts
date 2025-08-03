// src/server.ts

// 核心原则：原子性 - 环境变量加载和路径解析是应用的最小单元，应该集中处理并放置在最前面。
// 在 CommonJS 环境中，__dirname 变量是全局可用的，无需手动创建。
import express, { Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Request } from 'express';
import path from 'path';

// 加载环境变量文件，使用修正后的 __dirname 确保路径正确
const envPath = path.resolve(__dirname, `../../../.env.${process.env.NODE_ENV || 'dev'}`);
dotenv.config({ path: envPath });

// 定义端口和项目前缀
const PORT = process.env.VITE_BACKEND_PORT || 3001;
const APP_KEY_PREFIX = process.env.APP_KEY_PREFIX || '';

const app = express();

/**
 * @description 存储活跃的 SSE 连接。
 * Map<string, Response>，键为用户的 key，值为 Express 的 Response 对象。
 * 这是服务器状态的核心“原子”数据结构。
 */
const clients = new Map<string, Response>();

/**
 * @description 存储每个 key 对应的最新消息的缓存。
 * Map<string, string>，键为用户的 key，值为最新的消息内容。
 * 这是一个内存缓存，用于解决客户端刷新后看不到最新消息的问题。
 */
const messageCache = new Map<string, string>();

/**
 * @description 将消息通过 SSE 推送到指定客户端。
 * @param key 客户端的密钥。
 * @param message 要推送的消息内容。
 * 核心原则：原子性 - 这是一个独立的、可重用的函数，不依赖于外部的 HTTP 请求/响应上下文。
 * 它只负责根据给定的键和消息执行推送逻辑。
 */
function pushMessageToClient(key: string, message: string) {
  const prefixedKey = `${APP_KEY_PREFIX}${key}`;
  
  // 更新内存缓存
  messageCache.set(prefixedKey, message);
  console.log(`[Cache] 消息已缓存，key=${prefixedKey}`);

  const client = clients.get(prefixedKey);

  if (client) {
    // SSE 格式要求数据以 `data:` 开头，以 `\n\n` 结尾。
    const sseMessage = `data: ${JSON.stringify({ message })}\n\n`;
    client.write(sseMessage);
    console.log(`[SSE] 成功推送消息到客户端: key=${prefixedKey}`);
  } else {
    console.log(`[SSE] 未找到匹配的客户端连接，key: ${prefixedKey}。消息已缓存，等待客户端连接。`);
  }
}

// 使用 express.json() 中间件来解析 POST 请求中的 JSON 格式的 body
app.use(express.json());

// 允许跨域请求，这里仅用于开发环境
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST']
}));

// --- 提供前端静态文件 ---
// 定义静态文件根目录。在部署环境中，server.js 位于 dist/backend，
// 前端静态文件在 dist/frontend。
// 关键修正：将路径指向 dist 目录
const frontendPath = path.join(__dirname, '..', '..', 'dist', 'frontend');
app.use(express.static(frontendPath));
console.log(`[Static] 正在服务静态文件目录：${frontendPath}`);
// --- 新增内容结束 ---

/**
 * GET / 接口
 * 职责: 为根路径提供一个简单的欢迎信息。
 */
app.get('/', (req, res) => {
  // --- 修正内容：将根路径请求发送到前端的 index.html ---
  res.sendFile(path.join(frontendPath, 'index.html'));
  // --- 修正内容结束 ---
});

/**
 * POST /api/push 接口
 * 职责: 接收外部系统推送的新消息。
 * 此接口将调用原子化的推送函数。
 */
app.post('/api/push', (req: Request, res: Response) => {
  const { key, message } = req.body;

  if (!key || !message) {
    return res.status(400).send({ error: 'Key and message are required.' });
  }

  pushMessageToClient(key, message);

  res.status(200).send({ success: true, message: 'Message received and pushed to client.' });
});

/**
 * GET /api/sse/:key 接口
 * 职责: 建立 Server-Sent Events 连接。
 * 核心原则：这是一个处理连接的“有机体”，将原子数据结构和连接逻辑组合在一起。
 */
app.get('/api/sse/:key', (req: Request, res: Response) => {
  const { key } = req.params;
  const prefixedKey = `${APP_KEY_PREFIX}${key}`;

  // 设置 HTTP 头部，以开启 SSE 连接
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*'); // 允许跨域

  console.log(`[SSE] 新的 SSE 连接建立，key: ${prefixedKey}`);
  
  // 检查缓存，如果有最新的消息，立即推送给新建立的连接
  const cachedMessage = messageCache.get(prefixedKey);
  if (cachedMessage) {
      const sseMessage = `data: ${JSON.stringify({ message: cachedMessage, fromCache: true })}\n\n`;
      res.write(sseMessage);
      console.log(`[SSE] 从缓存中推送消息到新连接，key=${prefixedKey}`);
  } else {
      console.log(`[SSE] 缓存中没有消息，key=${prefixedKey}。`);
  }

  // 将客户端的响应对象存储到 Map 中，以便后续推送实时新消息
  clients.set(prefixedKey, res);

  // 当客户端断开连接时，执行清理工作
  req.on('close', () => {
    clients.delete(prefixedKey);
    console.log(`[SSE] SSE 连接已关闭，key: ${prefixedKey}`);
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器已在 \x1b[32mhttp://localhost:${PORT}\x1b[0m 端口启动`);
});
