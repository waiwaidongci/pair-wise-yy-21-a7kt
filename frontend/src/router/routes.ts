import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { RoleText, type Role } from "../constants/Role";

const routes: Array<RouteRecordRaw & { roles?: Role[] }> = [
  { path: "/", redirect: "/parts" },
  { path: "/login", name: "登录", component: () => import("../pages/LoginPage.vue"), meta: { public: true } },
  {
    path: "/parts",
    name: "备件领用",
    component: () => import("../pages/PartsPage.vue"),
    // 仓管可审批；班组长只看本组并提交申请；审计员只读
    roles: ["WAREHOUSE_KEEPER", "TEAM_LEADER", "AUDITOR"]
  },
  { path: "/dashboard", name: "抢修态势", component: () => import("../pages/DashboardPage.vue") },
  { path: "/assets", name: "配网资产", component: () => import("../pages/AssetsPage.vue") },
  { path: "/faults", name: "故障报修", component: () => import("../pages/FaultsPage.vue") },
  { path: "/tickets", name: "抢修工单", component: () => import("../pages/TicketsPage.vue") },
  { path: "/:pathMatch(.*)*", redirect: "/parts" }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});

/**
 * 前端路由守卫：未登录跳登录页；
 * 角色不在页面允许名单时，带上后端同款“越权原因”展示在登录后跳转。
 */
router.beforeEach((to) => {
  if (to.meta.public) return true;
  // 在守卫里取 store 会形成循环依赖，延迟读取 pinia 已注册的会话 store
  const raw = localStorage.getItem("grid-repair-session");
  const session = raw ? JSON.parse(raw) : null;
  if (!session?.user) {
    return { path: "/login", query: { redirect: to.fullPath, reason: "请先登录后再继续操作" } };
  }
  const allowed = (to.matched.flatMap((record) => ((record as { roles?: Role[] }).roles ?? [])) as Role[]);
  if (allowed.length > 0 && !allowed.includes(session.user.role as Role)) {
    return {
      path: "/login",
      query: {
        redirect: to.fullPath,
        reason: `越权请求：该页面仅对 ${allowed.map((r) => RoleText[r]).join("、")} 开放，当前角色为 ${RoleText[session.user.role as Role] ?? session.user.role}`
      }
    };
  }
  return true;
});

export { routes };
