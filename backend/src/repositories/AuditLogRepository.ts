import { seed, nextId, timestamp } from "../seed";
import type { AuditLog } from "../models/AuditLog";

export const auditLogRepository = {
  findAll(): AuditLog[] {
    return [...seed.auditLog].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  },
  record(entry: Omit<AuditLog, "id" | "created_at">): AuditLog {
    const row: AuditLog = { id: nextId(seed.auditLog), created_at: timestamp(), ...entry };
    seed.auditLog.push(row);
    return row;
  }
};
