import { sparePartUsageRepository } from "../repositories/SparePartUsageRepository";
import { sparePartStockRepository } from "../repositories/SparePartStockRepository";
import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { auditLogService } from "./AuditLogService";
import { PartUsageStatusText, PART_USAGE_STATUS } from "../constants/PartUsageStatus";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { badRequest, forbidden, notFound } from "../errors/AppError";
import type { SparePartUsage, SparePartUsageView } from "../models/SparePartUsage";
import type { AuthUser, SparePartUsageQuery } from "../types/SparePartUsagePayload";

const fill = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));

const toView = (row: SparePartUsage): SparePartUsageView => {
  const stock = sparePartStockRepository.findByLocation({
    warehouse_name: row.warehouse_name,
    part_code: row.part_code
  });
  const availableQuantity = stock?.available_quantity ?? 0;
  return {
    ...row,
    available_quantity: availableQuantity,
    stock_short: Math.max(row.quantity - availableQuantity, 0)
  };
};

export interface DecisionResult {
  record: SparePartUsageView;
  warning?: string;
}

export const sparePartUsageService = {
  listWarehouses: () => sparePartStockRepository.listWarehouses(),

  /**
   * 列表：仓管看全部并可按工单/仓库/状态筛选；班组长只能看本组；
   * 审计员只读。列表实时回填可用库存与缺口，供批准前核对。
   */
  list(user: AuthUser, query: SparePartUsageQuery): SparePartUsageView[] {
    if (query.status && !PART_USAGE_STATUS.includes(query.status as (typeof PART_USAGE_STATUS)[number])) {
      throw badRequest("VALIDATION_FAILED", fill(ERROR_MESSAGES.VALIDATION_FAILED, { field: `状态仅支持 ${PART_USAGE_STATUS.join("/")}` }));
    }
    const teamId = user.role === "TEAM_LEADER" ? user.teamId : undefined;
    return sparePartUsageRepository
      .filter(query, teamId)
      .map(toView)
      .sort((a, b) => (a.requested_at < b.requested_at ? 1 : -1));
  },

  /** 班组长为本组工单提交备件申请（创建即进入待审批） */
  apply(user: AuthUser, payload: Record<string, unknown>): SparePartUsageView {
    const ticketId = Number(payload.ticket_id);
    const partCode = String(payload.part_code ?? "").trim();
    const partName = String(payload.part_name ?? "").trim();
    const quantity = Number(payload.quantity);
    const warehouseName = String(payload.warehouse_name ?? "").trim();

    if (!Number.isInteger(ticketId) || !partCode || !partName || !warehouseName) {
      throw badRequest("VALIDATION_FAILED", fill(ERROR_MESSAGES.VALIDATION_FAILED, { field: "工单/备件编码/名称/仓库" }));
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw badRequest("VALIDATION_FAILED", fill(ERROR_MESSAGES.VALIDATION_FAILED, { field: "申请数量必须为正整数" }));
    }

    const ticket = repairTicketRepository.findById(ticketId);
    if (!ticket) {
      throw badRequest("VALIDATION_FAILED", fill(ERROR_MESSAGES.UNKNOWN_TICKET, { ticketId }));
    }
    // 班组长只能为本组工单提交；组间越权直接说明原因
    if (user.role === "TEAM_LEADER" && ticket.team_id !== user.teamId) {
      throw forbidden(fill(ERROR_MESSAGES.TEAM_SCOPE_DENIED, { teamId: user.teamId ?? "" }));
    }

    // 仓库中没有该备件编码时，让班组长改选仓库/编码，而不是凭空批
    if (!sparePartStockRepository.findByLocation({ warehouse_name: warehouseName, part_code: partCode })) {
      throw badRequest("VALIDATION_FAILED", fill(ERROR_MESSAGES.UNKNOWN_PART, { warehouse: warehouseName, partCode }));
    }

    const row = sparePartUsageRepository.insert({
      ticket_id: ticketId,
      team_id: ticket.team_id,
      part_code: partCode,
      part_name: partName,
      quantity,
      warehouse_name: warehouseName,
      requested_by: user.name
    });
    auditLogService.write(user, LOG_TEMPLATES.SparePartUsage[0], "SparePartUsage", row.id, `工单${ticketId}申请${partCode}×${quantity}（${warehouseName}）`);
    return toView(row);
  },

  /**
   * 仓管批准：批准前核对申请量与可用库存。
   * 库存不足 -> 标记缺口、记录保留在待审批、不扣库存；
   * 库存充足 -> 扣减库存，状态转已批准，写入审批人与剩余量。
   */
  approve(user: AuthUser, id: number): DecisionResult {
    const row = sparePartUsageRepository.findById(id);
    if (!row) {
      throw notFound("NOT_FOUND", fill(ERROR_MESSAGES.NOT_FOUND, { entity: "备件领用记录", id }));
    }
    if (row.usage_status !== "PENDING") {
      throw badRequest("APPROVAL_STATE_INVALID", fill(ERROR_MESSAGES.APPROVAL_STATE_INVALID, { status: PartUsageStatusText[row.usage_status] }));
    }

    const stock = sparePartStockRepository.findByLocation({ warehouse_name: row.warehouse_name, part_code: row.part_code });
    const available = stock?.available_quantity ?? 0;

    if (available < row.quantity) {
      const shortage = row.quantity - available;
      // 库存不足不是最终结论：只标记缺口，记录保留待审批，不写审批人/不扣库存
      sparePartUsageRepository.saveDecision(row, {
        usage_status: "PENDING",
        approved_by: row.approved_by,
        approved_at: row.approved_at,
        shortage_quantity: shortage,
        stock_after_approval: null
      });
      auditLogService.write(
        user,
        LOG_TEMPLATES.SparePartUsage[3],
        "SparePartUsage",
        row.id,
        `工单${row.ticket_id}的${row.part_code}库存不足：申请${row.quantity}/可用${available}/缺${shortage}，保留待审批`
      );
      return {
        record: toView(row),
        warning: fill(ERROR_MESSAGES.STOCK_SHORTAGE, { shortage })
      };
    }

    const remaining = sparePartStockRepository.deduct(
      { warehouse_name: row.warehouse_name, part_code: row.part_code },
      row.quantity
    );
    sparePartUsageRepository.saveDecision(row, {
      usage_status: "APPROVED",
      approved_by: user.name,
      approved_at: new Date().toISOString(),
      reject_reason: "",
      stock_after_approval: remaining,
      shortage_quantity: null
    });
    auditLogService.write(
      user,
      LOG_TEMPLATES.SparePartUsage[1],
      "SparePartUsage",
      row.id,
      `批准工单${row.ticket_id}的${row.part_code}×${row.quantity}出库，库存余量${remaining}`
    );
    return { record: toView(row) };
  },

  /** 仓管驳回：驳回原因必填，驳回不扣库存 */
  reject(user: AuthUser, id: number, reason: string): SparePartUsageView {
    const trimmed = reason?.trim() ?? "";
    if (!trimmed) {
      throw badRequest("REASON_REQUIRED", ERROR_MESSAGES.REASON_REQUIRED);
    }
    const row = sparePartUsageRepository.findById(id);
    if (!row) {
      throw notFound("NOT_FOUND", fill(ERROR_MESSAGES.NOT_FOUND, { entity: "备件领用记录", id }));
    }
    if (row.usage_status !== "PENDING") {
      throw badRequest("APPROVAL_STATE_INVALID", fill(ERROR_MESSAGES.APPROVAL_STATE_INVALID, { status: PartUsageStatusText[row.usage_status] }));
    }

    sparePartUsageRepository.saveDecision(row, {
      usage_status: "REJECTED",
      approved_by: user.name,
      approved_at: new Date().toISOString(),
      reject_reason: trimmed,
      stock_after_approval: null,
      shortage_quantity: null
    });
    auditLogService.write(
      user,
      LOG_TEMPLATES.SparePartUsage[2],
      "SparePartUsage",
      row.id,
      `驳回工单${row.ticket_id}的${row.part_code}×${row.quantity}，原因：${trimmed}`
    );
    return toView(row);
  }
};
