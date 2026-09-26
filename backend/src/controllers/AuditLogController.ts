import type { Request, Response } from "express";
import { auditLogService } from "../services/AuditLogService";
import { wrapController } from "./controllerHelpers";

export const auditLogController = {
  list: wrapController(async (_req: Request, res: Response) => {
    res.json(auditLogService.list());
  })
};
