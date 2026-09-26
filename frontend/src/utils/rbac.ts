import type { AuthUser } from "../types/Auth";

// 越权原因在前端展示层复用：按钮显隐 + 文案提示双保险
export const canApply = (user: AuthUser | null) => user?.role === "TEAM_LEADER";
export const canApprove = (user: AuthUser | null) => user?.role === "WAREHOUSE_KEEPER";
export const canReject = (user: AuthUser | null) => user?.role === "WAREHOUSE_KEEPER";
export const canViewStockLogs = (user: AuthUser | null) =>
  user?.role === "WAREHOUSE_KEEPER" || user?.role === "AUDITOR" || user?.role === "DISPATCHER";
export const isReadOnlyRole = (user: AuthUser | null) => user?.role === "AUDITOR";

export const DENY_REASON: Record<string, string> = {
  apply: "仅班组长可提交工单材料申请",
  approve: "仅仓管可批准备件申请",
  reject: "仅仓管可驳回备件申请（需填写原因）",
  auditor: "审计员为只读角色，不能进行任何审批/申请操作"
};
