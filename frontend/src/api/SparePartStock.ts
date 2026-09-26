import { request } from "./http";
import type { SparePartStock } from "../types/SparePartStock";
import type { StockLog } from "../types/StockLog";

export async function listSparePartStock(warehouseName?: string): Promise<SparePartStock[]> {
  return request<SparePartStock[]>("/spare-part-stock", {
    query: { warehouse_name: warehouseName }
  });
}

export async function listStockLogs(): Promise<StockLog[]> {
  return request<StockLog[]>("/spare-part-stock/logs");
}
