<script setup lang="ts">
import { ref, watch } from "vue";

/**
 * 驳回弹窗：驳回原因必填，空原因时确认按钮禁用并给出提示。
 * 越权（审计员/班组长）场景在父组件直接不渲染按钮，不依赖弹窗拦截。
 */
const props = defineProps<{ modelValue: boolean; partLabel: string }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "confirm", reason: string): void;
}>();

const reason = ref("");
const touched = ref(false);

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      reason.value = "";
      touched.value = false;
    }
  }
);

const trimmed = () => reason.value.trim();
const close = () => emit("update:modelValue", false);
const confirm = () => {
  touched.value = true;
  if (!trimmed()) return;
  emit("confirm", trimmed());
  close();
};
</script>

<template>
  <div v-if="modelValue" class="modal-mask" @click.self="close">
    <div class="modal" role="dialog" aria-modal="true" aria-label="驳回首备件申请">
      <h3>驳回首备件申请</h3>
      <p class="modal-target">{{ partLabel }}</p>
      <label class="field-label" for="reject-reason">驳回原因 <em>*</em></label>
      <textarea
        id="reject-reason"
        v-model="reason"
        rows="4"
        placeholder="请填写驳回原因，班组长将据此修改申请（必填）"
        @blur="touched = true"
      ></textarea>
      <p v-if="touched && !trimmed()" class="field-error">驳回原因不能为空</p>
      <div class="modal-actions">
        <button type="button" class="btn ghost" @click="close">取消</button>
        <button type="button" class="btn danger" :disabled="!trimmed()" @click="confirm">确认驳回</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-mask { position: fixed; inset: 0; background: rgba(20, 30, 24, 0.45); display: flex; align-items: center; justify-content: center; z-index: 50; }
.modal { background: #fbfaf4; border-radius: 10px; padding: 22px 24px; width: 460px; max-width: calc(100vw - 40px); border: 1px solid #d8d6c8; }
.modal h3 { margin: 0 0 6px; }
.modal-target { margin: 0 0 14px; color: #596257; font-size: 13px; }
.field-label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 6px; }
.field-label em { color: #b91c1c; font-style: normal; }
textarea { width: 100%; box-sizing: border-box; border: 1px solid #c4c0b0; border-radius: 6px; padding: 10px; font: inherit; resize: vertical; background: #fff; }
textarea:focus { outline: 2px solid #d39b46; border-color: #d39b46; }
.field-error { color: #b91c1c; font-size: 12px; margin: 6px 0 0; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
</style>
