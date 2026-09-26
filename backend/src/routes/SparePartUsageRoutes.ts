import { Router } from "express";
import { sparePartUsageController } from "../controllers/SparePartUsageController";
import { allowRoles } from "../middlewares/rbacMiddleware";
import { sparePartUsageService } from "../services/SparePartUsageService";

const router = Router();

// 列表：仓管、班组长（只看本组在 service 内强制）、审计员（只读）可取
router.get(
  "/",
  allowRoles(["WAREHOUSE_KEEPER", "TEAM_LEADER", "AUDITOR"], "仅仓管、本班组组长和审计员可查看备件领用记录"),
  sparePartUsageController.list
);

// 仓管需要仓库/工单筛选项（工单列表复用既有接口，这里提供仓库下拉）
router.get(
  "/warehouses",
  allowRoles(["WAREHOUSE_KEEPER", "TEAM_LEADER", "AUDITOR"], "无权读取仓库列表"),
  (_req, res) => res.json(sparePartUsageService.listWarehouses())
);

// 提交申请：仅班组长（且必须是本组工单，越权在 service 拦截）
router.post(
  "/",
  allowRoles(["TEAM_LEADER"], "只有班组长可以提交工单备件申请，请到抢修工单页由班组长发起"),
  sparePartUsageController.apply
);

// 批准 / 驳回：仅仓管；审计员只读、班组长无权审批，越权直接 403
router.post(
  "/:id/approve",
  allowRoles(["WAREHOUSE_KEEPER"], "只有仓管可以批准备件领用申请，审计员为只读角色"),
  sparePartUsageController.approve
);
router.post(
  "/:id/reject",
  allowRoles(["WAREHOUSE_KEEPER"], "只有仓管可以驳回备件领用申请，驳回时必须填写原因"),
  sparePartUsageController.reject
);

export default router;
