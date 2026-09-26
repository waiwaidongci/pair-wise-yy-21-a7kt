import { Router } from "express";
import { auditLogService } from "../services/AuditLogService";
import { allowRoles } from "../middlewares/rbacMiddleware";

const router = Router();

// 操作日志：审计员与仓管可查，班组长不开放
router.get("/", allowRoles(["AUDITOR", "WAREHOUSE_KEEPER"], "操作日志仅对审计员和仓管开放"), (_req, res) => {
  res.json(auditLogService.list());
});

export default router;
