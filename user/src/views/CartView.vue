<template>
  <div class="page-container">
    <h2 class="page-title display-font">购物车</h2>

    <div v-if="!list.length && !loading" class="empty">
      <el-empty description="购物车是空的">
        <el-button type="primary" @click="$router.push('/home')">去逛逛</el-button>
      </el-empty>
    </div>

    <template v-else>
      <div class="cart-table-wrap" v-loading="loading">
        <div class="cart-table">
          <div class="ct-head">
            <span class="cth-name">商品</span>
            <span class="cth-cell">单价</span>
            <span class="cth-cell">数量</span>
            <span class="cth-cell">小计</span>
            <span class="cth-cell">操作</span>
          </div>
          <div v-for="item in list" :key="item.id" class="ct-row">
            <div class="ctr-prod">
              <el-image v-if="item.image" :src="item.image" fit="cover" class="ctr-img" />
              <div v-else class="ctr-img-empty"><el-icon :size="24"><PictureFilled /></el-icon></div>
              <span class="ctr-name">{{ item.name }}</span>
            </div>
            <span class="ctr-cell">¥{{ item.amount?.toFixed(2) }}</span>
            <span class="ctr-cell">
              <span class="qty-ctrl">
                <el-button circle size="small" @click="sub(item)"><el-icon><Minus /></el-icon></el-button>
                <span class="qty">{{ item.number }}</span>
                <el-button circle size="small" type="primary" @click="inc(item)"><el-icon><Plus /></el-icon></el-button>
              </span>
            </span>
            <span class="ctr-cell ctr-sub">¥{{ (item.amount * item.number).toFixed(2) }}</span>
            <span class="ctr-cell"><el-button text type="danger" size="small" @click="remove(item)">删除</el-button></span>
          </div>
        </div>
      </div>

      <div class="cart-foot">
        <span class="cf-total">合计 <strong class="display-font">¥{{ total }}</strong></span>
        <el-button type="primary" size="large" @click="$router.push('/orders?from=cart')">去结算</el-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { PictureFilled, Minus, Plus } from '@element-plus/icons-vue'
import { getCartList, addToCart, subCart } from '@/api/cart'

const list = ref([])
const loading = ref(false)
const total = computed(() => list.value.reduce((s, i) => s + (i.amount || 0) * (i.number || 0), 0).toFixed(2))

async function fetch() { loading.value = true; try { list.value = (await getCartList()).data ?? [] } catch { /* ignore */ } finally { loading.value = false } }
async function inc(item) { try { await addToCart({ productId: item.productId, amount: item.amount }); fetch() } catch { /* ignore */ } }
async function sub(item) { try { await subCart({ productId: item.productId, amount: item.amount }); fetch() } catch { /* ignore */ } }
async function remove(item) { try { for (let i = 0; i < item.number; i++) await subCart({ productId: item.productId, amount: item.amount }); ElMessage.success('已移除'); fetch() } catch { /* ignore */ } }

onMounted(() => fetch())
</script>

<style scoped lang="scss">
.page-title { font-size: 24px; margin-bottom: 20px; color: $text-primary; }

.cart-table-wrap { background: $bg-card; border-radius: $radius; overflow: hidden; }

.cart-table {
  @media (max-width: $bp-small) { font-size: 13px; }

  .ct-head {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 0.6fr;
    padding: 14px 16px;
    background: $bg-page;
    font-size: 13px;
    font-weight: 600;
    color: $text-secondary;
    border-bottom: 1px solid $border-color;

    @media (max-width: $bp-small) { display: none; }
  }

  .ct-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 0.6fr;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid $border-color;

    @media (max-width: $bp-small) { grid-template-columns: 1fr; gap: 8px; }

    &:last-child { border-bottom: none; }
  }
}

.ctr-prod { display: flex; align-items: center; gap: 12px; }

.ctr-img, .ctr-img-empty {
  width: 64px; height: 64px;
  border-radius: 6px;
  overflow: hidden;
  background: $bg-page;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ctr-img-empty { color: $--el-color-primary-light-5; }
.ctr-name { font-size: 14px; color: $text-primary; font-weight: 500; }

.ctr-cell {
  text-align: center;
  font-size: 14px;
  color: $text-secondary;
  font-weight: 500;
}
.ctr-sub { color: $accent; font-weight: 600; }

.qty-ctrl { display: inline-flex; align-items: center; gap: 8px; }
.qty { font-size: 14px; font-weight: 600; min-width: 20px; text-align: center; color: $text-primary; }

.cart-foot {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 24px;
  margin-top: 20px;
  padding: 18px 24px;
  background: $bg-card;
  border-radius: $radius;

  .cf-total { font-size: 15px; color: $text-secondary;
    strong { font-size: 26px; color: $accent; margin-left: 8px; }
  }
}

.empty { padding: 80px 0; }
</style>
