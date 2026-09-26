import { Router } from "express";
import { sparePartStockController } from "../controllers/SparePartStockController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

router.get("/", rbacMiddleware("stock:list"), sparePartStockController.list);
router.get("/logs", rbacMiddleware("stock-log:list"), sparePartStockController.listLogs);

export default router;
