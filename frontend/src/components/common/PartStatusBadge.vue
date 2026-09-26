<script setup lang="ts">
import { computed } from "vue";
import { PartUsageStatusText, type PartUsageStatus } from "../../constants/PartUsageStatus";

const props = defineProps<{ status: PartUsageStatus | string }>();

const text = computed(() => PartUsageStatusText[props.status as PartUsageStatus] ?? props.status.replace(/_/g, " "));
const toneClass = computed(() => `tone-${String(props.status).toLowerCase()}`);
</script>

<template>
  <span class="badge part-badge" :class="toneClass">{{ text }}</span>
</template>
