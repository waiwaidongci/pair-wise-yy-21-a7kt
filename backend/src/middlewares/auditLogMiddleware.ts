import type { RequestHandler } from "express";

// 请求级审计：写操作和被拒绝的越权请求都会留控制台痕迹；业务审计由 AuditLogService 落库
export const auditLogMiddleware: RequestHandler = (req, res, next) => {
  res.on("finish", () => {
    if (req.method !== "GET" || res.statusCode >= 400) {
      const actor = req.user ? `${req.user.name}#${req.user.id}(${req.user.role})` : "anonymous";
      console.info("audit", res.statusCode, actor, req.method, req.originalUrl);
    }
  });
  next();
};
