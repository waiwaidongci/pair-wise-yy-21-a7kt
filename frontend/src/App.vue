<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import { routes } from "./router/routes";
import { useAuthStore } from "./stores/AuthStore";
import { ROLE_TEXT } from "./constants/Roles";
import StatusBadge from "./components/common/StatusBadge.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const roleText = computed(() => ROLE_TEXT[authStore.role as keyof typeof ROLE_TEXT] ?? authStore.role);
const go = (path: string) => router.push(path);
const logout = () => {
  authStore.logout();
  router.push("/login");
};
</script>

<template>
  <div class="shell">
    <aside>
      <div class="brand">电力配网抢修工单系统</div>
      <nav>
        <button
          v-for="item in routes"
          :key="item.route"
          :class="{ active: route.path === item.route }"
          @click="go(item.route)"
        >
          {{ item.name }}
        </button>
      </nav>
      <div v-if="authStore.user" class="identity">
        <StatusBadge :value="roleText" tone="neutral" />
        <p class="identity-name">{{ authStore.user.name }}</p>
        <p v-if="authStore.user.team_id" class="muted small">所属班组 #{{ authStore.user.team_id }}</p>
        <button class="btn ghost btn-block" @click="logout">切换身份</button>
      </div>
    </aside>
    <main class="page">
      <section class="page-head">
        <div>
          <p class="eyebrow">grid-repair</p>
          <h1>{{ route.meta.title ?? "电力配网抢修" }}</h1>
        </div>
        <StatusBadge value="LOCAL_DATA" />
      </section>
      <RouterView />
    </main>
  </div>
</template>
