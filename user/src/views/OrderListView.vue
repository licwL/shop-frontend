<template>
  <div class="page-container">
    <h2 class="page-title display-font">{{ isCart ? '确认订单' : '我的订单' }}</h2>

    <!-- 下单 -->
    <template v-if="isCart">
      <div class="submit-layout">
        <div class="submit-main">
          <el-card><template #header><strong>收货地址</strong></template>
            <div v-if="!addrs.length" class="no-addr">暂无地址，<el-button type="primary" text size="small" @click="$router.push('/address')">去添加</el-button></div>
            <div v-else class="addr-grid">
              <div v-for="a in addrs" :key="a.id" class="addr-card" :class="{ sel: selA === a.id }" @click="selA = a.id">
                <div class="ac-r"><strong>{{ a.consignee }}</strong> {{ a.phone }}</div>
                <div class="ac-t">{{ a.provinceName }}{{ a.cityName }}{{ a.districtName }} {{ a.detail }}</div>
                <el-tag v-if="a.isDefault" size="small" type="warning">默认</el-tag>
              </div>
            </div>
          </el-card>
          <el-card><template #header><strong>商品明细</strong></template>
            <table class="items-tbl"><thead><tr><th>商品</th><th>单价</th><th>数量</th><th>小计</th></tr></thead><tbody>
              <tr v-for="it in cartItems" :key="it.id"><td>{{ it.name }}</td><td>¥{{ it.amount?.toFixed(2) }}</td><td>x{{ it.number }}</td><td class="sp">¥{{ (it.amount * it.number).toFixed(2) }}</td></tr>
            </tbody></table>
          </el-card>
          <el-card><template #header><strong>备注</strong></template><el-input v-model="remark" placeholder="选填" maxlength="50" /></el-card>
        </div>
        <div class="submit-side"><el-card>
          <div class="total-big">¥{{ cartTotal }}</div>
          <div class="total-lab">应付金额</div>
          <el-button type="primary" size="large" class="sbtn" :loading="submitting" :disabled="!selA" @click="doSubmit">提交订单</el-button>
        </el-card></div>
      </div>
    </template>

    <!-- 列表 -->
    <template v-else>
      <div class="stab-row">
        <span v-for="s in tabs" :key="s.v" class="stab" :class="{ on: st === s.v }" @click="st = s.v; search()">{{ s.l }}</span>
      </div>
      <div v-loading="loading">
        <div v-if="!orders.length && !loading" class="empty"><el-empty description="暂无订单" :image-size="80" /></div>
        <table v-else class="order-tbl"><thead><tr><th>订单号</th><th>金额</th><th>状态</th><th>时间</th><th>操作</th></tr></thead><tbody>
          <tr v-for="o in orders" :key="o.id">
            <td class="mono">{{ o.number }}</td>
            <td class="op">¥{{ o.amount?.toFixed(2) }}</td>
            <td><el-tag :type="orderStatusType(o.status)" size="small">{{ orderStatusText(o.status) }}</el-tag></td>
            <td class="ot">{{ formatTime(o.orderTime) }}</td>
            <td>
              <el-button size="small" @click="handleDetail(o.id)">详情</el-button>
              <el-button size="small" v-if="o.status === 1" type="primary" @click="pay(o.id)">支付</el-button>
              <el-button size="small" v-if="o.status === 1 || o.status === 2" @click="cancel(o.id)">取消</el-button>
            </td>
          </tr>
        </tbody></table>
      </div>
      <div class="pager" v-if="ototal > psize">
        <Pagination v-model:page="pg" v-model:page-size="psize" :total="ototal" @change="loadOrders" />
      </div>

      <!-- 订单详情抽屉 -->
      <el-drawer v-model="drawerVisible" title="订单详情" size="420px">
        <template v-if="detail">
          <div class="detail-num">订单号: {{ detail.number }}</div>
          <div class="detail-items">
            <div v-for="item in detail.orderDetailList" :key="item.id" class="di-row">
              <el-image v-if="item.image" :src="item.image" fit="cover" class="di-img" />
              <div v-else class="di-img-empty"><el-icon :size="20"><PictureFilled /></el-icon></div>
              <div class="di-info">
                <div class="di-name">{{ item.name }}</div>
                <div class="di-meta">x{{ item.number }} <span class="di-price">¥{{ item.amount?.toFixed(2) }}</span></div>
              </div>
            </div>
          </div>
        </template>
      </el-drawer>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { PictureFilled } from '@element-plus/icons-vue'
import { ORDER_STATUS, orderStatusText, orderStatusType, formatTime } from '@shared/utils'
import Pagination from '@shared/components/Pagination.vue'
import { getCartList } from '@/api/cart'
import { submitOrder, getOrderPage, getOrderDetail, cancelOrder, payOrder } from '@/api/order'
import { getAddressList } from '@/api/address'

const route = useRoute()
const router = useRouter()
const isCart = computed(() => route.query.from === 'cart')

// 下单
const addrs = ref([]); const selA = ref(null); const cartItems = ref([]); const remark = ref(''); const submitting = ref(false)
const cartTotal = computed(() => cartItems.value.reduce((s, i) => s + i.amount * i.number, 0).toFixed(2))

async function initCart() {
  const [a, c] = await Promise.allSettled([getAddressList(), getCartList()])
  if (a.status === 'fulfilled') { addrs.value = a.value.data ?? []; const d = addrs.value.find(x => x.isDefault === 1); selA.value = d?.id ?? addrs.value[0]?.id ?? null }
  if (c.status === 'fulfilled') cartItems.value = c.value.data ?? []
}

