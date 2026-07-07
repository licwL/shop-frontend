<template>
  <div class="page-container">
    <h2 class="page-title display-font">
      <el-icon class="back-icon" @click="$router.back()"><ArrowLeft /></el-icon>
      我的通知
    </h2>

    <div v-if="!list.length && !loading" class="empty">
      <el-empty description="暂无通知" :image-size="80" />
    </div>

    <div v-else class="notif-list" v-loading="loading">
      <div
        v-for="n in list" :key="n.id"
        class="notif-item" :class="{ unread: !n.isRead }"
        @click="handleClick(n)"
      >
        <div class="ni-dot" v-if="!n.isRead"></div>
        <div class="ni-body">
          <div class="ni-head">
            <span class="ni-title">{{ n.title }}</span>
            <span class="ni-time">{{ fmt(n.createTime) }}</span>
          </div>
          <div class="ni-content" v-show="expandedId === n.id">{{ n.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getNotifications, markRead } from '@/api/notification'

const list = ref([])
const loading = ref(false)
const expandedId = ref(null)

async function fetchList() {
  loading.value = true
  try {
    const res = await getNotifications()
    list.value = res.data ?? []
  } catch { /* ignore */ } finally { loading.value = false }
}

async function handleClick(n) {
  expandedId.value = expandedId.value === n.id ? null : n.id
  if (!n.isRead) {
    try { await markRead(n.id); n.isRead = 1 } catch { /* ignore */ }
  }
}

function fmt(v) { return v ? new Date(v).toLocaleString('zh-CN') : '-' }

onMounted(() => fetchList())
</script>

<style scoped lang="scss">
.page-title { font-size: 24px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
.back-icon { cursor: pointer; color: $text-secondary; &:hover { color: $--el-color-primary; } }
.empty { padding-top: 60px; }

.notif-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 12px;
  border-bottom: 1px solid $border-color;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: $bg-page; border-radius: $radius-sm; }
  &.unread { background: $--el-color-primary-light-9; border-radius: $radius-sm; }
}

.ni-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: $accent;
  margin-top: 6px;
  flex-shrink: 0;
}

.ni-body { flex: 1; min-width: 0; }

.ni-head {
  display: flex; justify-content: space-between; gap: 12px;
  .ni-title { font-size: 14px; font-weight: 500; color: $text-primary; }
  .ni-time { font-size: 12px; color: $text-secondary; flex-shrink: 0; }
}

.ni-content {
  margin-top: 8px;
  padding: 10px 12px;
  background: $bg-page;
  border-radius: $radius-sm;
  font-size: 13px; color: $text-secondary; line-height: 1.7;
}
</style>
