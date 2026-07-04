<template>
  <div class="detail-page" v-loading="loading">
    <div class="detail-layout" v-if="product">
      <!-- 左：大图 -->
      <div class="img-section">
        <el-image v-if="product.image" :src="product.image" fit="cover" class="detail-img" />
        <div v-else class="img-empty"><el-icon :size="64"><PictureFilled /></el-icon></div>
      </div>

      <!-- 右：信息 -->
      <div class="info-section">
        <h1 class="name">{{ product.name }}</h1>
        <div class="meta-row">
          <el-tag size="small">{{ product.categoryName }}</el-tag>
          <span class="sales">已售 {{ product.sales || 0 }} | 库存 {{ product.stock || 0 }}</span>
        </div>
        <div class="price-box">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ product.price?.toFixed(2) }}</span>
        </div>
        <p class="desc" v-if="product.description">{{ product.description }}</p>

        <div class="action-bar">
          <el-input-number v-model="quantity" :min="1" :max="product.stock || 999" size="large" />
          <el-button type="primary" size="large" class="add-cart-btn" :disabled="product.status !== 1" @click="handleAddCart">
            <el-icon><ShoppingCart /></el-icon> 加入购物车
          </el-button>
          <el-button :type="faved ? 'warning' : 'default'" size="large" @click="toggleFav">
            <el-icon :size="16"><StarFilled v-if="faved" /><Star v-else /></el-icon>
            {{ faved ? '已收藏' : '收藏' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { PictureFilled, Star, StarFilled, ShoppingCart } from '@element-plus/icons-vue'
import { getProductDetail } from '@/api/product'
import { addToCart } from '@/api/cart'
import { addFavorite, removeFavorite, getFavoriteList } from '@/api/favorite'

const route = useRoute()
const product = ref(null)
const loading = ref(false)
const faved = ref(false)
const quantity = ref(1)

async function fetchDetail() {
  loading.value = true
  try {
    const res = await getProductDetail(route.params.id)
    product.value = res.data
    if (product.value) checkFav()
  } catch { /* ignore */ } finally { loading.value = false }
}

async function checkFav() {
  try {
    const res = await getFavoriteList()
    faved.value = (res.data || []).some(f => f.productId === product.value?.id)
  } catch { /* ignore */ }
}

async function toggleFav() {
  try {
    if (faved.value) {
      await removeFavorite(product.value.id)
      ElMessage.success('已取消收藏')
    } else {
      await addFavorite(product.value.id)
      ElMessage.success('已收藏')
    }
    faved.value = !faved.value
  } catch { /* ignore */ }
}

async function handleAddCart() {
  try {
    await addToCart({ productId: product.value.id, amount: product.value.price })
    ElMessage.success(`已添加 ${quantity.value} 件到购物车`)
  } catch { /* ignore */ }
}

onMounted(() => fetchDetail())
</script>

<style scoped lang="scss">
.detail-page {
  background: $bg-card;
  border-radius: $radius;
  padding: 24px;
}

.detail-layout {
  display: flex;
  gap: 32px;
}

.img-section {
  width: 440px;
  height: 440px;
  flex-shrink: 0;
  background: $--el-color-primary-light-9;
  border-radius: $radius;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  .detail-img { width: 100%; height: 100%; }
  .img-empty { color: $--el-color-primary-light-5; }
}

.info-section {
  flex: 1;

  .name { font-size: 22px; color: $text-primary; margin-bottom: 12px; line-height: 1.4; }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;

    .sales { font-size: 13px; color: $text-secondary; }
  }

  .price-box {
    background: $bg-page;
    padding: 16px 20px;
    border-radius: $radius;
    margin-bottom: 20px;

    .price-symbol { font-size: 18px; color: #F56C6C; font-weight: 600; }
    .price-value { font-size: 32px; color: #F56C6C; font-weight: 700; margin-left: 4px; }
  }

  .desc {
    font-size: 14px;
    color: $text-secondary;
    line-height: 1.8;
    margin-bottom: 28px;
  }

  .action-bar {
    display: flex;
    align-items: center;
    gap: 12px;

    .add-cart-btn { flex: 1; max-width: 240px; }
  }
}
</style>
