// RBAC 角色：调度员 / 班组长 / 仓管 / 审计员
export const ROLES = {
  DISPATCHER: "DISPATCHER",
  TEAM_LEADER: "TEAM_LEADER",
  WAREHOUSE_KEEPER: "WAREHOUSE_KEEPER",
  AUDITOR: "AUDITOR"
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LIST = [
  ROLES.DISPATCHER,
  ROLES.TEAM_LEADER,
  ROLES.WAREHOUSE_KEEPER,
  ROLES.AUDITOR
] as const;

export const ROLE_TEXT: Record<Role, string> = {
  DISPATCHER: "调度员",
  TEAM_LEADER: "班组长",
  WAREHOUSE_KEEPER: "仓管",
  AUDITOR: "审计员"
};

// 各角色在备件审批台的可用动作；越权按钮直接不渲染
export const ROLE_CAPABILITIES: Record<Role, { apply: boolean; approve: boolean; reject: boolean; viewAll: boolean }> = {
  DISPATCHER: { apply: false, approve: false, reject: false, viewAll: true },
  TEAM_LEADER: { apply: true, approve: false, reject: false, viewAll: false },
  WAREHOUSE_KEEPER: { apply: false, approve: true, reject: true, viewAll: true },
  AUDITOR: { apply: false, approve: false, reject: false, viewAll: true }
};
