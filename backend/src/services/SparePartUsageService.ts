import { sparePartUsageRepository } from "../repositories/SparePartUsageRepository";
import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { crewRepository } from "../repositories/CrewRepository";
import { sparePartStockService } from "./SparePartStockService";
import { auditLogService } from "./AuditLogService";
import { createSparePartUsageDto, buildUsageView } from "../constructors/SparePartUsageDtoFactory";
import type { SparePartUsageView } from "../constructors/SparePartUsageDtoFactory";
import type {
  SparePartUsageQuery,
  CreateUsagePayload
} from "../types/SparePartUsagePayload";
import { PART_USAGE_STATUS } from "../constants/PartUsageStatus";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { badRequest, notFound, conflict, forbidden } from "../utils/AppError";
import type { AuthUser } from "../models/AuthUser";
import type { SparePartUsage } from "../models/SparePartUsage";

const teamNameOf = (teamId: number) => crewRepository.findAll().find((crew) => crew.id === teamId)?.name;

// service 层异常：业务校验失败直接抛 AppError，controller 再包装一次后交由全局中间件
export const sparePartUsageService = {
  // 审批台列表：仓管/调度/审计看全部，班组长强制只看本组
  list(rawQuery: SparePartUsageQuery, user: AuthUser): SparePartUsageView[] {
    const query: SparePartUsageQuery = {
      ticket_id: rawQuery.ticket_id,
      warehouse_name: rawQuery.warehouse_name,
      usage_status: rawQuery.usage_status
    };
    if (user.role === "TEAM_LEADER") {
      if (!user.team_id) throw forbidden("当前账号未绑定班组，无法查看本组申请");
      query.team_id = user.team_id;
    }
    return sparePartUsageRepository.findAll(query).map((row) =>
      buildUsageView(
        row,
        sparePartStockService.get(row.warehouse_name, row.part_code),
        teamNameOf(row.team_id)
      )
    );
  },

  // 班组长提交工单材料申请
  apply(payload: CreateUsagePayload, user: AuthUser): SparePartUsageView {
    const ticketId = Number(payload.ticket_id);
    const quantity = Number(payload.quantity);
    const warehouseName = String(payload.warehouse_name ?? "").trim();
    const partCode = String(payload.part_code ?? "").trim();
    const partName = String(payload.part_name ?? "").trim();

    if (!Number.isInteger(ticketId) || ticketId <= 0) throw badRequest(ERROR_MESSAGES.VALIDATION_FAILED, "VALIDATION_FAILED", "工单编号无效");
    if (!partCode) throw badRequest(ERROR_MESSAGES.VALIDATION_FAILED, "VALIDATION_FAILED", "备件编码不能为空");
    if (!partName) throw badRequest(ERROR_MESSAGES.VALIDATION_FAILED, "VALIDATION_FAILED", "备件名称不能为空");
    if (!warehouseName) throw badRequest(ERROR_MESSAGES.VALIDATION_FAILED, "VALIDATION_FAILED", "请选择领料仓库");
    if (!Number.isInteger(quantity) || quantity <= 0) throw badRequest(ERROR_MESSAGES.VALIDATION_FAILED, "VALIDATION_FAILED", "申请数量必须为正整数");

    const ticket = repairTicketRepository.findById(ticketId);
    if (!ticket) throw notFound(`工单 ${ticketId} 不存在`);
    if (ticket.team_id !== user.team_id) {
      throw forbidden(`工单 ${ticketId} 不属于本班组，不能代为申请备件`);
    }

    const now = new Date().toISOString();
    const row = sparePartUsageRepository.insert(
      createSparePartUsageDto({
        id: sparePartUsageRepository.nextId(),
        ticket_id: ticketId,
        team_id: ticket.team_id,
        applicant_id: user.id,
        applicant_name: user.name,
        part_code: partCode,
        part_name: partName,
        quantity,
        warehouse_name: warehouseName,
        usage_status: PART_USAGE_STATUS.PENDING,
        created_at: now,
        updated_at: now
      })
    );

    auditLogService.write({
      actor: { id: user.id, name: user.name, role: user.role },
      action: LOG_TEMPLATES.SparePartUsage[4],
      targetType: "SparePartUsage",
      targetId: row.id,
      detail: `提交工单 ${ticketId} 备件申请：${partName} x${quantity}（${warehouseName}）`
    });

    return buildUsageView(row, sparePartStockService.get(warehouseName, partCode), teamNameOf(row.team_id));
  },

  // 仓管批准：先核对申请量与可用库存，不足则标明缺多少并保留待审批；充足则扣减库存
  approve(id: number, user: AuthUser): SparePartUsageView {
    const row = sparePartUsageRepository.findById(id);
    if (!row) throw notFound(`备件申请 ${id} 不存在`);
    if (row.usage_status !== PART_USAGE_STATUS.PENDING) {
      throw conflict(ERROR_MESSAGES.STATUS_CONFLICT, "STATUS_CONFLICT", `该申请当前为「${row.usage_status}」`);
    }

    const { available, shortage } = sparePartStockService.check(
      row.warehouse_name,
      row.part_code,
      row.quantity
    );

    // 库存不足：记录缺量，保持待审批，等待补货或协调
    if (shortage > 0) {
      const marked = sparePartUsageRepository.update(id, { shortage_quantity: shortage });
      auditLogService.write({
        actor: { id: user.id, name: user.name, role: user.role },
        action: LOG_TEMPLATES.SparePartUsage[5],
        targetType: "SparePartUsage",
        targetId: id,
        detail: `批准受阻：工单 ${row.ticket_id} ${row.part_name} 申请 ${row.quantity} 件，可用 ${available} 件，缺 ${shortage} 件，保留待审批`
      });
      throw conflict(ERROR_MESSAGES.STOCK_SHORTAGE, "STOCK_SHORTAGE", `可用库存 ${available} 件，尚缺 ${shortage} 件，已保留待审批`);
    }

    // 库存充足：扣减库存，并把审批结果、库存余量、审批人留在记录上
    const { stock } = sparePartStockService.deductForApproval(user, {
      warehouse_name: row.warehouse_name,
      part_code: row.part_code,
      part_name: row.part_name,
      quantity: row.quantity,
      usage_id: id,
      ticket_id: row.ticket_id
    });

    const approved = sparePartUsageRepository.update(id, {
      usage_status: PART_USAGE_STATUS.APPROVED,
      approved_by: user.name,
      approver_id: user.id,
      approved_at: new Date().toISOString(),
      reject_reason: null,
      stock_remaining: stock.available_quantity,
      shortage_quantity: 0
    } as Partial<SparePartUsage>);

    auditLogService.write({
      actor: { id: user.id, name: user.name, role: user.role },
      action: LOG_TEMPLATES.SparePartUsage[5],
      targetType: "SparePartUsage",
      targetId: id,
      detail: `批准工单 ${row.ticket_id} 领用 ${row.part_name} x${row.quantity}，出库后余量 ${stock.available_quantity}，审批人 ${user.name}`
    });

    return buildUsageView(approved, stock, teamNameOf(approved.team_id));
  },

  // 仓管驳回：必须填写原因
  reject(id: number, reason: string, user: AuthUser): SparePartUsageView {
    const row = sparePartUsageRepository.findById(id);
    if (!row) throw notFound(`备件申请 ${id} 不存在`);
    if (row.usage_status !== PART_USAGE_STATUS.PENDING) {
      throw conflict(ERROR_MESSAGES.STATUS_CONFLICT, "STATUS_CONFLICT", `该申请当前为「${row.usage_status}」`);
    }
    const rejectReason = String(reason ?? "").trim();
    if (!rejectReason) {
      throw badRequest(ERROR_MESSAGES.REASON_REQUIRED, "REASON_REQUIRED");
    }

    const rejected = sparePartUsageRepository.update(id, {
      usage_status: PART_USAGE_STATUS.REJECTED,
      approved_by: user.name,
      approver_id: user.id,
      approved_at: new Date().toISOString(),
      reject_reason: rejectReason
    } as Partial<SparePartUsage>);

    auditLogService.write({
      actor: { id: user.id, name: user.name, role: user.role },
      action: LOG_TEMPLATES.SparePartUsage[6],
      targetType: "SparePartUsage",
      targetId: id,
      detail: `驳回工单 ${row.ticket_id} 备件申请，原因：${rejectReason}`
    });

    return buildUsageView(
      rejected,
      sparePartStockService.get(row.warehouse_name, row.part_code),
      teamNameOf(rejected.team_id)
    );
  }
};
