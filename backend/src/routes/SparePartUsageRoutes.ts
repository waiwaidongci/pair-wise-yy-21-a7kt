import { Router } from "express";
import { sparePartUsageController } from "../controllers/SparePartUsageController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

// 审批台列表：工单/仓库/状态筛选在 controller 解析；班组长由 service 强制只看本组
router.get("/", rbacMiddleware("usage:list"), sparePartUsageController.list);
// 班组长提交工单材料申请
router.post("/", rbacMiddleware("usage:apply"), sparePartUsageController.create);
// 仓管批准（库存不足由 service 标明缺量并保留待审批）
router.post("/:id/approve", rbacMiddleware("usage:approve"), sparePartUsageController.approve);
// 仓管驳回，必须填写原因
router.post("/:id/reject", rbacMiddleware("usage:reject"), sparePartUsageController.reject);

export default router;
