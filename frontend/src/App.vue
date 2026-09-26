<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { routes as pageRoutes } from "./router/routes";
import { useSessionStore } from "./stores/SessionStore";
import StatusBadge from "./components/common/StatusBadge.vue";

const session = useSessionStore();
const route = useRoute();
const router = useRouter();
const { user, roleText } = storeToRefs(session);

const reason = ref("");

onMounted(() => {
  session.restore();
  reason.value = (route.query.reason as string) ?? "";
});

const navItems = computed(() =>
  pageRoutes.filter((item) => typeof item.name === "string" && item.path !== "/login")
);

const logout = () => {
  session.clear();
  router.replace("/login");
};
</script>

<template>
  <router-view v-if="route.meta.public" />
  <div v-else class="shell">
    <aside>
      <div class="brand">电力配网抢修工单系统</div>
      <nav>
        <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="nav-btn" active-class="active">
          {{ item.name }}
        </router-link>
      </nav>
      <div class="session-box">
        <template v-if="user">
          <div class="session-user">{{ user.name }} · {{ roleText }}<template v-if="user.teamId">（{{ user.teamId }} 组）</template></div>
          <button class="logout-btn" @click="logout">退出登录</button>
        </template>
        <router-link v-else class="nav-btn" to="/login">去登录</router-link>
      </div>
    </aside>
    <main class="page">
      <section class="page-head">
        <div>
          <p class="eyebrow">grid-repair</p>
          <h1>{{ route.name ?? "备件领用" }}</h1>
        </div>
        <StatusBadge :value="session.readOnly ? '只读模式' : 'JWT_RBAC'" />
      </section>
      <div v-if="reason" class="deny-banner">⛔ {{ reason }}</div>
      <router-view />
    </main>
  </div>
</template>
