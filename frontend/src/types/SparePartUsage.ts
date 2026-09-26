export type PartUsageStatusValue = "PENDING" | "APPROVED" | "REJECTED";

export interface SparePartUsage {
  id: number;
  ticket_id: number;
  team_id: number;
  part_code: string;
  part_name: string;
  quantity: number;
  warehouse_name: string;
  usage_status: PartUsageStatusValue;
  requested_by: string;
  requested_at: string;
  approved_by: string;
  approved_at: string;
  reject_reason: string;
  /** 批准扣减后的库存余量 */
  stock_after_approval: number | null;
  /** 库存不足时的缺口数量 */
  shortage_quantity: number | null;
}

/** 列表接口附带的实时库存核对字段 */
export interface SparePartUsageView extends SparePartUsage {
  available_quantity: number;
  stock_short: number;
}

export interface SparePartUsageForm {
  ticket_id: number | "";
  part_code: string;
  part_name: string;
  quantity: number;
  warehouse_name: string;
}

export interface DecisionResult {
  record: SparePartUsageView;
  warning?: string;
}

export interface SparePartUsageFilters {
  ticketId: string;
  warehouse: string;
  status: PartUsageStatusValue | "";
}
