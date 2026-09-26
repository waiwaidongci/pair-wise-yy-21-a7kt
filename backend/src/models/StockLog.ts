import type { StockFlow } from "../constants/StockFlow";

// 备件库存流水：每次批准出库都写入一条，形成台账
export interface StockLog {
  id: number;
  warehouse_name: string;
  part_code: string;
  part_name: string;
  flow_type: StockFlow | string;
  change_quantity: number;
  remaining_quantity: number;
  usage_id: number | null;
  ticket_id: number | null;
  operator_id: number;
  operator_name: string;
  remark: string;
  created_at: string;
}
