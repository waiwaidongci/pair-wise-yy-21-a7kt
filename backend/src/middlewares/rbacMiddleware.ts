import type { RequestHandler } from "express";
import type { Role } from "../constants/Role";
import { RoleText } from "../constants/Role";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { forbidden } from "../errors/AppError";

const fill = (template: string, vars: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");

/**
 * RBAC：校验登录角色是否在允许名单内。
 * 越权请求不吞错、不静默放行，直接返回 403 并写明原因。
 */
export const allowRoles = (roles: Role[], reason = "该操作不在当前角色的权限范围内"): RequestHandler => {
  return (req, _res, next) => {
    const user = req.user;
    if (!user) {
      return next(forbidden(fill(ERROR_MESSAGES.RBAC_DENIED, { reason, role: "未登录" })));
    }
    if (!roles.includes(user.role)) {
      return next(forbidden(fill(ERROR_MESSAGES.RBAC_DENIED, { reason, role: RoleText[user.role] ?? user.role })));
    }
    next();
  };
};

/** 语义化别名，供路由按动作声明权限。 */
export const rbacMiddleware = allowRoles;
