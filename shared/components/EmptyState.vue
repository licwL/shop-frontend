<template>
  <div class="empty-state">
    <div class="empty-icon">
      <slot name="icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="10" width="48" height="44" rx="4" stroke-width="1.5" stroke="currentColor" opacity="0.3" />
          <path d="M24 30h16M24 38h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.3" />
        </svg>
      </slot>
    </div>
    <p class="empty-title">{{ title }}</p>
    <p v-if="description" class="empty-desc">{{ description }}</p>
    <slot name="action" />
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '暂无数据' },
  description: { type: String, default: '' },
})
</script>

<style scoped lang="scss">
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 48px 20px; color: $text-muted;
}
.empty-icon { margin-bottom: 16px; opacity: 0.5; }
.empty-title { font-size: 15px; color: $text-secondary; margin-bottom: 6px; font-weight: 500; }
.empty-desc { font-size: 13px; color: $text-muted; }
</style>
