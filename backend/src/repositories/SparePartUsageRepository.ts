import { seed } from "../seed";
import type { SparePartUsage } from "../models/SparePartUsage";
import type { SparePartUsageQuery } from "../types/SparePartUsagePayload";

// 内存数据副本：运行期写操作在副本上进行，避免直接改写只读种子
const rows: SparePartUsage[] = structuredClone(seed.sparePartUsage) as unknown as SparePartUsage[];

export const sparePartUsageRepository = {
  findAll(query: SparePartUsageQuery = {}): SparePartUsage[] {
    return rows
      .filter((row) => (query.ticket_id == null ? true : row.ticket_id === query.ticket_id))
      .filter((row) =>
        query.warehouse_name ? row.warehouse_name === query.warehouse_name : true
      )
      .filter((row) => (query.usage_status ? row.usage_status === query.usage_status : true))
      // 班组长只能看本组
      .filter((row) => (query.team_id == null ? true : row.team_id === query.team_id))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  },

  findById(id: number): SparePartUsage | undefined {
    return rows.find((row) => row.id === id);
  },

  insert(row: SparePartUsage): SparePartUsage {
    rows.unshift(row);
    return row;
  },

  update(id: number, patch: Partial<SparePartUsage>): SparePartUsage {
    const row = this.findById(id);
    if (!row) throw new Error(`SparePartUsage ${id} not found`);
    Object.assign(row, patch, { updated_at: new Date().toISOString() });
    return row;
  },

  nextId(): number {
    return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  }
};
