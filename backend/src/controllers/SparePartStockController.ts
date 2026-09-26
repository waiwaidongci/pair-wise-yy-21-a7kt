import type { Request, Response } from "express";
import { sparePartStockService } from "../services/SparePartStockService";
import { wrapController } from "./controllerHelpers";

export const sparePartStockController = {
  list: wrapController(async (req: Request, res: Response) => {
    res.json(
      sparePartStockService.list({
        warehouse_name: typeof req.query.warehouse_name === "string" ? req.query.warehouse_name : undefined,
        part_code: typeof req.query.part_code === "string" ? req.query.part_code : undefined
      })
    );
  }),

  listLogs: wrapController(async (_req: Request, res: Response) => {
    res.json(sparePartStockService.listLogs());
  })
};
