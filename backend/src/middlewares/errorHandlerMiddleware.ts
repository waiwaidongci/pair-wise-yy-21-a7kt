import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/AppError";
import { ERROR_CODES } from "../constants/errorCodes";

// 全局异常兜底：controller / service 抛出的 AppError 带明确 code，其余归为 500
export const errorHandlerMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({
      code: err.code,
      message: err.message,
      detail: err.detail
    });
    return;
  }
  if (err && typeof err === "object" && "name" in err && (err as { name?: string }).name === "UnauthorizedError") {
    res.status(401).json({ code: ERROR_CODES.AUTH_REQUIRED, message: "登录凭证无效或已过期" });
    return;
  }
  console.error("unhandled error", err);
  res.status(500).json({ code: "INTERNAL_ERROR", message: "服务器内部错误" });
};
