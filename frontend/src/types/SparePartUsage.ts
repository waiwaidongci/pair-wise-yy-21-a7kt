import type { PartUsageStatus } from "../constants/PartUsageStatus";

export interface SparePartUsage {
  id: number;
  ticket_id: number;
  team_id: number;
  applicant_id: number;
  applicant_name: string;
  part_code: string;
  part_name: string;
  quantity: number;
  warehouse_name: string;
  usage_status: PartUsageStatus | string;
  // 审批结果 / 库存余量 / 审批人
  approved_by: string;
  approver_id: number | null;
  approved_at: string | null;
  reject_reason: string | null;
  stock_remaining: number | null;
  shortage_quantity: number | null;
  created_at: string;
  updated_at: string;
}

// 列表响应附带的实时核对字段
export interface SparePartUsageView extends SparePartUsage {
  available_quantity: number;
  current_shortage: number;
  team_name?: string;
}

export interface SparePartUsageQuery {
  ticket_id?: number;
  warehouse_name?: string;
  usage_status?: PartUsageStatus | string;
}

export interface CreateUsagePayload {
  ticket_id: number;
  part_code: string;
  part_name: string;
  quantity: number;
  warehouse_name: string;
}
