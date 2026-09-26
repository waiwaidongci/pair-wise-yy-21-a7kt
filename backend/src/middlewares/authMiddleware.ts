import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { userRepository } from "../repositories/UserRepository";
import { ROLES } from "../constants/Roles";
import type { AuthUser } from "../models/AuthUser";
import { unauthorized } from "../utils/AppError";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// 本地开发联调：x-user-id 直连种子账号；也支持 x-role 直接指定角色
const userFromHeaders = (req: Parameters<RequestHandler>[0]): AuthUser | undefined => {
  const headerId = req.header("x-user-id");
  if (headerId) {
    const user = userRepository.findById(Number(headerId));
    if (user) return user;
  }
  const role = req.header("x-role");
  if (role && (ROLES as Record<string, string>)[role]) {
    const nameHeader = req.header("x-user-name");
    return {
      id: Number(headerId ?? 0),
      name: nameHeader ?? role,
      role,
      team_id: role === ROLES.TEAM_LEADER ? Number(req.header("x-team-id") ?? 1) : null
    };
  }
  return undefined;
};

// 认证中间件：JWT 优先，开发期回退 x-user-id / x-role 请求头
export const authMiddleware: RequestHandler = (req, res, next) => {
  try {
    const authHeader = req.header("authorization");
    let user: AuthUser | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice("Bearer ".length);
      const payload = jwt.verify(token, config.jwtSecret) as { sub?: string };
      if (payload.sub) user = userRepository.findById(Number(payload.sub));
    } else {
      user = userFromHeaders(req);
    }

    if (!user) {
      throw unauthorized();
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
