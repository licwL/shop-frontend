<template>
  <div class="cart-page">
    <h2 class="page-title">购物车</h2>

    <div v-if="list.length === 0 && !loading" class="empty">
      <el-empty description="购物车是空的，去逛逛吧" :image-size="120">
        <el-button type="primary" @click="router.push('/home')">去购物</el-button>
      </el-empty>
    </div>

    <template v-else>
      <div class="cart-table-wrap" v-loading="loading">
        <table class="cart-table">
          <thead>
            <tr>
              <th style="width:100px">图片</th>
              <th>商品名称</th>
              <th style="width:140px">单价</th>
              <th style="width:180px">数量</th>
              <th style="width:140px">小计</th>
              <th style="width:100px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in list" :key="item.id">
              <td>
                <el-image v-if="item.image" :src="item.image" fit="cover" style="width:72px;height:72px;border-radius:4px" />
                <div v-else class="img-empty"><el-icon :size="28"><PictureFilled /></el-icon></div>
              </td>
              <td class="td-name">{{ item.name }}</td>
              <td class="td-price">¥{{ item.amount?.toFixed(2) }}</td>
              <td>
                <div class="qty-ctrl">
                  <el-button circle size="small" @click="handleSub(item)"><el-icon><Minus /></el-icon></el-button>
                  <span class="qty">{{ item.number }}</span>
                  <el-button circle size="small" type="primary" @click="handleAdd(item)"><el-icon><Plus /></el-icon></el-button>
                </div>
              </td>
              <td class="td-sub">¥{{ (item.amount * item.number).toFixed(2) }}</td>
              <td><el-button text type="danger" @click="handleRemove(item)">删除</el-button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="cart-footer">
        <div class="total-row">
          共 <strong>{{ list.length }}</strong> 件商品，合计：<span class="total-price">¥{{ totalAmount }}</span>
        </div>
        <el-button type="primary" size="large" @click="handleSubmit">去结算</el-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { PictureFilled, Minus, Plus } from '@element-plus/icons-vue'
import { getCartList, addToCart, subCart, cleanCart } from '@/api/cart'

const router = useRouter()
const list = ref([])
const loading = ref(false)

const totalAmount = computed(() => {
  return list.value.reduce((sum, i) => sum + (i.amount || 0) * (i.number || 0), 0).toFixed(2)
})

async function fetchList() {
  loading.value = true
  try {
    const res = await getCartList()
    list.value = res.data ?? []
  } catch { /* ignore */ } finally { loading.value = false }
}

async function handleAdd(item) {
  try { await addToCart({ productId: item.productId, amount: item.amount }); fetchList() } catch { /* ignore */ }
}
async function handleSub(item) {
  try { await subCart({ productId: item.productId, amount: item.amount }); fetchList() } catch { /* ignore */ }
}
async function handleRemove(item) {
  // sub until removed
  try {
    for (let i = 0; i < item.number; i++) {
      await subCart({ productId: item.productId, amount: item.amount })
    }
    ElMessage.success('已移除')
    fetchList()
  } catch { /* ignore */ }
}

function handleSubmit() {
  router.push('/orders?from=cart')
}

onMounted(() => fetchList())
</script>

<style scoped lang="scss">
.page-title { font-size: 20px; margin-bottom: 20px; color: $text-primary; }

.cart-table-wrap {
  background: $bg-card;
  border-radius: $radius;
  overflow: hidden;
}

.cart-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    padding: 14px 12px;
    background: $bg-page;
    color: $text-secondary;
    font-weight: 500;
    text-align: center;
    border-bottom: 1px solid $border-color;
  }

  td {
    padding: 16px 12px;
    text-align: center;
    border-bottom: 1px solid $border-color;
    vertical-align: middle;
  }

  .td-name { text-align: left; color: $text-primary; }
  .td-price, .td-sub { font-weight: 600; color: #F56C6C; }

  .qty-ctrl {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    .qty { font-size: 15px; font-weight: 600; min-width: 20px; }
  }

  .img-empty {
    width: 72px; height: 72px;
    background: $--el-color-primary-light-9;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    color: $--el-color-primary-light-5;
  }
}

.cart-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding: 16px 20px;
  background: $bg-card;
  border-radius: $radius;

  .total-row { font-size: 14px; color: $text-secondary; }
  .total-price { font-size: 24px; font-weight: 700; color: #F56C6C; margin-left: 8px; }
}

.empty { padding: 80px 0; }
</style>
