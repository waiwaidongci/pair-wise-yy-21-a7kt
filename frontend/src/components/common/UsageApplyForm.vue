<script setup lang="ts">
import { reactive, ref } from "vue";
import { createSparePartUsageForm } from "../../constructors/SparePartUsageConstructor";
import type { RepairTicket } from "../../types/RepairTicket";

const props = defineProps<{
  warehouses: string[];
  tickets: RepairTicket[];
  busy?: boolean;
}>();

const emit = defineEmits<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (e: "submit", payload: any): void;
  (e: "cancel"): void;
}>();

const form = reactive(createSparePartUsageForm({ warehouse_name: props.warehouses[0] ?? "中心库" }));
const errors = ref<Record<string, string>>({});

const validate = () => {
  errors.value = {};
  if (!Number(form.ticket_id) || Number(form.ticket_id) <= 0) errors.value.ticket_id = "请选择本组工单";
  if (!form.part_code.trim()) errors.value.part_code = "请填写备件编码";
  if (!form.part_name.trim()) errors.value.part_name = "请填写备件名称";
  if (!form.warehouse_name) errors.value.warehouse_name = "请选择领料仓库";
  if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) <= 0) errors.value.quantity = "申请数量必须为正整数";
  return Object.keys(errors.value).length === 0;
};

const submit = () => {
  if (!validate()) return;
  emit("submit", {
    ticket_id: Number(form.ticket_id),
    part_code: form.part_code.trim(),
    part_name: form.part_name.trim(),
    quantity: Number(form.quantity),
    warehouse_name: form.warehouse_name
  });
};
</script>

<template>
  <form class="apply-form" @submit.prevent="submit">
    <h3>提交工单材料申请</h3>
    <div class="form-grid">
      <label>
        工单
        <select v-model="form.ticket_id">
          <option value="">请选择本组工单</option>
          <option v-for="ticket in tickets" :key="ticket.id" :value="ticket.id">#{{ ticket.id }} · {{ ticket.status }}</option>
        </select>
        <span v-if="errors.ticket_id" class="field-error">{{ errors.ticket_id }}</span>
      </label>
      <label>
        领料仓库
        <select v-model="form.warehouse_name">
          <option v-for="warehouse in warehouses" :key="warehouse" :value="warehouse">{{ warehouse }}</option>
        </select>
        <span v-if="errors.warehouse_name" class="field-error">{{ errors.warehouse_name }}</span>
      </label>
      <label>
        备件编码
        <input v-model="form.part_code" placeholder="如 SP-1001" />
        <span v-if="errors.part_code" class="field-error">{{ errors.part_code }}</span>
      </label>
      <label>
        备件名称
        <input v-model="form.part_name" placeholder="如 低压电缆 YJV-4x35" />
        <span v-if="errors.part_name" class="field-error">{{ errors.part_name }}</span>
      </label>
      <label>
        申请数量
        <input v-model.number="form.quantity" type="number" min="1" step="1" />
        <span v-if="errors.quantity" class="field-error">{{ errors.quantity }}</span>
      </label>
    </div>
    <div class="form-actions">
      <button type="button" class="btn" :disabled="busy" @click="emit('cancel')">取消</button>
      <button type="submit" class="btn primary" :disabled="busy">提交申请</button>
    </div>
    <p class="muted small">提交后进入仓库审批台，由仓管核对库存后批准或驳回。</p>
  </form>
</template>
