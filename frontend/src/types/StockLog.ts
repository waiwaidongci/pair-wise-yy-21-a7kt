import type { StockFlow } from "../constants/StockFlow";

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
