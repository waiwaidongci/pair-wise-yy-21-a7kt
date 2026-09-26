/** 操作审计日志：所有写操作（申请/批准/驳回）均落一条 */
export interface AuditLog {
  id: number;
  actor: string;
  action: string;
  target_type: string;
  target_id: string;
  detail: string;
  created_at: string;
}
