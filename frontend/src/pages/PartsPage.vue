<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useSparePartUsageStore } from "../stores/SparePartUsageStore";
import { useSparePartStockStore } from "../stores/SparePartStockStore";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useAuthStore } from "../stores/AuthStore";
import ApprovalPanel from "../components/common/ApprovalPanel.vue";
import UsageApplyForm from "../components/common/UsageApplyForm.vue";
import EmptyState from "../components/common/EmptyState.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import { PART_USAGE_STATUS_LIST, PART_USAGE_STATUS_TEXT } from "../constants/PartUsageStatus";
import { STOCK_FLOW_TEXT } from "../constants/StockFlow";
import { ROLE_TEXT } from "../constants/Roles";
import { canApply, isReadOnlyRole } from "../utils/rbac";
import { ApiError } from "../api/http";
import { formatDate, formatQuantityDiff } from "../utils/formatters";
import type { CreateUsagePayload } from "../types/SparePartUsage";

const usageStore = useSparePartUsageStore();
const stockStore = useSparePartStockStore();
const ticketStore = useRepairTicketStore();
const authStore = useAuthStore();
const { rows, loading, filter } = storeToRefs(usageStore);
const { stocks, logs } = storeToRefs(stockStore);

const tab = ref<"pending" | "all" | "stock" | "logs">("pending");
const showApply = ref(false);
const busyId = ref<number | null>(null);
const feedback = ref<{ type: "ok" | "error" | "warn"; text: string } | null>(null);

const role = computed(() => authStore.user?.role ?? "");
const roleName = computed(() => ROLE_TEXT[role.value as keyof typeof ROLE_TEXT] ?? role.value);
const teamScoped = computed(() => role.value === "TEAM_LEADER");
const readOnly = computed(() => isReadOnlyRole(authStore.user));

// 班组长只能给本组工单提交申请
const ownTickets = computed(() =>
  ticketStore.rows.filter((ticket) => !teamScoped.value || ticket.team_id === authStore.user?.team_id)
);

const visibleRows = computed(() =>
  tab.value === "pending" ? rows.value.filter((row) => row.usage_status === "PENDING") : rows.value
);
const pendingCount = computed(() => usageStore.pendingRows.length);
const shortageCount = computed(() => usageStore.shortageRows.length);

const warehouses = computed(() => stockStore.warehouses);

const setTab = (next: typeof tab.value) => {
  tab.value = next;
  feedback.value = null;
  // 「待审批」由服务端按 PENDING 过滤；「全部申请」清空状态筛选，交给状态下拉控制
  if (next === "pending") {
    usageStore.filter.usage_status = "PENDING";
    usageStore.load();
  } else if (next === "all") {
    usageStore.filter.usage_status = filter.value.usage_status === "PENDING" ? "" : filter.value.usage_status;
    usageStore.load();
  }
};

const onStatusChange = () => {
  usageStore.filter.usage_status = tab.value === "pending" ? "PENDING" : "";
  usageStore.load();
};

const handleError = (err: unknown) => {
  if (err instanceof ApiError) {
    if (err.code === "STOCK_SHORTAGE") {
      feedback.value = { type: "warn", text: err.message };
    } else {
      feedback.value = { type: "error", text: err.message };
    }
  } else {
    feedback.value = { type: "error", text: "操作失败，请稍后再试" };
  }
};

const onApprove = async (id: number) => {
  busyId.value = id;
  feedback.value = null;
  try {
    const updated = await usageStore.approve(id);
    feedback.value = {
      type: "ok",
      text: `已批准工单 #${updated.ticket_id} 申请并扣减库存，剩余 ${updated.stock_remaining} 件，审批人 ${updated.approved_by}`
    };
    await stockStore.loadStocks();
    if (tab.value === "logs") await stockStore.loadLogs();
  } catch (err) {
    handleError(err);
  } finally {
    busyId.value = null;
  }
};

const onReject = async (id: number, reason: string) => {
  busyId.value = id;
  feedback.value = null;
  try {
    const updated = await usageStore.reject(id, reason);
    feedback.value = {
      type: "ok",
      text: `已驳回工单 #${updated.ticket_id} 的申请，原因已记录`
    };
  } catch (err) {
    handleError(err);
  } finally {
    busyId.value = null;
  }
};

const onApplySubmit = async (payload: CreateUsagePayload) => {
  feedback.value = null;
  try {
    const created = await usageStore.apply(payload);
    feedback.value = { type: "ok", text: `工单 #${created.ticket_id} 材料申请已提交，等待仓管审批` };
    showApply.value = false;
  } catch (err) {
    handleError(err);
  }
};

onMounted(async () => {
  await Promise.all([
    usageStore.load(),
    stockStore.loadStocks(),
    ticketStore.load().catch(() => undefined)
  ]);
  if (canViewLogsNow()) await stockStore.loadLogs();
});

const canViewLogsNow = () => ["WAREHOUSE_KEEPER", "AUDITOR", "DISPATCHER"].includes(role.value);

const switchToLogs = async () => {
  setTab("logs");
  if (!logs.value.length) await stockStore.loadLogs().catch(() => undefined);
};
</script>

