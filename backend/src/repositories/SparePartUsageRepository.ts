import { seed, nextId, timestamp } from "../seed";
import type { PartUsageStatus } from "../constants/PartUsageStatus";
import type { SparePartUsage } from "../models/SparePartUsage";
import type { SparePartUsageQuery } from "../types/SparePartUsagePayload";

export interface NewSparePartUsage {
  ticket_id: number;
  team_id: number;
  part_code: string;
  part_name: string;
  quantity: number;
  warehouse_name: string;
  requested_by: string;
}

export const sparePartUsageRepository = {
  findAll(): SparePartUsage[] {
    return seed.sparePartUsage;
  },
  findById(id: number): SparePartUsage | undefined {
    return seed.sparePartUsage.find((row) => row.id === id);
  },
  /** 按工单 / 仓库 / 申请状态筛选 */
  filter(query: SparePartUsageQuery, teamId?: number): SparePartUsage[] {
    return seed.sparePartUsage.filter((row) => {
      if (query.ticketId !== undefined && row.ticket_id !== query.ticketId) return false;
      if (query.warehouse && row.warehouse_name !== query.warehouse) return false;
      if (query.status && row.usage_status !== query.status) return false;
      if (teamId !== undefined && row.team_id !== teamId) return false;
      return true;
    });
  },
  insert(input: NewSparePartUsage): SparePartUsage {
    const row: SparePartUsage = {
      id: nextId(seed.sparePartUsage),
      usage_status: "PENDING",
      requested_at: timestamp(),
      approved_by: "",
      approved_at: "",
      reject_reason: "",
      stock_after_approval: null,
      shortage_quantity: null,
      ...input
    } as SparePartUsage;
    seed.sparePartUsage.push(row);
    return row;
  },
  saveDecision(
    row: SparePartUsage,
    patch: {
      usage_status: PartUsageStatus;
      approved_by: string;
      approved_at: string;
      reject_reason?: string;
      stock_after_approval?: number | null;
      shortage_quantity?: number | null;
    }
  ): SparePartUsage {
    Object.assign(row, patch);
    return row;
  }
};
