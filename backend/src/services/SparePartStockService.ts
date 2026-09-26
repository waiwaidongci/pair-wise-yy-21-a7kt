import { sparePartStockRepository } from "../repositories/SparePartStockRepository";
import { stockLogRepository } from "../repositories/StockLogRepository";
import type { SparePartStock } from "../models/SparePartStock";
import type { StockLog } from "../models/StockLog";
import { createStockLogDto } from "../constructors/StockLogDtoFactory";
import { STOCK_FLOW } from "../constants/StockFlow";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { auditLogService } from "./AuditLogService";
import type { AuthUser } from "../models/AuthUser";

export interface StockDeductInput {
  warehouse_name: string;
  part_code: string;
  part_name: string;
  quantity: number;
  usage_id: number;
  ticket_id: number;
}

export const sparePartStockService = {
  list(query: { warehouse_name?: string; part_code?: string } = {}): SparePartStock[] {
    return sparePartStockRepository.findAll(query);
  },

  get(warehouseName: string, partCode: string): SparePartStock | undefined {
    return sparePartStockRepository.find(warehouseName, partCode);
  },

  // 批准前核对：返回可用量与缺量（缺量 > 0 表示库存不足）
  check(warehouseName: string, partCode: string, quantity: number): { available: number; shortage: number } {
    const stock = sparePartStockRepository.find(warehouseName, partCode);
    const available = stock?.available_quantity ?? 0;
    return { available, shortage: Math.max(quantity - available, 0) };
  },

  listLogs(): StockLog[] {
    return stockLogRepository.findAll();
  },

  // 批准后扣减库存并写库存流水；调用方必须先 check，库存不足不得走到这里
  deductForApproval(user: AuthUser, input: StockDeductInput): { stock: SparePartStock; log: StockLog } {
    const stock = sparePartStockRepository.deduct(input.warehouse_name, input.part_code, input.quantity);
    const log = stockLogRepository.insert(
      createStockLogDto({
        id: stockLogRepository.nextId(),
        warehouse_name: input.warehouse_name,
        part_code: input.part_code,
        part_name: input.part_name,
        flow_type: STOCK_FLOW.OUTBOUND,
        change_quantity: -input.quantity,
        remaining_quantity: stock.available_quantity,
        usage_id: input.usage_id,
        ticket_id: input.ticket_id,
        operator_id: user.id,
        operator_name: user.name,
        remark: `工单 ${input.ticket_id} 备件申请批准出库`
      })
    );
    auditLogService.write({
      actor: { id: user.id, name: user.name, role: user.role },
      action: LOG_TEMPLATES.SparePartStock[2],
      targetType: "SparePartStock",
      targetId: `${input.warehouse_name}/${input.part_code}`,
      detail: `${input.warehouse_name} ${input.part_name} 出库 ${input.quantity} 件，余量 ${stock.available_quantity}`
    });
    return { stock, log };
  }
};
