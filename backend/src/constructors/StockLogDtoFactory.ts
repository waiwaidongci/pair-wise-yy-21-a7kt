import type { StockLog } from "../models/StockLog";
import { STOCK_FLOW } from "../constants/StockFlow";

// 库存流水记录构造器
export const createStockLogDto = (overrides: Partial<StockLog> = {}): StockLog => ({
  id: 0,
  warehouse_name: "",
  part_code: "",
  part_name: "",
  flow_type: STOCK_FLOW.OUTBOUND,
  change_quantity: 0,
  remaining_quantity: 0,
  usage_id: null,
  ticket_id: null,
  operator_id: 0,
  operator_name: "",
  remark: "",
  created_at: new Date().toISOString(),
  ...overrides
});
