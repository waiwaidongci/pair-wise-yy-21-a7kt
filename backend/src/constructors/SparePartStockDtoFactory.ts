import type { SparePartStock } from "../models/SparePartStock";

export const createSparePartStockDto = (overrides: Partial<SparePartStock> = {}): SparePartStock => ({
  id: 0,
  warehouse_name: "",
  part_code: "",
  part_name: "",
  available_quantity: 0,
  safety_quantity: 0,
  updated_at: new Date().toISOString(),
  ...overrides
});
