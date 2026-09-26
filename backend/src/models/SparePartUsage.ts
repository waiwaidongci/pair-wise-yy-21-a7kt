import type { PartUsageStatus } from "../constants/PartUsageStatus";

/** 备件领用/申请记录（审批台核心实体） */
export interface SparePartUsage {
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
  /** 批准扣减后该备件在仓库的剩余可用量 */
  stock_after_approval: number | null;
  /** 库存不足时缺多少件；记录保留在待审批 */
  shortage_quantity: number | null;
}

/** 列表返回附带的实时库存核对信息 */
export interface SparePartUsageView extends SparePartUsage {
  available_quantity: number;
  stock_short: number;
}
