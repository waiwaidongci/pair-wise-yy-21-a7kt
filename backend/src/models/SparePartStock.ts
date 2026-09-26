// 备件库存（按 仓库 + 备件编码 唯一）
export interface SparePartStock {
  id: number;
  warehouse_name: string;
  part_code: string;
  part_name: string;
  available_quantity: number;
  safety_quantity: number;
  updated_at: string;
}
