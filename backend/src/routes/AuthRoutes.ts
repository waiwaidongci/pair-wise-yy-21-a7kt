import { Router } from "express";
import { authController } from "../controllers/AuthController";

const router = Router();

// 登录签发 JWT；该接口本身不要求登录
router.post("/login", authController.login);
router.get("/me", authController.me);

export default router;
