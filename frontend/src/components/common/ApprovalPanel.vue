<script setup lang="ts">
import { computed, ref } from "vue";
import StatusBadge from "./StatusBadge.vue";
import type { SparePartUsageView } from "../../types/SparePartUsage";
import { PART_USAGE_STATUS } from "../../constants/PartUsageStatus";
import { formatDate, formatApprover } from "../../utils/formatters";

const props = withDefaults(
  defineProps<{
    record: SparePartUsageView;
    // 非仓管角色（班组长/审计员/调度员）进入只读模式
    readonly?: boolean;
    // 只读原因，例如"审计员为只读角色"
    readonlyHint?: string;
    busy?: boolean;
  }>(),
  { readonly: false, readonlyHint: "", busy: false }
);

const emit = defineEmits<{
  (e: "approve", id: number): void;
  (e: "reject", id: number, reason: string): void;
}>();

const rejecting = ref(false);
const reason = ref("");
const reasonError = ref("");

const isPending = computed(() => props.record.usage_status === PART_USAGE_STATUS.PENDING);
const shortage = computed(() => props.record.current_shortage ?? 0);
const hasShortage = computed(() => isPending.value && shortage.value > 0);

const openReject = () => {
  rejecting.value = true;
  reason.value = "";
  reasonError.value = "";
};

const confirmReject = () => {
  if (!reason.value.trim()) {
    reasonError.value = "驳回必须填写原因";
    return;
  }
  emit("reject", props.record.id, reason.value.trim());
  rejecting.value = false;
};
</script>

<template>
  <article class="approval-card" :class="{ 'is-shortage': hasShortage }">
    <header class="approval-head">
      <div>
        <strong>工单 #{{ record.ticket_id }}</strong>
        <span class="muted" v-if="record.team_name">（{{ record.team_name }}）</span>
        <span class="applicant">申请人：{{ record.applicant_name }}</span>
      </div>
      <StatusBadge :value="record.usage_status" />
    </header>

    <div class="approval-body">
      <div class="part-meta">
        <strong>{{ record.part_name }}</strong>
        <span class="muted">{{ record.part_code }} · {{ record.warehouse_name }}</span>
      </div>

      <!-- 批准前核对：申请量 vs 可用库存 -->
      <div v-if="isPending" class="stock-check" :class="{ short: hasShortage }">
        <template v-if="hasShortage">
          <span class="short-tag">库存不足：申请 {{ record.quantity }} 件，可用 {{ record.available_quantity }} 件，<b>缺 {{ shortage }} 件</b></span>
          <span class="muted">已保留待审批，补货后可再批准</span>
        </template>
        <template v-else>
          <span>申请 <b>{{ record.quantity }}</b> 件 · 可用 <b>{{ record.available_quantity }}</b> 件 · 库存充足</span>
        </template>
      </div>

      <!-- 已审批记录：审批结果、库存余量、审批人 -->
      <div v-else class="approval-result">
        <span v-if="record.usage_status === 'APPROVED'" class="result-line">
          已出库 {{ record.quantity }} 件，出库后余量 <b>{{ record.stock_remaining }}</b> 件
        </span>
        <span v-else-if="record.usage_status === 'REJECTED'" class="result-line reject-text">
          驳回原因：{{ record.reject_reason }}
        </span>
        <span class="muted">审批人：{{ formatApprover(record.approved_by, record.approved_at) }}</span>
      </div>

      <div class="muted small">提交时间：{{ formatDate(record.created_at) }}</div>
    </div>

    <!-- 仓管操作区 -->
    <footer v-if="isPending && !readonly" class="approval-actions">
      <button class="btn primary" :disabled="busy || hasShortage" @click="emit('approve', record.id)">
        批准并扣减库存
      </button>
      <button class="btn danger" :disabled="busy" @click="openReject">驳回</button>
      <span v-if="hasShortage" class="muted small">库存不足时不能批准，请协调补货或驳回</span>
    </footer>

    <!-- 驳回原因填写 -->
    <div v-if="rejecting && isPending && !readonly" class="reject-box">
      <label>驳回原因（必填）</label>
      <textarea v-model="reason" rows="2" placeholder="请说明驳回原因，将同步给申请班组"></textarea>
      <p v-if="reasonError" class="field-error">{{ reasonError }}</p>
      <div class="reject-actions">
        <button class="btn" :disabled="busy" @click="rejecting = false">取消</button>
        <button class="btn danger" :disabled="busy" @click="confirmReject">确认驳回</button>
      </div>
    </div>

    <footer v-if="isPending && readonly && readonlyHint" class="approval-actions readonly-note">
      <span class="muted small">{{ readonlyHint }}</span>
    </footer>
  </article>
</template>
