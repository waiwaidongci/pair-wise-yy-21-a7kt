import type { SparePartStock } from "../types/SparePartStock";

export const createDefaultSparePartStock = (overrides: Partial<SparePartStock> = {}): SparePartStock => ({
  id: 0,
  warehouse_name: "中心库",
  part_code: "",
  part_name: "",
  available_quantity: 0,
  safety_quantity: 0,
  updated_at: new Date().toISOString(),
  ...overrides
});
