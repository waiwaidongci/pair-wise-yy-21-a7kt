import { defineStore } from "pinia";
import { login as loginApi } from "../api/Auth";
import type { AuthUser } from "../types/Auth";

const TOKEN_KEY = "grid-repair-token";
const USER_KEY = "grid-repair-user";
const DEV_USER_KEY = "grid-repair-dev-user";

// 认证 store：JWT 优先，开发期也支持直接切身份（x-user-id 回退）
export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) ?? "",
    user: (localStorage.getItem(USER_KEY) ? JSON.parse(localStorage.getItem(USER_KEY) as string) : null) as AuthUser | null
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.user),
    role: (state) => state.user?.role ?? ""
  },
  actions: {
    async login(userId: number) {
      const { token, user } = await loginApi(userId);
      this.token = token;
      this.user = user;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.removeItem(DEV_USER_KEY);
    },

    // 开发联调：不走 JWT，直接用请求头模拟身份
    useDevIdentity(user: AuthUser) {
      this.token = "";
      this.user = user;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(DEV_USER_KEY, JSON.stringify(user));
    },

    logout() {
      this.token = "";
      this.user = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(DEV_USER_KEY);
    }
  }
});