async function doSubmit() {
  const a = addrs.value.find(x => x.id === selA.value); if (!a) return
  submitting.value = true
  try {
    await submitOrder({ addressBookId: a.id, payMethod: 1, remark: remark.value, userName: a.consignee, phone: a.phone, address: `${a.provinceName}${a.cityName}${a.districtName} ${a.detail}`, consignee: a.consignee })
    ElMessage.success('下单成功'); router.push('/orders')
  } catch { /* ignore */ } finally { submitting.value = false }
}

// 列表
const orders = ref([]); const ototal = ref(0); const loading = ref(false)
const st = ref(null); const pg = ref(1); const psize = ref(10)
const drawerVisible = ref(false); const detail = ref(null)
const tabs = [{ l: '全部', v: null }, { l: '待付款', v: 1 }, { l: '已付款', v: 2 }, { l: '已发货', v: 3 }, { l: '已完成', v: 4 }]

async function loadOrders() {
  loading.value = true
  try { const r = await getOrderPage({ page: pg.value, pageSize: psize.value, status: st.value ?? undefined }); orders.value = r.data.records ?? []; ototal.value = r.data.total ?? 0 } catch { /* ignore */ } finally { loading.value = false }
}
function search() { pg.value = 1; loadOrders() }
async function pay(id) { try { await payOrder(id); ElMessage.success('支付成功'); loadOrders() } catch { /* ignore */ } }
async function cancel(id) {
  try {
    const { value } = await ElMessageBox.prompt('取消原因', '取消订单')
    await cancelOrder(id, value || '')
    ElMessage.success('已取消'); loadOrders()
  } catch { /* ignore */ }
}

async function handleDetail(id) {
  try { detail.value = (await getOrderDetail(id)).data; drawerVisible.value = true } catch { /* ignore */ }
}

onMounted(() => isCart.value ? initCart() : loadOrders())
</script>

<style scoped lang="scss">
.page-title { font-size: 24px; margin-bottom: 20px; color: $text-primary; }

// 下单
.submit-layout { display: flex; gap: 20px; @media (max-width: $bp-mobile) { flex-direction: column; } }
.submit-main { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.submit-side { width: 260px; flex-shrink: 0;
  @media (max-width: $bp-mobile) { width: 100%; }
  .total-big { text-align: center; font-family: 'DM Serif Display', serif; font-size: 28px; font-weight: 600; color: $accent; margin-bottom: 4px; }
  .total-lab { text-align: center; font-size: 13px; color: $text-secondary; margin-bottom: 16px; }
  .sbtn { width: 100%; font-weight: 600; }
}
.no-addr { color: $text-secondary; font-size: 13px; padding: 8px 0; }
.addr-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.addr-card { padding: 10px 12px; border: 1px solid $border-color; border-radius: 6px; cursor: pointer; font-size: 13px; transition: 0.2s;
  &.sel { border-color: $--el-color-primary; background: $--el-color-primary-light-9; }
  .ac-r { margin-bottom: 4px; }
  .ac-t { color: $text-secondary; font-size: 12px; margin-bottom: 4px; }
}
.items-tbl { width: 100%; border-collapse: collapse; font-size: 13px;
  th { padding: 8px; border-bottom: 1px solid $border-color; color: $text-secondary; font-weight: 500; }
  td { padding: 10px 8px; border-bottom: 1px solid $border-color; }
  .sp { font-weight: 600; color: $accent; }
}

// 列表
.stab-row { display: flex; gap: 0; background: $bg-card; border-radius: $radius; margin-bottom: 16px; padding: 0 8px; }
.stab { padding: 10px 18px; font-size: 13px; color: $text-secondary; cursor: pointer; border-bottom: 2px solid transparent; font-weight: 500;
  &.on { color: $--el-color-primary; border-bottom-color: $--el-color-primary; }
}
.order-tbl { width: 100%; border-collapse: collapse; background: $bg-card; border-radius: $radius; overflow: hidden; font-size: 14px;
  th { padding: 12px 14px; background: $bg-page; color: $text-secondary; font-weight: 500; text-align: left; border-bottom: 1px solid $border-color; }
  td { padding: 14px; border-bottom: 1px solid $border-color; }
  .mono { font-family: 'DM Sans', monospace; font-size: 13px; color: $text-secondary; }
  .op { font-weight: 600; color: $accent; }
  .ot { font-size: 13px; color: $text-secondary; }
}
.empty { padding-top: 60px; }
.pager { margin-top: 20px; display: flex; justify-content: center; }

.detail-num { font-size: 13px; color: $text-secondary; margin-bottom: 16px; font-family: monospace; }

.detail-items {
  display: flex; flex-direction: column; gap: 12px;
}

.di-row {
  display: flex; align-items: center; gap: 12px;
  padding-bottom: 12px; border-bottom: 1px solid $border-color;

  &:last-child { border-bottom: none; }
}

.di-img, .di-img-empty {
  width: 56px; height: 56px;
  border-radius: 6px; overflow: hidden;
  background: $bg-page; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.di-img-empty { color: $--el-color-primary-light-5; }

.di-info { flex: 1; }
.di-name { font-size: 14px; color: $text-primary; margin-bottom: 4px; font-weight: 500; }
.di-meta { font-size: 13px; color: $text-secondary; }
.di-price { font-weight: 600; color: $accent; margin-left: 8px; }
</style>
