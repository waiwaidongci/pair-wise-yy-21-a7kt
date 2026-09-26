<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useSparePartUsageStore } from "../stores/SparePartUsageStore";
import { useSessionStore } from "../stores/SessionStore";
import { listRepairTicket } from "../api/RepairTicket";
import { listCrew } from "../api/Crew";
import { listSparePartStock } from "../api/SparePartStock";
import { ApiError } from "../api/http";
import { PartUsageStatusText, type PartUsageStatus } from "../constants/PartUsageStatus";
import type { Crew } from "../types/Crew";
import type { RepairTicket } from "../types/RepairTicket";
import type { SparePartStock } from "../types/SparePartStock";
import type { SparePartUsageForm, SparePartUsageView } from "../types/SparePartUsage";
import ApprovalTable from "../components/common/ApprovalTable.vue";
import PartApplyForm from "../components/common/PartApplyForm.vue";
import RejectDialog from "../components/common/RejectDialog.vue";
import StatCard from "../components/common/StatCard.vue";

const session = useSessionStore();
const store = useSparePartUsageStore();
const { rows, loading, filters, warehouses, acting, shortageNotice } = storeToRefs(store);

const tickets = ref<RepairTicket[]>([]);
const crews = ref<Crew[]>([]);
const stocks = ref<SparePartStock[]>([]);
const notice = ref("");
const errorBox = ref("");
const submitting = ref(false);
const actingId = ref<number | null>(null);
const rejectTarget = ref<SparePartUsageView | null>(null);
const rejectOpen = computed({
  get: () => rejectTarget.value !== null,
  set: (open: boolean) => {
    if (!open) rejectTarget.value = null;
  }
});

const statusOptions = Object.entries(PartUsageStatusText) as Array<[PartUsageStatus, string]>;

const pendingCount = computed(() => rows.value.filter((r) => r.usage_status === "PENDING").length);
const shortCount = computed(
  () => rows.value.filter((r) => r.usage_status === "PENDING" && r.stock_short > 0).length
);
const approvedCount = computed(() => rows.value.filter((r) => r.usage_status === "APPROVED").length);

const ticketNumber = (id: number) => `#${id}`;
const partLabel = (row: SparePartUsageView | null) =>
  row ? `${row.part_name}（${row.part_code}）× ${row.quantity}，工单 ${ticketNumber(row.ticket_id)}` : "";

async function bootstrap() {
  errorBox.value = "";
  await store.load();
  const [ticketList, crewList, stockList] = await Promise.all([
    listRepairTicket().catch(() => []),
    listCrew().catch(() => []),
    listSparePartStock().catch(() => [])
  ]);
  tickets.value = ticketList;
  crews.value = crewList;
  stocks.value = stockList;
}

onMounted(bootstrap);

function onFilter() {
  errorBox.value = "";
  store.load();
}

async function onApprove(row: SparePartUsageView) {
  if (!session.canApprove) {
    // 越权请求直接说明原因（正常情况下按钮不可见，这里是双保险）
    errorBox.value = "越权请求：只有仓管可以批准备件申请，审计员为只读角色。";
    return;
  }
  if (row.stock_short > 0 && !window.confirm(`可用库存不足，尚缺 ${row.stock_short} 件。\n确认后该申请会标明缺口并保留待审批，不会扣减库存。是否继续？`)) {
    return;
  }
  actingId.value = row.id;
  errorBox.value = "";
  notice.value = "";
  try {
    const result = await store.approve(row.id);
    if (result.warning) {
      notice.value = result.warning;
    } else {
      notice.value = `已批准并出库，库存余量 ${result.record.stock_after_approval} 件，审批人：${result.record.approved_by}`;
    }
  } catch (err) {
    errorBox.value = err instanceof ApiError ? err.message : "批准失败，请稍后重试";
  } finally {
    actingId.value = null;
  }
}

function onRejectClick(row: SparePartUsageView) {
  if (!session.canApprove) {
    errorBox.value = "越权请求：只有仓管可以驳回备件申请。";
    return;
  }
  rejectTarget.value = row;
}

async function onRejectConfirm(reason: string) {
  if (!rejectTarget.value) return;
  actingId.value = rejectTarget.value.id;
  errorBox.value = "";
  notice.value = "";
  try {
    const result = await store.reject(rejectTarget.value.id, reason);
    notice.value = `已驳回 ${result.part_code}，原因已记录，审批人：${result.approved_by}`;
  } catch (err) {
    errorBox.value = err instanceof ApiError ? err.message : "驳回失败，请稍后重试";
  } finally {
    actingId.value = null;
  }
}

