import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { ERROR_CODES } from "../constants/errorCodes";

// controller 层二次包装：service 已抛 AppError 的原样透传，其余归为 500
// 禁止只在全局中间件一处吞掉所有异常
export const wrapController =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      if (err instanceof AppError) {
        next(err);
        return;
      }
      const message = err instanceof Error ? err.message : "备件接口处理失败";
      next(new AppError(500, ERROR_CODES.INTERNAL_ERROR, "接口处理异常", message));
    }
  };
