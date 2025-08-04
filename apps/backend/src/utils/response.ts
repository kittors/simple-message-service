// apps/backend/src/utils/response.ts

import { Response } from 'express';

/**
 * 核心原则：响应格式原子。
 * 这个模块提供了一组标准化的函数来生成API响应。
 * 这确保了所有API端点都返回一致的、可预测的结构，
 * 极大地简化了前端的处理逻辑。
 */

// 核心更新：在响应体中增加一个 `code` 字段，通常与 HTTP 状态码保持一致。
interface ApiResponse<T> {
  success: boolean;
  code: number; // 新增：业务状态码，与 HTTP 状态码同步
  data: T | null;
  message: string | null;
  error?: string;
}

/**
 * 发送成功的 API 响应。
 * @param res Express 的 Response 对象。
 * @param data 要发送的数据。
 * @param message 成功的消息文本。
 * @param statusCode HTTP 状态码，同时也会作为业务状态码 `code` 的值。
 */
export const sendSuccess = <T>(res: Response, data: T, message: string = 'Operation successful', statusCode: number = 200) => {
  const response: ApiResponse<T> = {
    success: true,
    code: statusCode, // 新增
    data,
    message,
  };
  res.status(statusCode).json(response);
};

/**
 * 发送错误的 API 响应。
 * @param res Express 的 Response 对象。
 * @param message 错误的消息文本。
 * @param statusCode HTTP 状态码，同时也会作为业务状态码 `code` 的值。
 * @param error 可选的错误详情。
 */
export const sendError = (res: Response, message: string = 'An error occurred', statusCode: number = 500, error?: string) => {
  const response: ApiResponse<null> = {
    success: false,
    code: statusCode, // 新增
    data: null,
    message,
    error,
  };
  res.status(statusCode).json(response);
};
