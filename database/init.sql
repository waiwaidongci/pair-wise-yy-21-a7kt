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

-- 备件领用申请（工单材料申请审批台）
CREATE TABLE IF NOT EXISTS spare_part_usage (
  id INTEGER PRIMARY KEY,
  ticket_id TEXT,
  team_id TEXT,
  applicant_id TEXT,
  applicant_name TEXT,
  part_code TEXT,
  part_name TEXT,
  quantity TEXT,
  warehouse_name TEXT,
  usage_status TEXT,
  approved_by TEXT,
  approver_id TEXT,
  approved_at TEXT,
  reject_reason TEXT,
  stock_remaining TEXT,
  shortage_quantity TEXT,
  created_at TEXT,
  updated_at TEXT
);

-- 备件库存：仓库 + 备件编码唯一
CREATE TABLE IF NOT EXISTS spare_part_stock (
  id INTEGER PRIMARY KEY,
  warehouse_name TEXT,
  part_code TEXT,
  part_name TEXT,
  available_quantity INTEGER,
  safety_quantity INTEGER,
  updated_at TEXT
);

-- 备件库存流水
CREATE TABLE IF NOT EXISTS stock_log (
  id INTEGER PRIMARY KEY,
  warehouse_name TEXT,
  part_code TEXT,
  part_name TEXT,
  flow_type TEXT,
  change_quantity INTEGER,
  remaining_quantity INTEGER,
  usage_id TEXT,
  ticket_id TEXT,
  operator_id TEXT,
  operator_name TEXT,
  remark TEXT,
  created_at TEXT
);

-- 登录账号（RBAC：调度员/班组长/仓管/审计员）
CREATE TABLE IF NOT EXISTS app_user (
  id INTEGER PRIMARY KEY,
  name TEXT,
  role TEXT,
  team_id TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor_id TEXT,
  actor_name TEXT,
  actor_role TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  detail TEXT,
  created_at TEXT
);
