<template>
  <div class="skeleton-table">
    <div v-for="i in rows" :key="i" class="skeleton-row">
      <div v-for="j in cols" :key="j" class="skeleton-cell">
        <div class="skeleton-bar" :style="{ width: widths[(i + j) % widths.length] }" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  rows: { type: Number, default: 5 },
  cols: { type: Number, default: 4 },
})
const widths = ['60%', '85%', '45%', '70%', '55%']
</script>

<style scoped lang="scss">
.skeleton-table {
  border-radius: $radius; overflow: hidden;
  border: 1px solid $border-color;
}
.skeleton-row {
  display: flex; gap: 16px; padding: 14px 20px;
  border-bottom: 1px solid $border-color;
  background: $bg-card;
  &:last-child { border-bottom: none; }
}
.skeleton-bar {
  height: 14px; border-radius: 4px;
  background: linear-gradient(90deg, $border-color 25%, darken($border-color, 2%) 50%, $border-color 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
