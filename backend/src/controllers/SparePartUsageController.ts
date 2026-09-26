import type { Request, Response } from "express";
import { sparePartUsageService } from "../services/SparePartUsageService";
import { wrapController } from "./controllerHelpers";
import type { SparePartUsageQuery } from "../types/SparePartUsagePayload";
import { PART_USAGE_STATUS_LIST } from "../constants/PartUsageStatus";
import { badRequest } from "../utils/AppError";

const parseQuery = (req: Request): SparePartUsageQuery => {
  const query: SparePartUsageQuery = {};
  if (req.query.ticket_id) {
    const ticketId = Number(req.query.ticket_id);
    if (!Number.isInteger(ticketId)) throw badRequest("ticket_id 必须为整数");
    query.ticket_id = ticketId;
  }
  if (typeof req.query.warehouse_name === "string" && req.query.warehouse_name.trim()) {
    query.warehouse_name = req.query.warehouse_name.trim();
  }
  if (typeof req.query.usage_status === "string" && req.query.usage_status) {
    if (!PART_USAGE_STATUS_LIST.includes(req.query.usage_status as never)) {
      throw badRequest(`不支持的申请状态：${req.query.usage_status}`);
    }
    query.usage_status = req.query.usage_status;
  }
  return query;
};

export const sparePartUsageController = {
  // 审批台列表：工单 / 仓库 / 申请状态筛选；班组长服务端强制本组
  list: wrapController(async (req: Request, res: Response) => {
    const rows = sparePartUsageService.list(parseQuery(req), req.user!);
    res.json(rows);
  }),

  // 班组长提交申请
  create: wrapController(async (req: Request, res: Response) => {
    const row = sparePartUsageService.apply(req.body ?? {}, req.user!);
    res.status(201).json(row);
  }),

  // 仓管批准
  approve: wrapController(async (req: Request, res: Response) => {
    const row = sparePartUsageService.approve(Number(req.params.id), req.user!);
    res.json(row);
  }),

  // 仓管驳回（原因必填，service 再次校验）
  reject: wrapController(async (req: Request, res: Response) => {
    const row = sparePartUsageService.reject(
      Number(req.params.id),
      String(req.body?.reject_reason ?? ""),
      req.user!
    );
    res.json(row);
  })
};
