import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { unauthorized } from "../errors/AppError";
import type { AuthUser } from "../types/SparePartUsagePayload";
import { seed } from "../seed";

/**
 * JWT 鉴权：前端通过 /api/auth/login 换取 token（种子用户），
 * 请求头 Authorization: Bearer <token>。本地联调也可用 x-user-id 直接模拟。
 */
export const authMiddleware: RequestHandler = (req, _res, next) => {
  try {
    const header = req.header("authorization");
    if (header?.startsWith("Bearer ")) {
      const payload = jwt.verify(header.slice(7), config.jwtSecret) as AuthUser;
      req.user = { id: payload.id, name: payload.name, role: payload.role, teamId: payload.teamId };
      return next();
    }
    const devUserId = Number(req.header("x-user-id"));
    if (devUserId) {
      const user = seed.users.find((item) => item.id === devUserId);
      if (user) {
        req.user = user;
        return next();
      }
    }
    throw unauthorized(ERROR_MESSAGES.AUTH_REQUIRED);
  } catch (err) {
    if (err instanceof Error && err.message === ERROR_MESSAGES.AUTH_REQUIRED) return next(err);
    next(unauthorized(ERROR_MESSAGES.AUTH_REQUIRED));
  }
};
