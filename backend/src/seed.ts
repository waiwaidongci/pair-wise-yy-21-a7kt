import { PART_USAGE_STATUS } from "./constants/PartUsageStatus";
import { STOCK_FLOW } from "./constants/StockFlow";
import { ROLES } from "./constants/Roles";

// 本地种子数据：全部内存存储，禁止接入第三方 API
export const seed = {
  // 登录用户（JWT / x-role 头都指向这里的账号）
  user: [
    { id: 101, name: "王调度", role: ROLES.DISPATCHER, team_id: null },
    { id: 201, name: "李仓管", role: ROLES.WAREHOUSE_KEEPER, team_id: null },
    { id: 301, name: "张班长", role: ROLES.TEAM_LEADER, team_id: 1 },
    { id: 302, name: "赵班长", role: ROLES.TEAM_LEADER, team_id: 2 },
    { id: 401, name: "周审计", role: ROLES.AUDITOR, team_id: null }
  ],
  gridAsset: [
    { id: 1, asset_code: "ASS-10-001", asset_type: "OUTAGE", feeder_line: "10kV 东风线", voltage_level: "10kV", location_desc: "东风路 12 号环网柜", health_status: "NORMAL", owner_team_id: 1 },
    { id: 2, asset_code: "ASS-10-002", asset_type: "TRIP", feeder_line: "10kV 朝阳线", voltage_level: "10kV", location_desc: "朝阳小区 2 号箱变", health_status: "WATCH", owner_team_id: 2 },
    { id: 3, asset_code: "ASS-04-003", asset_type: "EQUIPMENT_DAMAGE", feeder_line: "0.4kV 和平支线", voltage_level: "0.4kV", location_desc: "和平村 3 组配变", health_status: "DEGRADED", owner_team_id: 3 }
  ],
  faultReport: [
    { id: 1, reporter_name: "刘先生", phone: "13800000001", asset_id: 1, fault_type: "OUTAGE", address_desc: "东风路沿线多户停电", severity: "HIGH", report_channel: "HOTLINE", status: "ASSIGNED" },
    { id: 2, reporter_name: "陈女士", phone: "13800000002", asset_id: 2, fault_type: "TRIP", address_desc: "朝阳小区频繁跳闸", severity: "MEDIUM", report_channel: "APP", status: "REPAIRING" },
    { id: 3, reporter_name: "赵师傅", phone: "13800000003", asset_id: 3, fault_type: "EQUIPMENT_DAMAGE", address_desc: "和平村配变异响", severity: "MEDIUM", report_channel: "ONSITE", status: "WAIT_DISPATCH" }
  ],
  repairTicket: [
    { id: 1, fault_report_id: 1, team_id: 1, dispatcher_id: 101, priority: "HIGH", status: "ASSIGNED", assigned_at: "2026-09-24T08:30:00Z", restored_at: null },
    { id: 2, fault_report_id: 2, team_id: 2, dispatcher_id: 101, priority: "MEDIUM", status: "REPAIRING", assigned_at: "2026-09-24T09:10:00Z", restored_at: null },
    { id: 3, fault_report_id: 3, team_id: 3, dispatcher_id: 101, priority: "MEDIUM", status: "WAIT_DISPATCH", assigned_at: null, restored_at: null },
    { id: 4, fault_report_id: 1, team_id: 1, dispatcher_id: 101, priority: "LOW", status: "ARRIVED", assigned_at: "2026-09-25T02:00:00Z", restored_at: null },
    { id: 5, fault_report_id: 2, team_id: 2, dispatcher_id: 101, priority: "LOW", status: "RESTORED", assigned_at: "2026-09-22T01:30:00Z", restored_at: "2026-09-22T05:20:00Z" }
  ],
  crew: [
    { id: 1, name: "东风抢修一班", leader_id: 301, skill_tags: "电缆,环网柜", duty_status: "ON_DUTY", current_ticket_id: 1, contact_phone: "13900000001" },
    { id: 2, name: "朝阳抢修二班", leader_id: 302, skill_tags: "箱变,断路器", duty_status: "ON_DUTY", current_ticket_id: 2, contact_phone: "13900000002" },
    { id: 3, name: "和平抢修三班", leader_id: null, skill_tags: "配变,低压", duty_status: "OFF_DUTY", current_ticket_id: null, contact_phone: "13900000003" }
  ],
  // 备件库存：按 仓库 + 备件编码 唯一
  sparePartStock: [
    { id: 1, warehouse_name: "中心库", part_code: "SP-1001", part_name: "低压电缆 YJV-4x35", available_quantity: 20, safety_quantity: 10, updated_at: "2026-09-20T06:00:00Z" },
    { id: 2, warehouse_name: "中心库", part_code: "SP-1002", part_name: "真空断路器 ZW32-12", available_quantity: 5, safety_quantity: 3, updated_at: "2026-09-20T06:00:00Z" },
    { id: 3, warehouse_name: "中心库", part_code: "SP-1003", part_name: "跌落式熔断器 RW12", available_quantity: 34, safety_quantity: 10, updated_at: "2026-09-20T08:00:00Z" },
    { id: 4, warehouse_name: "中心库", part_code: "SP-1004", part_name: "隔离开关 GW9-12", available_quantity: 0, safety_quantity: 2, updated_at: "2026-09-20T06:00:00Z" },
    { id: 5, warehouse_name: "东郊库", part_code: "SP-1001", part_name: "低压电缆 YJV-4x35", available_quantity: 8, safety_quantity: 5, updated_at: "2026-09-20T06:00:00Z" },
    { id: 6, warehouse_name: "东郊库", part_code: "SP-2001", part_name: "绝缘护套 35mm²", available_quantity: 60, safety_quantity: 20, updated_at: "2026-09-20T06:00:00Z" }
  ],
  sparePartUsage: [
    {
      id: 1, ticket_id: 1, team_id: 1, applicant_id: 301, applicant_name: "张班长",
      part_code: "SP-1001", part_name: "低压电缆 YJV-4x35", quantity: 10,
      warehouse_name: "中心库", usage_status: PART_USAGE_STATUS.PENDING,
      approved_by: "", approver_id: null, approved_at: null, reject_reason: null,
      stock_remaining: null, shortage_quantity: null,
      created_at: "2026-09-25T01:20:00Z", updated_at: "2026-09-25T01:20:00Z"
    },
    {
      id: 2, ticket_id: 2, team_id: 2, applicant_id: 302, applicant_name: "赵班长",
      part_code: "SP-1002", part_name: "真空断路器 ZW32-12", quantity: 8,
      warehouse_name: "中心库", usage_status: PART_USAGE_STATUS.PENDING,
      approved_by: "", approver_id: null, approved_at: null, reject_reason: null,
      stock_remaining: null, shortage_quantity: null,
      created_at: "2026-09-25T02:05:00Z", updated_at: "2026-09-25T02:05:00Z"
    },
    {
      id: 3, ticket_id: 4, team_id: 1, applicant_id: 301, applicant_name: "张班长",
      part_code: "SP-2001", part_name: "绝缘护套 35mm²", quantity: 20,
      warehouse_name: "东郊库", usage_status: PART_USAGE_STATUS.PENDING,
      approved_by: "", approver_id: null, approved_at: null, reject_reason: null,
      stock_remaining: null, shortage_quantity: null,
      created_at: "2026-09-25T03:10:00Z", updated_at: "2026-09-25T03:10:00Z"
    },
    {
      id: 4, ticket_id: 1, team_id: 1, applicant_id: 301, applicant_name: "张班长",
      part_code: "SP-1004", part_name: "隔离开关 GW9-12", quantity: 2,
      warehouse_name: "中心库", usage_status: PART_USAGE_STATUS.PENDING,
      approved_by: "", approver_id: null, approved_at: null, reject_reason: null,
      stock_remaining: null, shortage_quantity: null,
      created_at: "2026-09-25T03:40:00Z", updated_at: "2026-09-25T03:40:00Z"
    },
    {
      id: 5, ticket_id: 2, team_id: 2, applicant_id: 302, applicant_name: "赵班长",
      part_code: "SP-1003", part_name: "跌落式熔断器 RW12", quantity: 6,
      warehouse_name: "中心库", usage_status: PART_USAGE_STATUS.APPROVED,
      approved_by: "李仓管", approver_id: 201, approved_at: "2026-09-20T08:00:00Z",
      reject_reason: null, stock_remaining: 34, shortage_quantity: 0,
      created_at: "2026-09-20T07:40:00Z", updated_at: "2026-09-20T08:00:00Z"
    },
    {
      id: 6, ticket_id: 5, team_id: 2, applicant_id: 302, applicant_name: "赵班长",
      part_code: "SP-1001", part_name: "低压电缆 YJV-4x35", quantity: 3,
      warehouse_name: "东郊库", usage_status: PART_USAGE_STATUS.REJECTED,
      approved_by: "李仓管", approver_id: 201, approved_at: "2026-09-19T09:30:00Z",
      reject_reason: "工单已复电，无需再次领用备件",
      stock_remaining: null, shortage_quantity: null,
      created_at: "2026-09-19T09:00:00Z", updated_at: "2026-09-19T09:30:00Z"
    }
  ],
  // 备件库存流水
  stockLog: [
    {
      id: 1, warehouse_name: "中心库", part_code: "SP-1003", part_name: "跌落式熔断器 RW12",
      flow_type: STOCK_FLOW.OUTBOUND, change_quantity: -6, remaining_quantity: 34,
      usage_id: 5, ticket_id: 2, operator_id: 201, operator_name: "李仓管",
      remark: "工单 2 备件申请批准出库", created_at: "2026-09-20T08:00:00Z"
    }
  ],
  auditLog: [
    {
      id: 1, actor_id: 201, actor_name: "李仓管", actor_role: ROLES.WAREHOUSE_KEEPER,
      action: "SparePartUsage.approve", target_type: "SparePartUsage", target_id: "5",
      detail: "批准工单 2 领用跌落式熔断器 RW12 x6，出库后余量 34",
      created_at: "2026-09-20T08:00:00Z"
    },
    {
      id: 2, actor_id: 201, actor_name: "李仓管", actor_role: ROLES.WAREHOUSE_KEEPER,
      action: "SparePartUsage.reject", target_type: "SparePartUsage", target_id: "6",
      detail: "驳回工单 5 备件申请：工单已复电，无需再次领用备件",
      created_at: "2026-09-19T09:30:00Z"
    }
  ]
} as const;
