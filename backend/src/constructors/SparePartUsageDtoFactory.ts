import type { SparePartUsage } from "../models/SparePartUsage";
import type { SparePartStock } from "../models/SparePartStock";
import { PART_USAGE_STATUS } from "../constants/PartUsageStatus";

// 列表/详情响应：在存储记录之外补充实时可用库存、缺量，供仓管批准前核对
export interface SparePartUsageView extends SparePartUsage {
  available_quantity: number;
  current_shortage: number;
  team_name?: string;
}

// 申请单默认结构（factory / builder 统一出口，页面与服务禁止散写默认值）
export const createSparePartUsageDto = (
  overrides: Partial<SparePartUsage> = {}
): SparePartUsage => ({
  id: 0,
  ticket_id: 0,
  team_id: 0,
  applicant_id: 0,
  applicant_name: "",
  part_code: "",
  part_name: "",
  quantity: 0,
  warehouse_name: "中心库",
  usage_status: PART_USAGE_STATUS.PENDING,
  approved_by: "",
  approver_id: null,
  approved_at: null,
  reject_reason: null,
  stock_remaining: null,
  shortage_quantity: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const buildUsageView = (
  row: SparePartUsage,
  stock?: SparePartStock,
  teamName?: string
): SparePartUsageView => {
  const available = stock?.available_quantity ?? 0;
  const shortage =
    row.usage_status === PART_USAGE_STATUS.PENDING
      ? Math.max(row.quantity - available, 0)
      : (row.shortage_quantity ?? 0);
  return { ...row, available_quantity: available, current_shortage: shortage, team_name: teamName };
};