<template>
  <section class="parts-page">
    <!-- 角色与权限提示 -->
    <header class="desk-head">
      <div>
        <p class="eyebrow">spare part approval desk</p>
        <h2>备件领用审批台</h2>
        <p class="muted">
          当前身份：<b>{{ authStore.user?.name }}（{{ roleName }}）</b>
          <template v-if="teamScoped"> · 仅展示本组（{{ authStore.user?.team_id }} 班）申请，可提交工单材料申请</template>
          <template v-else-if="role === 'WAREHOUSE_KEEPER'"> · 可审批全部仓库的备件申请</template>
          <template v-else-if="readOnly"> · 只读角色，不能进行任何操作</template>
          <template v-else> · 全局只读旁观</template>
        </p>
      </div>
      <button v-if="canApply(authStore.user)" class="btn primary" @click="showApply = true">提交材料申请</button>
    </header>

    <div v-if="feedback" class="feedback" :class="feedback.type" role="alert">
      {{ feedback.text }}
      <button class="feedback-close" @click="feedback = null">×</button>
    </div>

    <nav class="tabs">
      <button :class="{ active: tab === 'pending' }" @click="setTab('pending')">
        待审批 <em>{{ pendingCount }}</em><span v-if="shortageCount" class="short-pill">{{ shortageCount }} 条库存不足</span>
      </button>
      <button :class="{ active: tab === 'all' }" @click="setTab('all')">全部申请</button>
      <button :class="{ active: tab === 'stock' }" @click="setTab('stock')">库存余量</button>
      <button v-if="canViewLogsNow()" :class="{ active: tab === 'logs' }" @click="switchToLogs">库存流水</button>
    </nav>

    <!-- 待审批 / 全部：按工单、仓库、申请状态筛选 -->
    <div v-if="tab === 'pending' || tab === 'all'" class="filters panel">
      <label>
        工单号
        <input
          :value="filter.ticket_id ?? ''"
          type="number"
          min="1"
          placeholder="如 1"
          @input="usageStore.setFilter({ ticket_id: ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : undefined })"
        />
      </label>
      <label>
        仓库
        <select :value="filter.warehouse_name" @change="usageStore.setFilter({ warehouse_name: ($event.target as HTMLSelectElement).value })">
          <option value="">全部仓库</option>
          <option v-for="warehouse in warehouses" :key="warehouse" :value="warehouse">{{ warehouse }}</option>
        </select>
      </label>
      <label v-if="tab === 'all'">
        申请状态
        <select :value="filter.usage_status" @change="onStatusChange">
          <option value="">全部状态</option>
          <option v-for="status in PART_USAGE_STATUS_LIST" :key="status" :value="status">
            {{ PART_USAGE_STATUS_TEXT[status] }}
          </option>
        </select>
      </label>
      <button class="btn ghost" @click="usageStore.resetFilter()">重置筛选</button>
      <span v-if="loading" class="muted small">加载中…</span>
    </div>

    <!-- 申请卡片列表 -->
    <div v-if="tab === 'pending' || tab === 'all'" class="approval-list">
      <EmptyState v-if="!visibleRows.length && !loading" />
      <ApprovalPanel
        v-for="record in visibleRows"
        :key="record.id"
        :record="record"
        :readonly="role !== 'WAREHOUSE_KEEPER'"
        :readonly-hint="readOnly ? '审计员为只读角色，不能操作' : (teamScoped ? '班组长只能提交申请与查看本组记录，不能审批' : '')"
        :busy="busyId === record.id"
        @approve="onApprove"
        @reject="onReject"
      />
    </div>

    <!-- 库存余量 -->
    <div v-else-if="tab === 'stock'" class="panel">
      <h3>备件库存</h3>
      <table class="data-table">
        <thead>
          <tr><th>仓库</th><th>备件编码</th><th>备件名称</th><th>可用库存</th><th>安全库存</th><th>最近更新</th></tr>
        </thead>
        <tbody>
          <tr v-for="stock in stocks" :key="stock.id" :class="{ danger: stock.available_quantity <= stock.safety_quantity }">
            <td>{{ stock.warehouse_name }}</td>
            <td>{{ stock.part_code }}</td>
            <td>{{ stock.part_name }}</td>
            <td><b>{{ stock.available_quantity }}</b></td>
            <td>{{ stock.safety_quantity }}</td>
            <td>{{ formatDate(stock.updated_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 库存流水 -->
    <div v-else-if="tab === 'logs'" class="panel">
      <h3>备件库存流水</h3>
      <table class="data-table">
        <thead>
          <tr><th>时间</th><th>仓库</th><th>备件</th><th>类型</th><th>变动</th><th>余量</th><th>工单</th><th>操作人</th><th>备注</th></tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td>{{ formatDate(log.created_at) }}</td>
            <td>{{ log.warehouse_name }}</td>
            <td>{{ log.part_name }}<span class="muted small">（{{ log.part_code }}）</span></td>
            <td><StatusBadge :value="STOCK_FLOW_TEXT[log.flow_type as keyof typeof STOCK_FLOW_TEXT] ?? log.flow_type" /></td>
            <td :class="log.change_quantity < 0 ? 'text-danger' : 'text-success'">{{ formatQuantityDiff(log.change_quantity) }}</td>
            <td><b>{{ log.remaining_quantity }}</b></td>
            <td>#{{ log.ticket_id ?? "—" }}</td>
            <td>{{ log.operator_name }}</td>
            <td>{{ log.remark }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 班组长申请表单弹层 -->
    <div v-if="showApply" class="modal-mask" @click.self="showApply = false">
      <div class="modal">
        <UsageApplyForm
          :warehouses="warehouses"
          :tickets="ownTickets"
          @submit="onApplySubmit"
          @cancel="showApply = false"
        />
      </div>
    </div>
  </section>
</template>
