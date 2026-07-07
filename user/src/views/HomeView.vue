<template>
  <div class="page-container">
    <div class="home-layout">
      <!-- 左侧分类 (桌面) -->
      <aside class="sidebar">
        <h3 class="side-title display-font">分类</h3>
        <div class="side-item" :class="{ active: !activeCid }" @click="activeCid = null; search()">全部</div>
        <div v-for="c in categories" :key="c.id" class="side-item" :class="{ active: activeCid === c.id }" @click="activeCid = c.id; search()">{{ c.name }}</div>
      </aside>

      <div class="content">
        <!-- 搜索 -->
        <div class="search-row">
          <el-input v-model="keyword" placeholder="搜索商品" clearable class="search-inp" @keyup.enter="search" size="large">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-button type="primary" size="large" @click="search">搜索</el-button>
        </div>

        <!-- 公告横幅 -->
        <div v-if="notices.length" class="notice-bar">
          <div class="notice-inner">
            <el-icon class="notice-icon"><Bell /></el-icon>
            <div class="notice-scroll">
              <div class="notice-track" :style="{ transform: 'translateX(-' + noticeOffset + 'px)' }">
                <span v-for="n in loopNotices" :key="n.id" class="notice-item">{{ n.title }}</span>
              </div>
            </div>
            <el-button text size="small" type="primary" class="notice-more" @click="showNotices = true">查看全部</el-button>
          </div>
        </div>

        <!-- 公告弹窗 -->
        <el-dialog v-model="showNotices" title="平台公告" width="520px">
          <div
            v-for="n in notices" :key="n.id"
            class="notice-dialog-item" :class="{ expanded: expandedId === n.id }"
            @click="expandedId = expandedId === n.id ? null : n.id"
          >
            <div class="ndi-head">
              <span class="ndi-title">{{ n.title }}</span>
              <span class="ndi-time">{{ n.createTime?.slice(0,10) }}</span>
            </div>
            <div class="ndi-body" v-show="expandedId === n.id">
              <div class="ndi-content">{{ n.content }}</div>
            </div>
          </div>
        </el-dialog>

        <!-- 移动端分类滚动 -->
        <div class="cats-scroll">
          <span class="cs-item" :class="{ active: !activeCid }" @click="activeCid = null; search()">全部</span>
          <span v-for="c in categories" :key="c.id" class="cs-item" :class="{ active: activeCid === c.id }" @click="activeCid = c.id; search()">{{ c.name }}</span>
        </div>

        <!-- 商品网格 -->
        <div class="product-grid" v-loading="loading">
          <div v-if="!loading && !list.length" class="empty"><el-empty description="暂无商品" :image-size="100" /></div>
          <div v-for="(item, i) in list" :key="item.id" class="product-card" :style="{ animationDelay: i * 0.03 + 's' }" @click="$router.push('/product/' + item.id)">
            <div class="card-img">
              <el-image v-if="item.image" :src="item.image" fit="cover" class="img-el" />
              <div v-else class="img-place"><el-icon :size="36"><PictureFilled /></el-icon></div>
            </div>
            <div class="card-body">
              <div class="card-name">{{ item.name }}</div>
              <div class="card-foot">
                <span class="card-price">¥{{ item.price?.toFixed(2) }}</span>
                <span class="card-sales">已售 {{ item.sales || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="pager" v-if="total > pageSize">
          <Pagination v-model:page="page" v-model:page-size="pageSize" :total="total" @change="fetchList" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Search, PictureFilled, Bell } from '@element-plus/icons-vue'
import Pagination from '@shared/components/Pagination.vue'
import { getProductPage } from '@/api/product'
import { getNoticePage } from '@/api/notice'

defineOptions({ name: 'HomeView' })

const list = ref([])
const total = ref(0)
const loading = ref(false)
const keyword = ref('')
const activeCid = ref(null)
const page = ref(1)
const pageSize = ref(20)
const categories = ref([])

// 公告
const notices = ref([])
const showNotices = ref(false)
const expandedId = ref(null)
const noticeOffset = ref(0)
const loopNotices = computed(() => [...notices.value, ...notices.value])

async function loadNotices() {
  try {
    const r = await getNoticePage({ page: 1, pageSize: 5 })
    notices.value = (r.data?.records || []).filter(n => n.status === 1)
  } catch { /* ignore */ }
}

// 公告滚轮
let noticeTimer = null
function startNoticeScroll() {
  if (notices.value.length <= 1) return
  noticeTimer = setInterval(() => {
    noticeOffset.value += 1
    const singleWidth = 300
    if (noticeOffset.value >= notices.value.length * singleWidth) {
      noticeOffset.value = 0
    }
  }, 40)
}
onMounted(() => { loadNotices().then(() => { if (notices.value.length > 1) startNoticeScroll() }) })
onUnmounted(() => { clearInterval(noticeTimer) })

async function loadCats() {
  try {
    const res = await getProductPage({ page: 1, pageSize: 200 })
    const map = new Map()
    ;(res.data.records || []).forEach(p => {
      if (p.categoryId && p.categoryName) map.set(p.categoryId, { id: p.categoryId, name: p.categoryName })
    })
    categories.value = Array.from(map.values())
  } catch { /* ignore */ }
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getProductPage({ page: page.value, pageSize: pageSize.value, name: keyword.value || undefined, categoryId: activeCid.value ?? undefined })
    list.value = res.data.records ?? []
    total.value = res.data.total ?? 0
  } catch { /* ignore */ } finally { loading.value = false }
}

