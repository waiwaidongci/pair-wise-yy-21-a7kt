import type { PartUsageStatus } from "../constants/PartUsageStatus";

// 列表筛选条件：工单 / 仓库 / 申请状态（+ 班组长本组数据范围）
export interface SparePartUsageQuery {
  ticket_id?: number;
  warehouse_name?: string;
  usage_status?: PartUsageStatus | string;
  team_id?: number;
}

// 班组长提交的工单材料申请
export interface CreateUsagePayload {
  ticket_id: number;
  part_code: string;
  part_name: string;
  quantity: number;
  warehouse_name: string;
}

export interface ApproveUsagePayload {
  // 前端可显式确认"库存不足仍保留待审批"，缺字段时由服务端补算
  force?: boolean;
}

export interface RejectUsagePayload {
  reject_reason: string;
}

export interface SparePartUsagePayload extends Record<string, unknown> {
  ticket_id?: number;
  team_id?: number;
  part_code?: string;
  part_name?: string;
  quantity?: number;
  warehouse_name?: string;
  usage_status?: PartUsageStatus | string;
  reject_reason?: string;
}
