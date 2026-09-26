import type { Request, Response, NextFunction, RequestHandler } from "express";

// controller 内的异步异常也必须转交全局 errorHandlerMiddleware
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
