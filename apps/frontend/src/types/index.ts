// apps/frontend/src/types/index.ts

/**
 * 核心原则：类型定义原子。
 * 这个文件是整个前端应用中所有共享数据结构的“真理之源”。
 * 集中定义 TypeScript 类型可以确保数据在不同组件和模块之间传递时的一致性和类型安全。
 */

// 与后端 `message.model.ts` 对应，定义了单条消息的数据结构
export interface Message {
  id: number;
  client_key: string;
  content: string;
  created_at: string; // JSON 序列化后日期是字符串
}

// 与后端 `response.ts` 对应，定义了标准 API 响应的结构
// 核心更新：增加 `code` 字段，与后端同步。
export interface ApiResponse<T> {
  success: boolean;
  code: number; // 新增：业务状态码
  data: T;
  message?: string;
  error?: string;
}
