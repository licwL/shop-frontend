<template>
  <div class="page-container">
    <div class="back-bar" @click="$router.back()">
      <el-icon><ArrowLeft /></el-icon>
      <span>返回</span>
    </div>
    <div class="detail-layout" v-loading="loading">
      <template v-if="product">
        <!-- 左图 -->
        <div class="img-section">
          <el-image v-if="product.image" :src="product.image" fit="cover" class="main-img" />
          <div v-else class="img-empty"><el-icon :size="56"><PictureFilled /></el-icon></div>
        </div>

        <!-- 右信息 -->
        <div class="info-section">
          <div class="bread"><span>{{ product.categoryName }}</span></div>
          <h1 class="name display-font">{{ product.name }}</h1>
          <div class="meta">
            <span class="meta-item">已售 {{ product.sales || 0 }}</span>
            <span class="meta-item">库存 {{ product.stock || 0 }}</span>
          </div>
          <div class="price-box">
            <span class="price-sym">¥</span>
            <span class="price-val display-font">{{ product.price?.toFixed(2) }}</span>
          </div>
          <p class="desc" v-if="product.description">{{ product.description }}</p>

          <div class="action-bar">
            <el-input-number v-model="quantity" :min="1" :max="product.stock || 999" size="large" />
            <el-button type="primary" size="large" class="cart-btn" :disabled="product.status !== 1" @click="add">
              <el-icon><ShoppingCart /></el-icon> 加入购物车
            </el-button>
            <el-button :type="faved ? 'warning' : 'default'" size="large" @click="toggleFav">
              <el-icon :size="16"><StarFilled v-if="faved" /><Star v-else /></el-icon>
            </el-button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, PictureFilled, Star, StarFilled, ShoppingCart } from '@element-plus/icons-vue'
import { getToken } from '@shared/request'
import { getProductDetail } from '@/api/product'
import { addToCart } from '@/api/cart'
import { addFavorite, removeFavorite, getFavoriteList } from '@/api/favorite'

const route = useRoute()
const router = useRouter()
const product = ref(null)
const loading = ref(false)
const faved = ref(false)
const quantity = ref(1)

async function load() {
  loading.value = true
  try { product.value = (await getProductDetail(route.params.id)).data; await checkFav() } catch { /* ignore */ } finally { loading.value = false }
}

async function checkFav() {
  try { faved.value = ((await getFavoriteList()).data || []).some(f => f.productId === product.value?.id) } catch { /* ignore */ }
}

function requireLogin() {
  if (!getToken()) {
    router.push(`/login?redirect=/product/${product.value.id}`)
    return false
  }
  return true
}

async function toggleFav() {
  if (!requireLogin()) return
  try {
    faved.value ? (await removeFavorite(product.value.id), ElMessage.success('已取消收藏')) : (await addFavorite(product.value.id), ElMessage.success('已收藏'))
    faved.value = !faved.value
  } catch { /* ignore */ }
}

async function add() {
  if (!requireLogin()) return
  try {
    const qty = quantity.value
    await Promise.all(Array.from({ length: qty }, () =>
      addToCart({ productId: product.value.id, amount: product.value.price })))
    ElMessage.success(`已添加 ${qty} 件`)
    router.back()
  } catch { /* ignore */ }
}

onMounted(() => load())
</script>

<style scoped lang="scss">
.back-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  color: $text-secondary;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 12px;
  padding: 4px 0;
  width: fit-content;
  transition: color 0.2s;

  &:hover { color: $--el-color-primary; }
}

.detail-layout {
  display: flex;
  gap: 36px;
  background: $bg-card;
  border-radius: $radius;
  padding: 28px;

  @media (max-width: $bp-mobile) { flex-direction: column; gap: 20px; padding: 16px; }
}

.img-section {
  width: 460px;
  height: 460px;
  flex-shrink: 0;
  background: $bg-page;
  border-radius: $radius;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: $bp-mobile) { width: 100%; aspect-ratio: 1; height: auto; }

  .main-img { width: 100%; height: 100%; }
  .img-empty { color: $--el-color-primary-light-5; }
}

.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;

  .bread { font-size: 13px; color: $text-secondary; margin-bottom: 8px; }

  .name {
    font-size: 24px;
    color: $text-primary;
    line-height: 1.35;
    margin-bottom: 12px;

    @media (max-width: $bp-mobile) { font-size: 20px; }
  }

  .meta {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;

    .meta-item { font-size: 13px; color: $text-secondary; }
  }

  .price-box {
    background: $bg-page;
    padding: 18px 22px;
    border-radius: $radius;
    margin-bottom: 20px;

    .price-sym { font-size: 18px; color: $accent; font-weight: 500; }
    .price-val { font-size: 34px; color: $accent; font-weight: 600; margin-left: 4px; }
  }

  .desc { font-size: 14px; color: $text-secondary; line-height: 1.8; margin-bottom: auto; }

  .action-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 24px;

    @media (max-width: 480px) { flex-wrap: wrap; }

    .cart-btn { flex: 1; max-width: 240px; font-weight: 600; }
  }
}
</style>
