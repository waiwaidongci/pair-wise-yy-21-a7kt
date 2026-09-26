import { createRouter, createWebHashHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import DashboardPage from "../pages/DashboardPage.vue";
import AssetsPage from "../pages/AssetsPage.vue";
import FaultsPage from "../pages/FaultsPage.vue";
import TicketsPage from "../pages/TicketsPage.vue";
import PartsPage from "../pages/PartsPage.vue";
import LoginPage from "../pages/LoginPage.vue";
import { useAuthStore } from "../stores/AuthStore";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export interface AppRouteMeta {
  title: string;
  // null 表示所有角色（未登录统一由守卫拦截到登录页）
  roles?: string[] | null;
  public?: boolean;
}

declare module "vue-router" {
  interface RouteMeta extends AppRouteMeta {}
}

export const routes: RouteRecordRaw[] = [
  { path: "/login", name: "login", component: LoginPage, meta: { title: "选择身份", public: true } },
  { path: "/dashboard", name: "dashboard", component: DashboardPage, meta: { title: "抢修态势", roles: null } },
  { path: "/assets", name: "assets", component: AssetsPage, meta: { title: "配网资产", roles: null } },
  { path: "/faults", name: "faults", component: FaultsPage, meta: { title: "故障报修", roles: null } },
  { path: "/tickets", name: "tickets", component: TicketsPage, meta: { title: "抢修工单", roles: null } },
  // 备件领用页：仓管审批、班组长本组申请、审计员只读，均可进入；动作级越权由后端 403 + 按钮显隐双重把关
  { path: "/parts", name: "parts", component: PartsPage, meta: { title: "备件领用", roles: null } },
  { path: "/", redirect: "/parts" },
  { path: "/:pathMatch(.*)*", redirect: "/parts" }
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// 前端路由守卫：未登录一律到登录页
router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (to.meta.public) return true;
  if (!authStore.isLoggedIn) {
    return { name: "login", query: { redirect: to.fullPath, reason: ERROR_MESSAGES.AUTH_REQUIRED } };
  }
  return true;
});
