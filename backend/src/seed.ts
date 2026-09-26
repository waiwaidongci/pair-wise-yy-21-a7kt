import type { PartUsageStatus } from "./constants/PartUsageStatus";
import type { Role } from "./constants/Role";
import type { AuthUser } from "./types/SparePartUsagePayload";
import type { AuditLog } from "./models/AuditLog";
import type { SparePartStock } from "./models/SparePartStock";
import type { SparePartUsage } from "./models/SparePartUsage";

const now = () => new Date().toISOString();

interface SeedUser extends AuthUser {}

/** 登录种子用户：调度员 / 班组长（绑定班组）/ 仓管 / 审计员 */
export const users: SeedUser[] = [
  { id: 1, name: "王调度", role: "DISPATCHER" as Role },
  { id: 11, name: "李班长", role: "TEAM_LEADER" as Role, teamId: 1 },
  { id: 12, name: "赵班长", role: "TEAM_LEADER" as Role, teamId: 2 },
  { id: 13, name: "孙班长", role: "TEAM_LEADER" as Role, teamId: 3 },
  { id: 21, name: "陈仓管", role: "WAREHOUSE_KEEPER" as Role },
  { id: 31, name: "周审计", role: "AUDITOR" as Role }
];

export const seed = {
  users,
  gridAsset: [
    { id: 1, asset_code: "ASSET-001", asset_type: "VOLTAGE_LOW", feeder_line: "10kV 城东线", voltage_level: "MEDIUM", location_desc: "城东分支#01 杆", health_status: "WATCH", owner_team_id: 1 },
    { id: 2, asset_code: "ASSET-002", asset_type: "TRIP", feeder_line: "10kV 滨河线", voltage_level: "MEDIUM", location_desc: "滨河花园环网柜", health_status: "DEGRADED", owner_team_id: 2 },
    { id: 3, asset_code: "ASSET-003", asset_type: "EQUIPMENT_DAMAGE", feeder_line: "10kV 工业园线", voltage_level: "HIGH", location_desc: "工业园 2# 配电室", health_status: "DANGEROUS", owner_team_id: 3 }
  ],
  faultReport: [
    { id: 1, reporter_name: "张先生", phone: "13800000001", asset_id: 1, fault_type: "VOLTAGE_LOW", address_desc: "城东村 3 组", severity: "一般", report_channel: "电话", status: "ASSIGNED" },
    { id: 2, reporter_name: "滨河物业", phone: "13800000002", asset_id: 2, fault_type: "TRIP", address_desc: "滨河花园配电房", severity: "紧急", report_channel: "App", status: "ARRIVED" },
    { id: 3, reporter_name: "厂务刘工", phone: "13800000003", asset_id: 3, fault_type: "EQUIPMENT_DAMAGE", address_desc: "工业园 2# 配电室", severity: "紧急", report_channel: "电话", status: "WAIT_DISPATCH" }
  ],
  repairTicket: [
    { id: 101, fault_report_id: 1, team_id: 1, dispatcher_id: 1, priority: "高", status: "REPAIRING", assigned_at: "2026-09-25T08:30:00Z", restored_at: "" },
    { id: 102, fault_report_id: 2, team_id: 2, dispatcher_id: 1, priority: "高", status: "REPAIRING", assigned_at: "2026-09-25T09:10:00Z", restored_at: "" },
    { id: 103, fault_report_id: 1, team_id: 1, dispatcher_id: 1, priority: "中", status: "RESTORED", assigned_at: "2026-09-20T02:00:00Z", restored_at: "2026-09-20T05:20:00Z" },
    { id: 201, fault_report_id: 3, team_id: 3, dispatcher_id: 1, priority: "低", status: "CLOSED", assigned_at: "2026-09-18T03:00:00Z", restored_at: "2026-09-18T06:00:00Z" }
  ],
  crew: [
    { id: 1, name: "城东抢修一班", leader_id: 11, skill_tags: "架空线,配电房", duty_status: "BUSY", current_ticket_id: 101, contact_phone: "13900000001" },
    { id: 2, name: "滨河抢修二班", leader_id: 12, skill_tags: "电缆,环网柜", duty_status: "BUSY", current_ticket_id: 102, contact_phone: "13900000002" },
    { id: 3, name: "园区抢修三班", leader_id: 13, skill_tags: "配电室,高压试验", duty_status: "OFF", current_ticket_id: 201, contact_phone: "13900000003" }
  ],
  sparePartStock: [
    { id: 1, warehouse_name: "中心仓库", part_code: "SP-1001", part_name: "真空断路器 ZW32-12", available_quantity: 5, unit: "台" },
    { id: 2, warehouse_name: "中心仓库", part_code: "SP-1002", part_name: "跌落式熔断器 PRWG2-12", available_quantity: 20, unit: "组" },
    { id: 3, warehouse_name: "城东仓库", part_code: "SP-1003", part_name: "绝缘导线 JKLYJ-120", available_quantity: 50, unit: "米" },
    { id: 4, warehouse_name: "城东仓库", part_code: "SP-1004", part_name: "低压避雷器 HY1.5W", available_quantity: 8, unit: "只" },
    { id: 5, warehouse_name: "中心仓库", part_code: "SP-1005", part_name: "铜接线端子 DT-120", available_quantity: 100, unit: "个" }
  ] as SparePartStock[],
  sparePartUsage: [
    {
      id: 1, ticket_id: 101, team_id: 1, part_code: "SP-1001", part_name: "真空断路器 ZW32-12",
      quantity: 2, warehouse_name: "中心仓库", usage_status: "PENDING" as PartUsageStatus,
      requested_by: "李班长", requested_at: "2026-09-25T10:00:00Z",
      approved_by: "", approved_at: "", reject_reason: "", stock_after_approval: null, shortage_quantity: null
    },
    {
      id: 2, ticket_id: 101, team_id: 1, part_code: "SP-1002", part_name: "跌落式熔断器 PRWG2-12",
      quantity: 30, warehouse_name: "中心仓库", usage_status: "PENDING" as PartUsageStatus,
      requested_by: "李班长", requested_at: "2026-09-25T10:02:00Z",
      approved_by: "", approved_at: "", reject_reason: "", stock_after_approval: null, shortage_quantity: null
    },
    {
      id: 3, ticket_id: 102, team_id: 2, part_code: "SP-1003", part_name: "绝缘导线 JKLYJ-120",
      quantity: 40, warehouse_name: "城东仓库", usage_status: "PENDING" as PartUsageStatus,
      requested_by: "赵班长", requested_at: "2026-09-25T10:20:00Z",
      approved_by: "", approved_at: "", reject_reason: "", stock_after_approval: null, shortage_quantity: null
    },
    {
      id: 4, ticket_id: 102, team_id: 2, part_code: "SP-1001", part_name: "真空断路器 ZW32-12",
      quantity: 8, warehouse_name: "中心仓库", usage_status: "PENDING" as PartUsageStatus,
      requested_by: "赵班长", requested_at: "2026-09-25T10:25:00Z",
      approved_by: "", approved_at: "", reject_reason: "", stock_after_approval: null, shortage_quantity: null
    },
    {
      id: 5, ticket_id: 103, team_id: 1, part_code: "SP-1005", part_name: "铜接线端子 DT-120",
      quantity: 60, warehouse_name: "中心仓库", usage_status: "APPROVED" as PartUsageStatus,
      requested_by: "李班长", requested_at: "2026-09-20T03:00:00Z",
      approved_by: "陈仓管", approved_at: "2026-09-20T03:10:00Z", reject_reason: "", stock_after_approval: 40, shortage_quantity: null
    },
    {
      id: 6, ticket_id: 201, team_id: 3, part_code: "SP-1004", part_name: "低压避雷器 HY1.5W",
      quantity: 2, warehouse_name: "城东仓库", usage_status: "REJECTED" as PartUsageStatus,
      requested_by: "孙班长", requested_at: "2026-09-18T04:00:00Z",
      approved_by: "陈仓管", approved_at: "2026-09-18T04:08:00Z", reject_reason: "申请型号与工单故障类型不符，请核对铭牌后重新提交",
      stock_after_approval: null, shortage_quantity: null
    }
  ] as SparePartUsage[],
  auditLog: [] as AuditLog[]
};

export const nextId = (rows: Array<{ id: number }>) => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
export const timestamp = now;
