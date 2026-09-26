// 审计日志：写操作由 auditLogMiddleware / service 落库
export interface AuditLog {
  id: number;
  actor_id: number;
  actor_name: string;
  actor_role: string;
  action: string;
  target_type: string;
  target_id: string;
  detail: string;
  created_at: string;
}
