import type { SparePartUsage } from "../types/SparePartUsage";
import { PART_USAGE_STATUS } from "../constants/PartUsageStatus";

// 备件申请默认结构 / 表单结构 / 响应结构统一出口，禁止页面散写
export const createDefaultSparePartUsage = (overrides: Partial<SparePartUsage> = {}): SparePartUsage => ({
  id: 0,
  ticket_id: 0,
  team_id: 0,
  applicant_id: 0,
  applicant_name: "",
  part_code: "",
  part_name: "",
  quantity: 1,
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

// 班组长提交申请表单
export const createSparePartUsageForm = (
  overrides: Partial<{
    ticket_id: number | string;
    part_code: string;
    part_name: string;
    quantity: number;
    warehouse_name: string;
  }> = {}
) => ({
  ticket_id: "",
  part_code: "",
  part_name: "",
  quantity: 1,
  warehouse_name: "中心库",
  ...overrides
});

export const createSparePartUsageResponse = createDefaultSparePartUsage;
