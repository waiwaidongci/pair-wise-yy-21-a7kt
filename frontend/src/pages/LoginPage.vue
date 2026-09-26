<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/AuthStore";
import { DEMO_ACCOUNTS } from "../api/Auth";
import { ROLE_TEXT } from "../constants/Roles";
import { ApiError } from "../api/http";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const busyId = ref<number | null>(null);
const errorText = ref<string>((route.query.reason as string) ?? "");

const choose = async (userId: number) => {
  busyId.value = userId;
  errorText.value = "";
  try {
    await authStore.login(userId);
    router.push((route.query.redirect as string) || "/parts");
  } catch (err) {
    errorText.value = err instanceof ApiError ? err.message : "登录失败，请确认后端已启动";
  } finally {
    busyId.value = null;
  }
};

// 后端未启动时的开发联调：直接写入身份头，不签发 JWT
const useDev = (account: (typeof DEMO_ACCOUNTS)[number]) => {
  authStore.useDevIdentity({ id: account.id, name: account.name, role: account.role, team_id: account.team_id });
  router.push("/parts");
};
</script>

<template>
  <section class="login-page">
    <div class="login-card">
      <p class="eyebrow">grid-repair</p>
      <h1>选择登录身份</h1>
      <p class="muted">演示账号对应四种 RBAC 角色：仓管可审批、班组长只看本组并提交申请、审计员只读、越权操作会被后端直接拒绝并说明原因。</p>
      <ul class="account-list">
        <li v-for="account in DEMO_ACCOUNTS" :key="account.id">
          <div>
            <strong>{{ account.name }}</strong>
            <span class="role-chip">{{ ROLE_TEXT[account.role as keyof typeof ROLE_TEXT] }}</span>
            <p class="muted small">{{ account.hint }}</p>
          </div>
          <div class="account-actions">
            <button class="btn primary" :disabled="busyId !== null" @click="choose(account.id)">
              {{ busyId === account.id ? "登录中…" : "JWT 登录" }}
            </button>
            <button class="btn ghost" @click="useDev(account)">开发身份头</button>
          </div>
        </li>
      </ul>
      <p v-if="errorText" class="feedback error">{{ errorText }}</p>
    </div>
  </section>
</template>