function search() { page.value = 1; fetchList() }

onMounted(() => { loadCats(); fetchList() })
</script>

<style scoped lang="scss">
.page-container { padding-bottom: 32px; }

.home-layout {
  display: flex;
  gap: 24px;
}

// ---- Sidebar ----
.sidebar {
  width: 160px;
  flex-shrink: 0;
  background: $bg-card;
  border-radius: $radius;
  padding: 14px 0;
  align-self: flex-start;
  position: sticky;
  top: 72px;

  @media (max-width: $bp-mobile) { display: none; }
}

.side-title { font-size: 15px; padding: 0 18px 12px; border-bottom: 1px solid $border-color; margin-bottom: 4px; color: $text-primary; }

.side-item {
  padding: 9px 18px;
  font-size: 13px;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { color: $--el-color-primary; background: $--el-color-primary-light-9; }
  &.active { color: $--el-color-primary; font-weight: 600; background: $--el-color-primary-light-9; border-right: 3px solid $--el-color-primary; }
}

// ---- Content ----
.content { flex: 1; min-width: 0; }

// 公告横幅
.notice-bar {
  margin-bottom: 14px;
  background: linear-gradient(90deg, #{$--el-color-primary-light-9}, #{$bg-card});
  border: 1px solid $--el-color-primary-light-7;
  border-radius: $radius-sm;
  overflow: hidden;
}

.notice-inner {
  display: flex;
  align-items: center;
  padding: 9px 14px;
  gap: 10px;
}

.notice-icon {
  color: $--el-color-primary;
  font-size: 16px;
  flex-shrink: 0;
}

.notice-scroll {
  flex: 1;
  overflow: hidden;
  position: relative;
  height: 20px;
}

.notice-track {
  display: flex;
  gap: 300px;
  transition: transform 0.04s linear;
  white-space: nowrap;
}

.notice-item {
  font-size: 13px;
  color: $text-primary;
  min-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-more {
  flex-shrink: 0;
  font-size: 12px;
}

.notice-dialog-item {
  padding: 12px 0;
  border-bottom: 1px solid $border-color;
  cursor: pointer;
  transition: background 0.15s;

  &:last-child { border-bottom: none; }
  &:hover { background: $bg-page; margin: 0 -16px; padding: 12px 16px; border-radius: $radius-sm; }

  .ndi-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
  }

  .ndi-title {
    font-size: 14px; font-weight: 500; color: $text-primary; flex: 1;

    &::before { content: '▸'; margin-right: 6px; font-size: 10px; color: $--el-color-primary; transition: transform 0.2s; display: inline-block; }
  }

  &.expanded .ndi-title::before { transform: rotate(90deg); }

  .ndi-time { font-size: 12px; color: $text-secondary; flex-shrink: 0; }

  .ndi-body {
    margin-top: 10px;
    padding: 12px 14px;
    background: $bg-page;
    border-radius: $radius-sm;
  }

  .ndi-content { font-size: 13px; color: $text-secondary; line-height: 1.8; }
}

.search-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;

  .search-inp { width: 320px; }
  @media (max-width: $bp-small) { .search-inp { width: auto; flex: 1; } }
}

// 移动端分类
.cats-scroll {
  display: none;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 12px;

  @media (max-width: $bp-mobile) { display: flex; }

  .cs-item {
    flex-shrink: 0;
    padding: 6px 16px;
    font-size: 13px;
    font-weight: 500;
    color: $text-secondary;
    background: $bg-card;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s;

    &.active { color: #fff; background: $--el-color-primary; }
  }
}

// ---- Product Grid ----
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: $bp-tablet) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: $bp-small) { grid-template-columns: repeat(2, 1fr); gap: 10px; }
}

.product-card {
  background: $bg-card;
  border-radius: $radius;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.25s, box-shadow 0.25s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-hover;

    .card-price { color: $accent; }
  }

  .card-img {
    aspect-ratio: 1;
    background: $--el-color-primary-light-9;
    display: flex;
    align-items: center;
    justify-content: center;

    .img-el { width: 100%; height: 100%; }
    .img-place { color: $--el-color-primary-light-5; }
  }

  .card-body {
    padding: 12px 14px 14px;

    .card-name {
      font-size: 14px;
      color: $text-primary;
      line-height: 1.4;
      height: 40px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .card-foot {
      display: flex;
      justify-content: space-between;
      align-items: baseline;

      .card-price {
        font-family: 'DM Serif Display', serif;
        font-size: 18px;
        font-weight: 600;
        color: $text-primary;
        transition: color 0.2s;
      }
      .card-sales { font-size: 12px; color: $text-secondary; }
    }
  }
}

.pager { margin-top: 24px; display: flex; justify-content: center; }
.empty { grid-column: 1 / -1; }
</style>
