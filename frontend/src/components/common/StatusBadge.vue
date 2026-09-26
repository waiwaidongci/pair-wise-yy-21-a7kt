<script setup lang="ts">
import { computed } from "vue";
import { PART_USAGE_STATUS_TEXT } from "../../constants/PartUsageStatus";

const props = defineProps<{ value: string; tone?: string }>();

// 审批状态自动着色；其余枚举维持原展示
const toneClass = computed(() => {
  if (props.tone) return `tone-${props.tone}`;
  return {
    PENDING: "tone-warning",
    APPROVED: "tone-success",
    REJECTED: "tone-danger",
    RETURNED: "tone-neutral"
  }[props.value] ?? "tone-neutral";
});

const label = computed(() => PART_USAGE_STATUS_TEXT[props.value as keyof typeof PART_USAGE_STATUS_TEXT] ?? props.value.replace(/_/g, " "));
</script>

<template>
  <span class="badge" :class="toneClass">{{ label }}</span>
</template>
