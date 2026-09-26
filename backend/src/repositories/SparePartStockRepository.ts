import { seed } from "../seed";
import type { SparePartStock } from "../models/SparePartStock";

const rows: SparePartStock[] = structuredClone(seed.sparePartStock) as unknown as SparePartStock[];

export interface StockQuery {
  warehouse_name?: string;
  part_code?: string;
}

export const sparePartStockRepository = {
  findAll(query: StockQuery = {}): SparePartStock[] {
    return rows
      .filter((row) =>
        query.warehouse_name ? row.warehouse_name === query.warehouse_name : true
      )
      .filter((row) => (query.part_code ? row.part_code === query.part_code : true));
  },

  find(warehouseName: string, partCode: string): SparePartStock | undefined {
    return rows.find(
      (row) => row.warehouse_name === warehouseName && row.part_code === partCode
    );
  },

  // 批准出库时扣减库存，返回扣减后余量
  deduct(warehouseName: string, partCode: string, quantity: number): SparePartStock {
    const row = this.find(warehouseName, partCode);
    if (!row) throw new Error(`stock not found: ${warehouseName}/${partCode}`);
    row.available_quantity -= quantity;
    row.updated_at = new Date().toISOString();
    return row;
  }
};
