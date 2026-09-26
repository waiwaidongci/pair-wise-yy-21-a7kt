import { defineStore } from "pinia";
import { RoleText, type Role, type SessionUser } from "../constants/Role";

const STORAGE_KEY = "grid-repair-session";

interface PersistedSession {
  token: string;
  user: SessionUser;
}

/**
 * 登录会话：JWT 存 localStorage；
 * canApprove / canApply / readOnly 供按钮显隐和路由守卫统一判断。
 */
export const useSessionStore = defineStore("session", {
  state: () => ({
    token: "",
    user: null as SessionUser | null
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
    isWarehouseKeeper: (state) => state.user?.role === "WAREHOUSE_KEEPER",
    isTeamLeader: (state) => state.user?.role === "TEAM_LEADER",
    isAuditor: (state) => state.user?.role === "AUDITOR",
    canApprove: (state) => state.user?.role === "WAREHOUSE_KEEPER",
    canApply: (state) => state.user?.role === "TEAM_LEADER",
    /** 审计员：只能看，不能提交/批准/驳回 */
    readOnly: (state) => state.user?.role === "AUDITOR",
    roleText: (state) => (state.user ? RoleText[state.user.role] : "未登录"),
    teamId: (state) => state.user?.teamId
  },
  actions: {
    setSession(payload: PersistedSession) {
      this.token = payload.token;
      this.user = payload.user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    },
    restore() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const payload = JSON.parse(raw) as PersistedSession;
          this.token = payload.token;
          this.user = payload.user;
        } catch {
          this.clear();
        }
      }
    },
    clear() {
      this.token = "";
      this.user = null;
      localStorage.removeItem(STORAGE_KEY);
    },
    /** 路由守卫：返回拒绝原因字符串，放行时返回空串 */
    guard(required?: Role[]): string {
      if (!this.user) return "请先登录后再访问该页面";
      if (required && !required.includes(this.user.role)) {
        return `「${RoleText[this.user.role]}」无权访问该页面，此页面仅对${required.map((r) => RoleText[r]).join("、")}开放`;
      }
      return "";
    }
  }
});
