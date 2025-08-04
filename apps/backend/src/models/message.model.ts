// apps/backend/src/models/message.model.ts

/**
 * 核心原则：数据结构原子。
 * 这个文件只定义了 Message 类型的数据结构。
 * 它是应用中关于“消息”这一概念的“真理之源”，
 * 为 TypeScript 提供了类型安全，并清晰地定义了数据模型。
 */
export interface Message {
  id: number;
  client_key: string;
  content: string;
  created_at: Date;
}
