import type { SparePartUsage, SparePartUsageForm } from "../types/SparePartUsage";

/** 备件领用记录默认结构（与后端 DTO 工厂对齐） */
export const createDefaultSparePartUsage = (overrides: Partial<SparePartUsage> = {}): SparePartUsage => ({
  id: 0,
  ticket_id: 0,
  team_id: 0,
  part_code: "",
  part_name: "",
  quantity: 1,
  warehouse_name: "",
  usage_status: "PENDING",
  requested_by: "",
  requested_at: "",
  approved_by: "",
  approved_at: "",
  reject_reason: "",
  stock_after_approval: null,
  shortage_quantity: null,
  ...overrides
});

/** 班组长“提交申请”表单初始对象 */
export const createSparePartUsageForm = (overrides: Partial<SparePartUsageForm> = {}): SparePartUsageForm => ({
  ticket_id: "",
  part_code: "",
  part_name: "",
  quantity: 1,
  warehouse_name: "",
  ...overrides
});

export const createSparePartUsageResponse = createDefaultSparePartUsage;
