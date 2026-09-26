import type { RequestHandler } from "express";

/** 访问日志：所有写操作在控制台留痕（业务审计落 audit_log 表/内存由 service 负责） */
export const auditLogMiddleware: RequestHandler = (req, _res, next) => {
  if (req.method !== "GET" && req.method !== "OPTIONS" && req.path !== "/health") {
    console.info("audit", req.user ? `${req.user.name}(${req.user.role})` : "anonymous", req.method, req.originalUrl);
  }
  next();
};
