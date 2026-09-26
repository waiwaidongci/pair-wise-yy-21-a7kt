/** 备件库存台账：同一仓库内备件编码唯一 */
export interface SparePartStock {
  id: number;
  warehouse_name: string;
  part_code: string;
  part_name: string;
  available_quantity: number;
  unit: string;
}
