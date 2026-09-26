import { seed } from "../seed";
import type { StockLog } from "../models/StockLog";

const rows: StockLog[] = structuredClone(seed.stockLog) as unknown as StockLog[];

export const stockLogRepository = {
  findAll(): StockLog[] {
    return [...rows].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  },

  insert(log: StockLog): StockLog {
    rows.unshift(log);
    return log;
  },

  nextId(): number {
    return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  }
};
