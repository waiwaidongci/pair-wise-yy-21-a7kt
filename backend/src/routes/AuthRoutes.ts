import { Router } from "express";
import { authController } from "../controllers/AuthController";

const router = Router();
router.post("/login", authController.login);
router.get("/users", authController.users);

export default router;
