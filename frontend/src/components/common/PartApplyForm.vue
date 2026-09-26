<script setup lang="ts">
import { computed, ref } from "vue";
import { createSparePartUsageForm } from "../../constructors/SparePartUsageConstructor";
import type { RepairTicket } from "../../types/RepairTicket";
import type { Crew } from "../../types/Crew";
import type { SparePartStock } from "../../types/SparePartStock";
import type { SparePartUsageForm } from "../../types/SparePartUsage";

/**
 * 班组长备件申请：只允许选择本班组承接的工单；
 * 仓库 + 备件从库存台账选择，避免申请仓库里不存在的备件。
 */
const props = defineProps<{
  teamId: number;
  tickets: RepairTicket[];
  crews: Crew[];
  stocks: SparePartStock[];
  warehouses: string[];
  submitting: boolean;
}>();

const emit = defineEmits<{ (e: "submit", form: SparePartUsageForm): void }>();

const form = ref<SparePartUsageForm>(createSparePartUsageForm());

const teamTickets = computed(() => props.tickets.filter((ticket) => ticket.team_id === props.teamId));
const stockOptions = computed(() =>
  props.stocks.filter((stock) => stock.warehouse_name === form.value.warehouse_name)
);

const selectedStock = computed(() =>
  props.stocks.find(
    (stock) => stock.warehouse_name === form.value.warehouse_name && stock.part_code === form.value.part_code
  )
);

const formValid = computed(
  () =>
    form.value.ticket_id !== "" &&
    !!form.value.warehouse_name &&
    !!form.value.part_code &&
    Number.isInteger(form.value.quantity) &&
    form.value.quantity > 0
);

const onWarehouseChange = () => {
  form.value.part_code = "";
  form.value.part_name = "";
};
const onPartChange = (code: string) => {
  const stock = props.stocks.find(
    (item) => item.warehouse_name === form.value.warehouse_name && item.part_code === code
  );
  form.value.part_code = code;
  form.value.part_name = stock?.part_name ?? "";
};
const submit = () => {
  if (!formValid.value) return;
  emit("submit", { ...form.value, ticket_id: Number(form.value.ticket_id) });
  form.value = createSparePartUsageForm();
};
</script>

<template>
  <div class="panel apply-panel">
    <h2>提交备件申请</h2>
    <p class="hint">仅可为本组承接的工单申请；批准前仓管会核对申请量与可用库存。</p>
    <div class="form-grid">
      <label>
        <span>工单 *</span>
        <select v-model="form.ticket_id">
          <option value="" disabled>选择本组工单</option>
          <option v-for="ticket in teamTickets" :key="ticket.id" :value="ticket.id">
            #{{ ticket.id }}（{{ ticket.status }}）
          </option>
        </select>
      </label>
      <label>
        <span>仓库 *</span>
        <select v-model="form.warehouse_name" @change="onWarehouseChange">
          <option value="" disabled>选择仓库</option>
          <option v-for="warehouse in warehouses" :key="warehouse" :value="warehouse">{{ warehouse }}</option>
        </select>
      </label>
      <label>
        <span>备件 *</span>
        <select :value="form.part_code" :disabled="!form.warehouse_name" @change="onPartChange(($event.target as HTMLSelectElement).value)">
          <option value="" disabled>选择备件</option>
          <option v-for="stock in stockOptions" :key="stock.part_code" :value="stock.part_code">
            {{ stock.part_name }}（{{ stock.part_code }} / 可用 {{ stock.available_quantity }} {{ stock.unit }}）
          </option>
        </select>
      </label>
      <label>
        <span>申请数量 *</span>
        <input v-model.number="form.quantity" type="number" min="1" step="1" />
      </label>
    </div>
    <p v-if="selectedStock" class="avail-hint" :class="{ over: form.quantity > selectedStock.available_quantity }">
      当前可用 {{ selectedStock.available_quantity }} {{ selectedStock.unit }}<template v-if="form.quantity > selectedStock.available_quantity">
        ，超出 {{ form.quantity - selectedStock.available_quantity }} {{ selectedStock.unit }}，提交后将保留待审批
      </template>
    </p>
    <div class="actions">
      <button class="btn primary" :disabled="!formValid || submitting" @click="submit">
        {{ submitting ? "提交中…" : "提交申请" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.apply-panel { background: #fbfaf4; border: 1px solid #d8d6c8; border-radius: 8px; padding: 18px; }
.hint { color: #596257; font-size: 13px; margin: 0 0 14px; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
label { display: grid; gap: 5px; font-size: 13px; font-weight: 700; }
select, input { padding: 9px 10px; border: 1px solid #c4c0b0; border-radius: 6px; font: inherit; background: #fff; }
select:focus, input:focus { outline: 2px solid #d39b46; border-color: #d39b46; }
.avail-hint { margin: 12px 0 0; font-size: 12px; color: #15803d; }
.avail-hint.over { color: #b45309; font-weight: 700; }
.actions { margin-top: 14px; display: flex; justify-content: flex-end; }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
</style>
