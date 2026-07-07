<template>
  <div class="page-container">
    <h2 class="page-title display-font">
      <el-icon class="back-icon" @click="$router.back()"><ArrowLeft /></el-icon>
      我的收藏
    </h2>

    <div v-if="!list.length && !loading" class="empty">
      <el-empty description="还没有收藏商品">
        <el-button type="primary" @click="$router.push('/home')">去逛逛</el-button>
      </el-empty>
    </div>

    <div v-else class="fav-grid" v-loading="loading">
      <div v-for="item in list" :key="item.id" class="fav-card">
        <div class="card-img" @click="$router.push('/product/' + item.productId)">
          <el-image v-if="item.productImage" :src="item.productImage" fit="cover" class="img-el" />
          <div v-else class="img-place"><el-icon :size="36"><PictureFilled /></el-icon></div>
        </div>
        <div class="card-body">
          <div class="card-name" @click="$router.push('/product/' + item.productId)">{{ item.productName }}</div>
          <div class="card-foot">
            <span class="card-price">¥{{ item.productPrice?.toFixed(2) }}</span>
            <el-button text type="danger" size="small" @click="handleRemove(item.productId)">取消收藏</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, PictureFilled } from '@element-plus/icons-vue'
import { getFavoriteList, removeFavorite } from '@/api/favorite'

const list = ref([])
const loading = ref(false)

async function fetchList() {
  loading.value = true
  try {
    const res = await getFavoriteList()
    list.value = res.data ?? []
  } catch { /* ignore */ } finally { loading.value = false }
}

async function handleRemove(productId) {
  try {
    await removeFavorite(productId)
    ElMessage.success('已取消收藏')
    list.value = list.value.filter(item => item.productId !== productId)
  } catch { /* ignore */ }
}

onMounted(() => fetchList())
</script>

<style scoped lang="scss">
.page-title { font-size: 24px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
.back-icon { cursor: pointer; color: $text-secondary; transition: color 0.2s; &:hover { color: $--el-color-primary; } }
.empty { padding-top: 60px; }

.fav-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: $bp-tablet) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: $bp-small) { grid-template-columns: repeat(2, 1fr); }
}

.fav-card {
  background: $bg-card;
  border-radius: $radius;
  overflow: hidden;
  transition: box-shadow 0.2s;

  &:hover { box-shadow: $shadow-hover; }

  .card-img {
    aspect-ratio: 1;
    background: $--el-color-primary-light-9;
    cursor: pointer;

    .img-el { width: 100%; height: 100%; }
    .img-place {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      color: $--el-color-primary-light-5;
    }
  }

  .card-body {
    padding: 12px 14px 14px;

    .card-name {
      font-size: 14px; font-weight: 500; color: $text-primary;
      line-height: 1.4; height: 40px; overflow: hidden;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      margin-bottom: 8px; cursor: pointer;
    }

    .card-foot {
      display: flex; justify-content: space-between; align-items: center;

      .card-price {
        font-family: 'DM Serif Display', serif;
        font-size: 18px; font-weight: 600; color: $accent;
      }
    }
  }
}
</style>
