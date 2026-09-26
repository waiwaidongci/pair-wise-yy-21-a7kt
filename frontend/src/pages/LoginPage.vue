<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { login, listUsers } from "../api/Auth";
import { useSessionStore } from "../stores/SessionStore";
import { RoleText, type Role, type SessionUser } from "../constants/Role";
import { ApiError } from "../api/http";

/** 各角色登录后的默认落地页：/parts 仅仓管/班组长/审计员可进，调度员去态势页 */
const homeByRole: Record<Role, string> = {
  WAREHOUSE_KEEPER: "/parts",
  TEAM_LEADER: "/parts",
  AUDITOR: "/parts",
  DISPATCHER: "/dashboard"
};

const session = useSessionStore();
const router = useRouter();
const route = useRoute();

const users = ref<SessionUser[]>([]);
const errorBox = ref("");
const loadingId = ref<number | null>(null);

onMounted(async () => {
  users.value = await listUsers().catch(() => []);
  // 已登录用户被守卫退回登录页时，展示越权原因，但不自动跳回
  if (route.query.reason) errorBox.value = String(route.query.reason);
});

async function quickLogin(userId: number) {
  loadingId.value = userId;
  errorBox.value = "";
  try {
    const payload = await login(userId);
    session.setSession(payload);
    router.replace(homeByRole[payload.user.role]);
  } catch (err) {
    errorBox.value = err instanceof ApiError ? err.message : "登录失败，请确认后端已启动";
  } finally {
    loadingId.value = null;
  }
}
</script>

<template>
  <section class="login-page">
    <div class="login-card">
      <p class="eyebrow">grid-repair</p>
      <h1>电力配网抢修工单系统</h1>
      <p class="sub">选择身份进入（演示环境用种子用户换取 JWT）</p>
      <div v-if="errorBox" class="alert error">⚠ {{ errorBox }}</div>
      <div class="user-list">
        <button
          v-for="user in users"
          :key="user.id"
          class="user-btn"
          :disabled="loadingId === user.id"
          @click="quickLogin(user.id)"
        >
          <span class="user-name">{{ user.name }}</span>
          <span class="user-role">{{ RoleText[user.role] }}<template v-if="user.teamId"> · {{ user.teamId }} 组</template></span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
.login-card { background: #fbfaf4; border: 1px solid #d8d6c8; border-radius: 12px; padding: 30px 34px; width: 440px; max-width: 100%; }
.login-card h1 { font-size: 24px; margin: 6px 0; }
.sub { color: #596257; font-size: 13px; margin: 0 0 18px; }
.alert { border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 12px; }
.alert.error { background: #fee2e2; border: 1px solid #f5a5a5; color: #991b1b; }
.user-list { display: grid; gap: 10px; }
.user-btn { display: flex; justify-content: space-between; align-items: center; text-align: left; padding: 12px 14px; border: 1px solid #d8d6c8; border-radius: 8px; background: #fff; color: #20211d; }
.user-btn:hover { border-color: #d39b46; background: #fff8ec; }
.user-btn:disabled { opacity: 0.6; cursor: wait; }
.user-name { font-weight: 800; }
.user-role { color: #7d4d18; font-size: 13px; }
</style>
