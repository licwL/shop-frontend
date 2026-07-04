<template>
  <div class="home-page">
    <div class="home-layout">
      <!-- 左侧分类 -->
      <aside class="sidebar">
        <h3 class="side-title">商品分类</h3>
        <div
          v-for="c in categories" :key="c.id"
          class="side-item" :class="{ active: activeCid === c.id }"
          @click="activeCid = c.id; handleSearch()"
        >{{ c.name }}</div>
        <div class="side-item" :class="{ active: activeCid === null }" @click="activeCid = null; handleSearch()">全部商品</div>
      </aside>

      <!-- 右侧内容 -->
      <div class="content">
        <!-- 搜索 -->
        <div class="search-row">
          <el-input v-model="keyword" placeholder="搜索商品名称" clearable class="search-inp" @keyup.enter="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>

        <!-- 商品网格 -->
        <div class="product-grid" v-loading="loading">
          <div v-if="!loading && list.length === 0" class="empty-tip">
            <el-empty description="暂无商品" :image-size="100" />
          </div>
          <div
            v-for="item in list" :key="item.id"
            class="product-card" @click="router.push('/product/' + item.id)"
          >
            <div class="card-img">
              <el-image v-if="item.image" :src="item.image" fit="cover" class="img-el" />
              <div v-else class="img-place"><el-icon :size="40"><PictureFilled /></el-icon></div>
            </div>
            <div class="card-body">
              <div class="card-name">{{ item.name }}</div>
              <div class="card-meta">
                <span class="card-price">¥{{ item.price?.toFixed(2) }}</span>
                <span class="card-sales">已售 {{ item.sales || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="pager" v-if="total > pagination.pageSize">
          <Pagination v-model:page="pagination.page" v-model:page-size="pagination.pageSize" :total="total" @change="fetchList" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, PictureFilled } from '@element-plus/icons-vue'
import Pagination from '@shared/components/Pagination.vue'
import { getProductPage } from '@/api/product'

const router = useRouter()
const list = ref([])
const total = ref(0)
const loading = ref(false)
const keyword = ref('')
const activeCid = ref(null)
const pagination = reactive({ page: 1, pageSize: 20 })
const categories = ref([])

async function fetchCategories() {
  try {
    const res = await getProductPage({ page: 1, pageSize: 200 })
    const products = res.data.records ?? []
    const catMap = new Map()
    products.forEach(p => {
      if (p.categoryId && p.categoryName && !catMap.has(p.categoryId)) {
        catMap.set(p.categoryId, { id: p.categoryId, name: p.categoryName })
      }
    })
    categories.value = Array.from(catMap.values())
  } catch { /* ignore */ }
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getProductPage({
      page: pagination.page,
      pageSize: pagination.pageSize,
      name: keyword.value || undefined,
      categoryId: activeCid.value ?? undefined,
    })
    list.value = res.data.records ?? []
    total.value = res.data.total ?? 0
  } catch { /* ignore */ } finally { loading.value = false }
}

function handleSearch() {
  pagination.page = 1
  fetchList()
}

onMounted(() => { fetchCategories(); fetchList() })
</script>

<style scoped lang="scss">
.home-page {
  .home-layout {
    display: flex;
    gap: 20px;
  }

  .sidebar {
    width: 180px;
    flex-shrink: 0;
    background: $bg-card;
    border-radius: $radius;
    padding: 14px 0;

    .side-title {
      font-size: 14px;
      font-weight: 600;
      padding: 0 16px 12px;
      border-bottom: 1px solid $border-color;
      margin-bottom: 6px;
      color: $text-primary;
    }

    .side-item {
      padding: 9px 16px;
      font-size: 13px;
      color: $text-secondary;
      cursor: pointer;

      &:hover { color: $--el-color-primary; background: $--el-color-primary-light-9; }
      &.active { color: $--el-color-primary; font-weight: 600; background: $--el-color-primary-light-9; }
    }
  }

  .content {
    flex: 1;
    min-width: 0;
  }

  .search-row {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;

    .search-inp { width: 320px; }
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .product-card {
    background: $bg-card;
    border-radius: $radius;
    overflow: hidden;
    cursor: pointer;
    transition: box-shadow 0.2s;

    &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

    .card-img {
      width: 100%;
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
      }

      .card-meta {
        display: flex;
        justify-content: space-between;
        align-items: baseline;

        .card-price { font-size: 18px; font-weight: 700; color: #F56C6C; }
        .card-sales { font-size: 12px; color: $text-secondary; }
      }
    }
  }

  .pager { margin-top: 20px; display: flex; justify-content: center; }
  .empty-tip { grid-column: 1 / -1; }
}
</style>
