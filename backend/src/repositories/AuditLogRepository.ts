import { seed } from "../seed";
import type { AuditLog } from "../models/AuditLog";

const rows: AuditLog[] = structuredClone(seed.auditLog) as unknown as AuditLog[];

export const auditLogRepository = {
  findAll(): AuditLog[] {
    return [...rows].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  },

  insert(log: AuditLog): AuditLog {
    rows.unshift(log);
    return log;
  },

  nextId(): number {
    return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  }
};
