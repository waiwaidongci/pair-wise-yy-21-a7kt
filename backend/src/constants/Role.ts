export const ROLES = ["DISPATCHER", "TEAM_LEADER", "WAREHOUSE_KEEPER", "AUDITOR"] as const;
export type Role = (typeof ROLES)[number];

export const RoleText: Record<Role, string> = {
  DISPATCHER: "调度员",
  TEAM_LEADER: "班组长",
  WAREHOUSE_KEEPER: "仓管",
  AUDITOR: "审计员"
};
