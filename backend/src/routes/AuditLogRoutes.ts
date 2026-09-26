import { Router } from "express";
import { auditLogController } from "../controllers/AuditLogController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

router.get("/", rbacMiddleware("audit-log:list"), auditLogController.list);

export default router;
