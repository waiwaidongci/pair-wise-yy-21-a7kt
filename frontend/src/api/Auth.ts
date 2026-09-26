import { request } from "./http";
import type { AuthUser, LoginResponse } from "../types/Auth";

// 本地演示账号（与后端种子一致）
export const DEMO_ACCOUNTS: Array<AuthUser & { hint: string }> = [
  { id: 201, name: "李仓管", role: "WAREHOUSE_KEEPER", team_id: null, hint: "审批备件、扣减库存" },
  { id: 301, name: "张班长", role: "TEAM_LEADER", team_id: 1, hint: "东风抢修一班，提交/查看本组申请" },
  { id: 302, name: "赵班长", role: "TEAM_LEADER", team_id: 2, hint: "朝阳抢修二班" },
  { id: 401, name: "周审计", role: "AUDITOR", team_id: null, hint: "只读，不能操作" },
  { id: 101, name: "王调度", role: "DISPATCHER", team_id: null, hint: "全局只读旁观" }
];

export async function login(userId: number): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", { method: "POST", body: { user_id: userId } });
}
