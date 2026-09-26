<script setup lang="ts">
import { computed } from "vue";

/**
 * 批准前库存核对：充足显示余量，不足标明“缺 N 件”。
 * approvedRemaining：已批准记录上留存的扣减后余量。
 */
const props = defineProps<{
  available: number;
  requested: number;
  short: number;
  approvedRemaining?: number | null;
}>();

const enough = computed(() => props.short <= 0);
</script>

<template>
  <div class="stock-check">
    <span class="stock-avail" :class="{ low: available < 10 }">可用库存 <strong>{{ available }}</strong></span>
    <span v-if="!enough" class="stock-short">缺 {{ short }} 件</span>
    <span v-else-if="approvedRemaining !== null && approvedRemaining !== undefined" class="stock-rest">
      出库后余量 {{ approvedRemaining }}
    </span>
    <span v-else class="stock-ok">库存充足</span>
  </div>
</template>

<style scoped>
.stock-check { display: inline-flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.stock-avail strong { font-size: 15px; }
.stock-avail.low { color: #b45309; }
.stock-short { background: #fee2e2; color: #b91c1c; font-weight: 800; border-radius: 999px; padding: 2px 10px; font-size: 12px; }
.stock-ok { color: #15803d; font-size: 12px; font-weight: 700; }
.stock-rest { color: #1d4ed8; font-size: 12px; font-weight: 700; }
</style>
