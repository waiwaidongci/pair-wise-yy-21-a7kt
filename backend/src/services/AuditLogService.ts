import { auditLogRepository } from "../repositories/AuditLogRepository";
import type { AuditLog } from "../models/AuditLog";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { toAuditTarget } from "../utils/formatters";

// 审计日志服务：所有写操作通过这里留痕
export const auditLogService = {
  list(): AuditLog[] {
    return auditLogRepository.findAll();
  },

  write(params: {
    actor: { id: number; name: string; role: string };
    action: (typeof LOG_TEMPLATES)[keyof typeof LOG_TEMPLATES][number] | string;
    targetType: string;
    targetId: string | number;
    detail: string;
  }): AuditLog {
    return auditLogRepository.insert({
      id: auditLogRepository.nextId(),
      actor_id: params.actor.id,
      actor_name: params.actor.name,
      actor_role: params.actor.role,
      action: params.action,
      target_type: params.targetType,
      target_id: String(params.targetId),
      detail: params.detail,
      created_at: new Date().toISOString()
    });
  },

  target: toAuditTarget
};
