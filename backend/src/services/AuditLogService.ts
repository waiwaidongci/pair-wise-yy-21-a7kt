import type { AuthUser } from "../types/SparePartUsagePayload";
import { auditLogRepository } from "../repositories/AuditLogRepository";

export const auditLogService = {
  list: () => auditLogRepository.findAll(),
  write(user: AuthUser, action: string, targetType: string, targetId: string | number, detail: string) {
    return auditLogRepository.record({
      actor: `${user.name}(${user.role})`,
      action,
      target_type: targetType,
      target_id: String(targetId),
      detail
    });
  }
};
