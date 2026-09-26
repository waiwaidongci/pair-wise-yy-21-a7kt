import type { RequestHandler } from "express";
import { ROLE_TEXT } from "../constants/Roles";
import { forbidden, unauthorized } from "../utils/AppError";

type Action =
  | "usage:list"
  | "usage:apply"
  | "usage:approve"
  | "usage:reject"
  | "stock:list"
  | "stock-log:list"
  | "audit-log:list";

const ACTION_ALLOW: Record<Action, string[]> = {
  // 审计员只读、不能操作；仓管可审批；班组长只看本组并提交申请；调度员可旁观
  "usage:list": ["WAREHOUSE_KEEPER", "TEAM_LEADER", "AUDITOR", "DISPATCHER"],
  "usage:apply": ["TEAM_LEADER"],
  "usage:approve": ["WAREHOUSE_KEEPER"],
  "usage:reject": ["WAREHOUSE_KEEPER"],
  "stock:list": ["WAREHOUSE_KEEPER", "TEAM_LEADER", "AUDITOR", "DISPATCHER"],
  "stock-log:list": ["WAREHOUSE_KEEPER", "AUDITOR", "DISPATCHER"],
  "audit-log:list": ["AUDITOR", "DISPATCHER", "WAREHOUSE_KEEPER"]
};

// 越权时直接说明原因（角色 + 允许范围）
const denyReason = (action: Action, role: string): string => {
  const allowText = ACTION_ALLOW[action].map((r) => ROLE_TEXT[r as keyof typeof ROLE_TEXT]).join("、");
  const roleText = ROLE_TEXT[role as keyof typeof ROLE_TEXT] ?? role;
  const reasonMap: Record<Action, string> = {
    "usage:list": `「${roleText}」无权查看备件审批台，允许角色：${allowText}`,
    "usage:apply": `仅班组长可提交工单材料申请，当前身份为「${roleText}」`,
    "usage:approve": `仅仓管可批准备件申请，当前身份为「${roleText}」，不能操作`,
    "usage:reject": `仅仓管可驳回备件申请（需填写原因），当前身份为「${roleText}」，不能操作`,
    "stock:list": `「${roleText}」无权查看备件库存，允许角色：${allowText}`,
    "stock-log:list": `「${roleText}」无权查看库存流水，允许角色：${allowText}`,
    "audit-log:list": `「${roleText}」无权查看审计日志，允许角色：${allowText}`
  };
  return reasonMap[action];
};

// RBAC 中间件：在路由上按动作声明允许角色
export const rbacMiddleware = (action: Action): RequestHandler => (req, _res, next) => {
  if (!req.user) {
    next(unauthorized());
    return;
  }
  if (!ACTION_ALLOW[action].includes(req.user.role)) {
    next(forbidden(denyReason(action, req.user.role)));
    return;
  }
  next();
};
