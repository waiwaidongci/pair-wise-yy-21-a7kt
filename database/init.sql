CREATE TABLE IF NOT EXISTS grid_asset (
  id INTEGER PRIMARY KEY,
  asset_code TEXT,
  asset_type TEXT,
  feeder_line TEXT,
  voltage_level TEXT,
  location_desc TEXT,
  health_status TEXT,
  owner_team_id TEXT
);

CREATE TABLE IF NOT EXISTS fault_report (
  id INTEGER PRIMARY KEY,
  reporter_name TEXT,
  phone TEXT,
  asset_id TEXT,
  fault_type TEXT,
  address_desc TEXT,
  severity TEXT,
  report_channel TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS repair_ticket (
  id INTEGER PRIMARY KEY,
  fault_report_id TEXT,
  team_id TEXT,
  dispatcher_id TEXT,
  priority TEXT,
  status TEXT,
  assigned_at TEXT,
  restored_at TEXT
);

CREATE TABLE IF NOT EXISTS crew (
  id INTEGER PRIMARY KEY,
  name TEXT,
  leader_id TEXT,
  skill_tags TEXT,
  duty_status TEXT,
  current_ticket_id TEXT,
  contact_phone TEXT
);

-- 登录用户与 RBAC 角色：DISPATCHER 调度员 / TEAM_LEADER 班组长 / WAREHOUSE_KEEPER 仓管 / AUDITOR 审计员
CREATE TABLE IF NOT EXISTS app_user (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  team_id TEXT
);

-- 备件库存台账：同一仓库(warehouse_name)内备件编码(part_code)唯一
CREATE TABLE IF NOT EXISTS spare_part_stock (
  id INTEGER PRIMARY KEY,
  warehouse_name TEXT NOT NULL,
  part_code TEXT NOT NULL,
  part_name TEXT,
  available_quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT,
  UNIQUE (warehouse_name, part_code)
);

-- 备件领用/申请审批台
-- usage_status: PENDING 待审批 / APPROVED 已批准(已扣减出库) / REJECTED 已驳回
CREATE TABLE IF NOT EXISTS spare_part_usage (
  id INTEGER PRIMARY KEY,
  ticket_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  part_code TEXT NOT NULL,
  part_name TEXT,
  quantity INTEGER NOT NULL,
  warehouse_name TEXT NOT NULL,
  usage_status TEXT NOT NULL DEFAULT 'PENDING',
  requested_by TEXT,
  requested_at TEXT,
  approved_by TEXT,
  approved_at TEXT,
  reject_reason TEXT,
  stock_after_approval INTEGER,
  shortage_quantity INTEGER
);
CREATE INDEX IF NOT EXISTS idx_spare_part_usage_filter
  ON spare_part_usage (ticket_id, warehouse_name, usage_status);
CREATE INDEX IF NOT EXISTS idx_spare_part_usage_team
  ON spare_part_usage (team_id);

-- 操作审计日志：申请提交/批准/驳回均落一条
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  detail TEXT,
  created_at TEXT
);

-- 备件库存流水：批准出库形成的库存变动记录
CREATE TABLE IF NOT EXISTS spare_part_stock_log (
  id INTEGER PRIMARY KEY,
  warehouse_name TEXT,
  part_code TEXT,
  usage_id INTEGER,
  ticket_id INTEGER,
  change_quantity INTEGER,
  balance_quantity INTEGER,
  operator TEXT,
  created_at TEXT
);

-- 种子数据
INSERT INTO app_user (id, name, role, team_id) VALUES
  (1, '王调度', 'DISPATCHER', NULL),
  (11, '李班长', 'TEAM_LEADER', 1),
  (12, '赵班长', 'TEAM_LEADER', 2),
  (13, '孙班长', 'TEAM_LEADER', 3),
  (21, '陈仓管', 'WAREHOUSE_KEEPER', NULL),
  (31, '周审计', 'AUDITOR', NULL);

INSERT INTO spare_part_stock (id, warehouse_name, part_code, part_name, available_quantity, unit) VALUES
  (1, '中心仓库', 'SP-1001', '真空断路器 ZW32-12', 5, '台'),
  (2, '中心仓库', 'SP-1002', '跌落式熔断器 PRWG2-12', 20, '组'),
  (3, '城东仓库', 'SP-1003', '绝缘导线 JKLYJ-120', 50, '米'),
  (4, '城东仓库', 'SP-1004', '低压避雷器 HY1.5W', 8, '只'),
  (5, '中心仓库', 'SP-1005', '铜接线端子 DT-120', 100, '个');

INSERT INTO spare_part_usage
  (id, ticket_id, team_id, part_code, part_name, quantity, warehouse_name, usage_status, requested_by, requested_at, approved_by, approved_at, reject_reason, stock_after_approval, shortage_quantity)
VALUES
  (1, 101, 1, 'SP-1001', '真空断路器 ZW32-12', 2, '中心仓库', 'PENDING', '李班长', '2026-09-25T10:00:00Z', '', '', '', NULL, NULL),
  (2, 101, 1, 'SP-1002', '跌落式熔断器 PRWG2-12', 30, '中心仓库', 'PENDING', '李班长', '2026-09-25T10:02:00Z', '', '', '', NULL, NULL),
  (3, 102, 2, 'SP-1003', '绝缘导线 JKLYJ-120', 40, '城东仓库', 'PENDING', '赵班长', '2026-09-25T10:20:00Z', '', '', '', NULL, NULL),
  (4, 102, 2, 'SP-1001', '真空断路器 ZW32-12', 8, '中心仓库', 'PENDING', '赵班长', '2026-09-25T10:25:00Z', '', '', '', NULL, NULL),
  (5, 103, 1, 'SP-1005', '铜接线端子 DT-120', 60, '中心仓库', 'APPROVED', '李班长', '2026-09-20T03:00:00Z', '陈仓管', '2026-09-20T03:10:00Z', '', 40, NULL),
  (6, 201, 3, 'SP-1004', '低压避雷器 HY1.5W', 2, '城东仓库', 'REJECTED', '孙班长', '2026-09-18T04:00:00Z', '陈仓管', '2026-09-18T04:08:00Z', '申请型号与工单故障类型不符，请核对铭牌后重新提交', NULL, NULL);
