import type { Request, Response, NextFunction } from "express";
import { sparePartUsageService } from "../services/SparePartUsageService";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { badRequest } from "../errors/AppError";
import type { SparePartUsageQuery } from "../types/SparePartUsagePayload";

const parseQuery = (req: Request): SparePartUsageQuery => {
  const query: SparePartUsageQuery = {};
  if (req.query.ticketId) {
    const ticketId = Number(req.query.ticketId);
    if (!Number.isInteger(ticketId)) {
      throw badRequest("VALIDATION_FAILED", ERROR_MESSAGES.VALIDATION_FAILED.replace("{field}", "ticketId"));
    }
    query.ticketId = ticketId;
  }
  if (typeof req.query.warehouse === "string" && req.query.warehouse) query.warehouse = req.query.warehouse;
  if (typeof req.query.status === "string" && req.query.status) query.status = req.query.status;
  return query;
};

// Service 层负责业务异常包装，controller 再兜一层参数解析异常，禁止在全局处理器中吞掉。
export const sparePartUsageController = {
  list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(sparePartUsageService.list(req.user!, parseQuery(req)));
    } catch (err) {
      next(err);
    }
  },

  apply(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(sparePartUsageService.apply(req.user!, req.body ?? {}));
    } catch (err) {
      next(err);
    }
  },

  approve(req: Request, res: Response, next: NextFunction) {
    try {
      const result = sparePartUsageService.approve(req.user!, Number(req.params.id));
      res.status(result.warning ? 202 : 200).json(result);
    } catch (err) {
      next(err);
    }
  },

  reject(req: Request, res: Response, next: NextFunction) {
    try {
      const reason = String((req.body as { reason?: string } | undefined)?.reason ?? "");
      res.json(sparePartUsageService.reject(req.user!, Number(req.params.id), reason));
    } catch (err) {
      next(err);
    }
  }
};
