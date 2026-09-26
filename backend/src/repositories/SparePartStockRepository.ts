import { seed } from "../seed";
import type { SparePartStock } from "../models/SparePartStock";

export interface StockLocation {
  warehouse_name: string;
  part_code: string;
}

export const sparePartStockRepository = {
  findAll(): SparePartStock[] {
    return seed.sparePartStock;
  },
  listWarehouses(): string[] {
    return [...new Set(seed.sparePartStock.map((row) => row.warehouse_name))];
  },
  findByLocation(location: StockLocation): SparePartStock | undefined {
    return seed.sparePartStock.find(
      (row) => row.warehouse_name === location.warehouse_name && row.part_code === location.part_code
    );
  },
  /** 批准出库：扣减可用库存，返回扣减后的余量 */
  deduct(location: StockLocation, quantity: number): number {
    const stock = this.findByLocation(location);
    if (!stock) return 0;
    stock.available_quantity -= quantity;
    return stock.available_quantity;
  }
};
