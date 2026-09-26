import { request } from "./http";
import type { SparePartStock } from "../types/SparePartStock";

export function listSparePartStock(): Promise<SparePartStock[]> {
  return request<SparePartStock[]>("/api/spare-part-stock");
}
