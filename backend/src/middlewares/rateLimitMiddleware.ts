import type { RequestHandler } from "express";
import { config } from "../config/env";
import { AppError } from "../utils/AppError";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

// 极简内存固定窗口限流：按 IP 计数，超限返回 429 与明确错误码
const buckets = new Map<string, { count: number; resetAt: number }>();

export const rateLimitMiddleware: RequestHandler = (req, res, next) => {
  const now = Date.now();
  const key = req.ip ?? req.socket.remoteAddress ?? "unknown";
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + config.rateLimitWindowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > config.rateLimitMax) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(retryAfter));
    next(new AppError(429, ERROR_CODES.RATE_LIMITED, ERROR_MESSAGES.RATE_LIMITED, `请 ${retryAfter} 秒后重试`));
    return;
  }
  next();
};
