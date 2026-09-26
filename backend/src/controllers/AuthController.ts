import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/AuthService";

export const authController = {
  login(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number((req.body as { user_id?: number } | undefined)?.user_id);
      if (!userId) {
        return res.status(400).json({ code: "VALIDATION_FAILED", message: "缺少 user_id" });
      }
      res.json(authService.login(userId));
    } catch (err) {
      next(err);
    }
  },
  users: (_req: Request, res: Response) => res.json(authService.listUsers())
};
