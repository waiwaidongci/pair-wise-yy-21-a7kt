import type { PartUsageStatus } from "../constants/PartUsageStatus";

/** 备件领用记录的响应/默认 DTO 构造器：service、controller、页面不得散写默认结构 */
export const createSparePartUsageDto = (overrides: Partial<{
  id: number;
  ticket_id: number;
  team_id: number;
  part_code: string;
  part_name: string;
  quantity: number;
  warehouse_name: string;
  usage_status: PartUsageStatus;
  requested_by: string;
  requested_at: string;
  approved_by: string;
  approved_at: string;
  reject_reason: string;
  stock_after_approval: number | null;
  shortage_quantity: number | null;
}> = {}) => ({
  id: 0,
  ticket_id: 0,
  team_id: 0,
  part_code: "",
  part_name: "",
  quantity: 1,
  warehouse_name: "",
  usage_status: "PENDING" as PartUsageStatus,
  requested_by: "",
  requested_at: "",
  approved_by: "",
  approved_at: "",
  reject_reason: "",
  stock_after_approval: null,
  shortage_quantity: null,
  ...overrides
});

/** 班组长提交申请表单的初始结构 */
export const createSparePartUsageFormDto = (overrides: { ticket_id: number; team_id: number } & Record<string, unknown> = {
  ticket_id: 0,
  team_id: 0
}) =>
  createSparePartUsageDto({
    quantity: 1,
    ...overrides
  });
