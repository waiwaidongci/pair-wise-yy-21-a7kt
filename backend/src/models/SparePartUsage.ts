import type { PartUsageStatus } from "../constants/PartUsageStatus";

// 备件领用申请（工单材料申请）
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
  // 审批信息
  approved_by: string;
  approver_id: number | null;
  approved_at: string | null;
  reject_reason: string | null;
  // 批准时快照：库存余量（该备件在该仓库的剩余可用量）与缺量
  stock_remaining: number | null;
  shortage_quantity: number | null;
  created_at: string;
  updated_at: string;
}
