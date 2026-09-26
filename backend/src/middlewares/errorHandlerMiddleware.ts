import type { ErrorRequestHandler } from "express";

/** 全局异常处理：统一错误信封，service/controller 抛出的 AppError 携带状态码与错误码 */
export const errorHandlerMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err.status ?? 500;
  if (status >= 500) console.error("[grid-repair] unhandled error:", err);
  res.status(status).json({
    code: err.code ?? "INTERNAL_ERROR",
    message: err.message ?? "服务内部错误"
  });
};
