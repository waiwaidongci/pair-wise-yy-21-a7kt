import { Router } from "express";
import { sparePartStockRepository } from "../repositories/SparePartStockRepository";
import { allowRoles } from "../middlewares/rbacMiddleware";

const router = Router();

// 库存台账：仓管与班组长可查（班组长提交申请时选择仓库/备件），审计员同样只读可见
router.get(
  "/",
  allowRoles(["WAREHOUSE_KEEPER", "TEAM_LEADER", "AUDITOR"], "无权读取备件库存台账"),
  (_req, res) => {
    res.json(sparePartStockRepository.findAll());
  }
);

export default router;
