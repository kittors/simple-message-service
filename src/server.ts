// src/server.ts

import express, { Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import { Request } from 'express';

// 根据 NODE_ENV 加载对应的 .env 文件
const envPath = path.resolve(__dirname, `../.env.${process.env.NODE_ENV || 'dev'}`);
dotenv.config({ path: envPath });

// 定义端口和项目前缀
const PORT = process.env.PORT || 3000;
const APP_KEY_PREFIX = process.env.APP_KEY_PREFIX || '';

const app = express();

/**
 * @description 存储活跃的 SSE 连接。
 * Map<string, Response>，键为用户的 key，值为 Express 的 Response 对象。
 * 这使得我们能够通过 key 找到特定的客户端连接并发送数据。
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
 */
function pushMessageToClient(key: string, message: string) {
  const prefixedKey = `${APP_KEY_PREFIX}${key}`;
  
  // 更新内存缓存
  messageCache.set(prefixedKey, message);
  console.log(`[Cache] 消息已缓存，key=${prefixedKey}`);

  const client = clients.get(prefixedKey);

  if (client) {
    // SSE 格式要求数据以 `data:` 开头，以 `\n\n` 结尾。
    // 我们将消息封装为 JSON 字符串，便于前端解析。
    const sseMessage = `data: ${JSON.stringify({ message })}\n\n`;
    client.write(sseMessage);
    console.log(`[SSE] 成功推送消息到客户端: key=${prefixedKey}`);
  } else {
    console.log(`[SSE] 未找到匹配的客户端连接，key: ${prefixedKey}。消息已缓存，等待客户端连接。`);
  }
}

// 使用 express.json() 中间件来解析 POST 请求中的 JSON 格式的 body
app.use(express.json());

// 允许跨域请求，但仅限于指定的源（如果您的前端和后端运行在不同的端口或域名）
app.use(cors({
    origin: '*', // 生产环境中应限制为特定的域名，例如 'http://your-frontend.com'
    methods: ['GET', 'POST']
}));

// 托管 public 目录下的静态文件
app.use(express.static(path.join(__dirname, '../public')));

/**
 * POST /api/push 接口
 * 职责: 接收外部系统推送的新消息。
 * 此接口现在将触发 SSE 推送逻辑，并更新后端缓存。
 */
app.post('/api/push', (req: Request, res: Response) => {
  const { key, message } = req.body;

  if (!key || !message) {
    return res.status(400).send({ error: 'Key and message are required.' });
  }

  // 调用原子化的推送函数，将消息实时推送到客户端并缓存
  pushMessageToClient(key, message);

  res.status(200).send({ success: true, message: 'Message received and pushed to client.' });
});

/**
 * GET /api/sse/:key 接口
 * 职责: 建立 Server-Sent Events 连接。
 * 当新的客户端连接时，首先检查缓存，如果有消息，立即推送。
 * 然后再将此连接存储起来，等待实时新消息。
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
  console.log(`服务器已在 http://localhost:${PORT} 端口启动`);
});