async function onApply(form: SparePartUsageForm) {
  submitting.value = true;
  errorBox.value = "";
  notice.value = "";
  try {
    const created = await store.submitApply(form as never);
    filters.value.status = "PENDING";
    notice.value = `申请已提交（记录 #${created.id}），状态：待审批，等待仓管核对库存`;
    await store.load();
  } catch (err) {
    errorBox.value = err instanceof ApiError ? err.message : "提交失败，请稍后重试";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <section class="parts-page">
    <header class="desk-head">
      <div>
        <p class="eyebrow">grid-repair / 备件审批台</p>
        <h1>备件领用审批台</h1>
        <p class="role-line">
          当前身份：<strong>{{ session.roleText }}</strong>
          <template v-if="session.user?.teamId">（{{ session.user.teamId }} 组）</template>
          <span v-if="session.readOnly" class="readonly-tag">只读 · 不可操作</span>
        </p>
      </div>
      <div v-if="session.isTeamLeader" class="scope-note">你只能查看和提交本班组（{{ session.teamId }} 组）工单的备件申请</div>
      <div v-else-if="session.isWarehouseKeeper" class="scope-note keeper">你可以审批全部仓库的备件申请</div>
    </header>

    <section class="metrics">
      <StatCard label="待审批申请" :value="pendingCount" />
      <StatCard label="其中库存不足" :value="shortCount" />
      <StatCard label="已批准（已出库）" :value="approvedCount" />
    </section>

    <div v-if="errorBox" class="alert error" role="alert">⚠ {{ errorBox }}</div>
    <div v-if="notice" class="alert ok" role="status">✓ {{ notice }}</div>
    <div v-if="shortageNotice && !notice" class="alert warn" role="status">⚠ {{ shortageNotice }}</div>

    <section class="panel filter-bar">
      <label>
        工单
        <input v-model="filters.ticketId" type="number" min="1" placeholder="如 101" @change="onFilter" />
      </label>
      <label>
        仓库
        <select v-model="filters.warehouse" @change="onFilter">
          <option value="">全部仓库</option>
          <option v-for="warehouse in warehouses" :key="warehouse" :value="warehouse">{{ warehouse }}</option>
        </select>
      </label>
      <label>
        申请状态
        <select v-model="filters.status" @change="onFilter">
          <option value="">全部状态</option>
          <option v-for="[value, text] in statusOptions" :key="value" :value="value">{{ text }}</option>
        </select>
      </label>
      <button class="btn ghost sm" @click="store.resetFilters()">重置筛选</button>
    </section>

    <PartApplyForm
      v-if="session.canApply && session.user?.teamId"
      :team-id="session.user.teamId"
      :tickets="tickets"
      :crews="crews"
      :stocks="stocks"
      :warehouses="warehouses.length ? warehouses : [...new Set(stocks.map((s) => s.warehouse_name))]"
      :submitting="submitting"
      @submit="onApply"
    />

    <h2 class="table-title">
      申请记录
      <span v-if="session.isTeamLeader" class="title-note">（仅本班组）</span>
    </h2>
    <ApprovalTable
      :rows="rows"
      :can-approve="session.canApprove"
      :acting-id="actingId"
      @approve="onApprove"
      @reject="onRejectClick"
    />
    <p v-if="loading" class="loading-line">加载中…</p>

    <RejectDialog
      v-model="rejectOpen"
      :part-label="partLabel(rejectTarget)"
      @confirm="onRejectConfirm"
    />
  </section>
</template>

<style scoped>
.parts-page { display: grid; gap: 18px; }
.desk-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; border-bottom: 1px solid #c9d0c3; padding-bottom: 16px; }
.desk-head h1 { font-size: 32px; margin: 4px 0; }
.role-line { margin: 0; color: #596257; font-size: 14px; }
.readonly-tag { margin-left: 8px; background: #e8e3d4; color: #6b5a1f; border-radius: 999px; padding: 2px 10px; font-size: 12px; font-weight: 800; }
.scope-note { background: #eef4ee; color: #274335; border: 1px solid #c9dcc9; border-radius: 8px; padding: 10px 14px; font-size: 13px; max-width: 360px; }
.scope-note.keeper { background: #f3efe3; border-color: #ddcf9f; }
.metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.panel { background: #fbfaf4; border: 1px solid #d8d6c8; border-radius: 8px; padding: 16px 18px; }
.filter-bar { display: flex; gap: 14px; align-items: flex-end; flex-wrap: wrap; }
.filter-bar label { display: grid; gap: 6px; font-size: 13px; font-weight: 700; }
.filter-bar input, .filter-bar select { padding: 9px 10px; border: 1px solid #c4c0b0; border-radius: 6px; font: inherit; min-width: 160px; background: #fff; }
.filter-bar input:focus, .filter-bar select:focus { outline: 2px solid #d39b46; border-color: #d39b46; }
.alert { border-radius: 8px; padding: 12px 16px; font-size: 14px; }
.alert.error { background: #fee2e2; border: 1px solid #f5a5a5; color: #991b1b; }
.alert.ok { background: #e3f4e6; border: 1px solid #9fd3a9; color: #166534; }
.alert.warn { background: #fef3cd; border: 1px solid #eed58a; color: #92590b; }
.table-title { margin: 4px 0 0; font-size: 18px; }
.title-note { font-size: 13px; color: #7a8075; font-weight: 500; }
.loading-line { color: #7a8075; font-size: 13px; }
@media (max-width: 760px) { .metrics { grid-template-columns: 1fr; } }
</style>
