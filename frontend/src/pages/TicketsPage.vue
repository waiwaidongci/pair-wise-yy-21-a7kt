<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { listSparePartUsage } from "../api/SparePartUsage";
import { useAuthStore } from "../stores/AuthStore";
import StatusBadge from "../components/common/StatusBadge.vue";
import EmptyState from "../components/common/EmptyState.vue";
import type { SparePartUsageView } from "../types/SparePartUsage";

const ticketStore = useRepairTicketStore();
const authStore = useAuthStore();
const usages = ref<SparePartUsageView[]>([]);
const errorText = ref("");

const teamScoped = computed(() => authStore.user?.role === "TEAM_LEADER");
const tickets = computed(() =>
  teamScoped.value
    ? ticketStore.rows.filter((ticket) => ticket.team_id === authStore.user?.team_id)
    : ticketStore.rows
);
const usagesOf = (ticketId: number) => usages.value.filter((row) => row.ticket_id === ticketId);

onMounted(async () => {
  try {
    await ticketStore.load();
    usages.value = await listSparePartUsage();
  } catch (err) {
    errorText.value = (err as Error).message;
  }
});
</script>

<template>
  <section class="parts-page">
    <p class="muted">工单列表与其材料申请状态（{{ teamScoped ? "仅本组工单" : "全部工单" }}），备件审批请前往「备件领用」审批台。</p>
    <p v-if="errorText" class="feedback error">{{ errorText }}</p>
    <EmptyState v-if="!tickets.length" />
    <ul v-else class="simple-list">
      <li v-for="ticket in tickets" :key="ticket.id" style="display:block">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center">
          <strong>抢修工单 #{{ ticket.id }}</strong>
          <StatusBadge :value="ticket.status" />
        </div>
        <p class="muted small" style="margin:6px 0">
          班组 #{{ ticket.team_id }} · 优先级 {{ ticket.priority }} · 派工 {{ ticket.assigned_at ?? "—" }}
        </p>
        <div v-if="usagesOf(ticket.id).length" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
          <span v-for="usage in usagesOf(ticket.id)" :key="usage.id" class="shared-widget" style="padding:8px 12px;display:flex;gap:8px;align-items:center">
            {{ usage.part_name }} x{{ usage.quantity }}
            <StatusBadge :value="usage.usage_status" />
            <span v-if="usage.usage_status === 'PENDING' && usage.current_shortage > 0" class="text-danger small">
              缺 {{ usage.current_shortage }} 件
            </span>
          </span>
        </div>
        <p v-else class="muted small" style="margin:6px 0 0">暂无材料申请</p>
      </li>
    </ul>
  </section>
</template>
