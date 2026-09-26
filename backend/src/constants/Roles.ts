// RBAC 角色：调度员 / 班组长 / 仓管 / 审计员
export const ROLES = {
  DISPATCHER: "DISPATCHER",
  TEAM_LEADER: "TEAM_LEADER",
  WAREHOUSE_KEEPER: "WAREHOUSE_KEEPER",
  AUDITOR: "AUDITOR"
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LIST: Role[] = [
  ROLES.DISPATCHER,
  ROLES.TEAM_LEADER,
  ROLES.WAREHOUSE_KEEPER,
  ROLES.AUDITOR
];

export const ROLE_TEXT: Record<Role, string> = {
  DISPATCHER: "调度员",
  TEAM_LEADER: "班组长",
  WAREHOUSE_KEEPER: "仓管",
  AUDITOR: "审计员"
};
