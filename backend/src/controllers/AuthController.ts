import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { userRepository } from "../repositories/UserRepository";
import { wrapController } from "./controllerHelpers";
import { badRequest } from "../utils/AppError";
import { ROLE_TEXT } from "../constants/Roles";

// 本地演示登录：无第三方认证，签发 JWT（前端切换角色时调用）
export const authController = {
  login: wrapController(async (req: Request, res: Response) => {
    const userId = Number(req.body?.user_id);
    const user = userRepository.findById(userId);
    if (!user) {
      throw badRequest("账号不存在，请使用种子账号（101/201/301/302/401）");
    }
    const token = jwt.sign({ sub: String(user.id), role: user.role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as jwt.SignOptions["expiresIn"]
    });
    res.json({
      token,
      user: { ...user, role_text: ROLE_TEXT[user.role as keyof typeof ROLE_TEXT] ?? user.role }
    });
  }),

  me: wrapController(async (req: Request, res: Response) => {
    res.json(req.user);
  })
};
