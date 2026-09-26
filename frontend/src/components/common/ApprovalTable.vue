<script setup lang="ts">
import PartStatusBadge from "./PartStatusBadge.vue";
import StockCheckTag from "./StockCheckTag.vue";
import EmptyState from "./EmptyState.vue";
import { formatDate } from "../../utils/formatters";
import type { SparePartUsageView } from "../../types/SparePartUsage";

/**
 * 备件审批列表（审批台）：PartsPage 在仓管/班组长/审计员三种视角下共用。
 * 批准、驳回按钮仅仓管可见；审计员只读，班组长只看本组且无审批按钮。
 */
defineProps<{
  rows: SparePartUsageView[];
  canApprove: boolean;
  actingId: number | null;
}>();

const emit = defineEmits<{
  (e: "approve", row: SparePartUsageView): void;
  (e: "reject", row: SparePartUsageView): void;
}>();
</script>

<template>
  <div class="table-wrap">
    <table class="approval-table">
      <thead>
        <tr>
          <th>工单</th>
          <th>班组</th>
          <th>备件</th>
          <th>仓库</th>
          <th>申请量</th>
          <th>库存核对</th>
          <th>状态</th>
          <th>申请人 / 时间</th>
          <th>审批结果留痕</th>
          <th v-if="canApprove">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id" :class="{ pending: row.usage_status === 'PENDING', rejected: row.usage_status === 'REJECTED' }">
          <td class="mono">#{{ row.ticket_id }}</td>
          <td>{{ row.team_id }} 组</td>
          <td>
            <div class="part-name">{{ row.part_name }}</div>
            <div class="part-code">{{ row.part_code }}</div>
          </td>
          <td>{{ row.warehouse_name }}</td>
          <td class="qty">{{ row.quantity }}</td>
          <td>
            <StockCheckTag
              :available="row.available_quantity"
              :requested="row.quantity"
              :short="row.stock_short"
              :approved-remaining="row.stock_after_approval"
            />
            <div v-if="row.shortage_quantity" class="shortage-mark">已标记缺 {{ row.shortage_quantity }} 件 · 保留待审批</div>
          </td>
          <td><PartStatusBadge :status="row.usage_status" /></td>
          <td>
            <div>{{ row.requested_by }}</div>
            <div class="muted">{{ formatDate(row.requested_at) }}</div>
          </td>
          <td class="trace">
            <template v-if="row.usage_status === 'APPROVED'">
              <div>审批人：{{ row.approved_by }}</div>
              <div class="muted">{{ formatDate(row.approved_at) }}</div>
              <div class="rest">已扣减 · 余量 {{ row.stock_after_approval }}</div>
            </template>
            <template v-else-if="row.usage_status === 'REJECTED'">
              <div>审批人：{{ row.approved_by }}</div>
              <div class="muted">{{ formatDate(row.approved_at) }}</div>
              <div class="reason">原因：{{ row.reject_reason }}</div>
            </template>
            <template v-else><span class="muted">待仓管审批</span></template>
          </td>
          <td v-if="canApprove">
            <div v-if="row.usage_status === 'PENDING'" class="row-actions">
              <button class="btn primary sm" :disabled="actingId === row.id" @click="emit('approve', row)">批准</button>
              <button class="btn danger sm" :disabled="actingId === row.id" @click="emit('reject', row)">驳回</button>
            </div>
            <span v-else class="muted">已处理</span>
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td :colspan="canApprove ? 10 : 9"><EmptyState text="当前筛选条件下没有备件申请记录" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap { overflow-x: auto; border: 1px solid #d8d6c8; border-radius: 8px; background: #fbfaf4; }
table { border-collapse: collapse; width: 100%; min-width: 980px; font-size: 13px; }
th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e7e3d6; vertical-align: top; }
th { background: #f0ecdd; font-size: 12px; white-space: nowrap; }
tr.pending { background: #fffdf3; }
tr.rejected { background: #faf7f2; }
.mono { font-weight: 800; }
.part-name { font-weight: 700; }
.part-code, .muted { color: #7a8075; font-size: 12px; }
.qty { font-weight: 800; font-size: 15px; }
.shortage-mark { margin-top: 4px; color: #b91c1c; font-size: 12px; font-weight: 700; }
.rest { color: #1d4ed8; font-size: 12px; margin-top: 2px; }
.reason { color: #92400e; font-size: 12px; margin-top: 2px; max-width: 220px; }
.row-actions { display: flex; gap: 6px; }
</style>
