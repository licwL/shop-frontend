<template>
  <div class="order-page">
    <h2 class="page-title">{{ isFromCart ? '确认订单' : '我的订单' }}</h2>

    <!-- 下单模式 -->
    <template v-if="isFromCart">
      <div class="submit-layout">
        <div class="submit-main">
          <el-card class="section-card">
            <template #header><strong>收货地址</strong></template>
            <div v-if="addresses.length === 0" class="empty-addr">
              暂无地址，<el-button type="primary" text size="small" @click="router.push('/address')">去添加</el-button>
            </div>
            <div v-else class="addr-grid">
              <div
                v-for="a in addresses" :key="a.id"
                class="addr-card" :class="{ selected: selectedAddr === a.id }"
                @click="selectedAddr = a.id"
              >
                <div class="ac-row"><strong>{{ a.consignee }}</strong> {{ a.phone }}</div>
                <div class="ac-text">{{ a.provinceName }}{{ a.cityName }}{{ a.districtName }} {{ a.detail }}</div>
                <el-tag v-if="a.isDefault" size="small" type="warning">默认</el-tag>
              </div>
            </div>
          </el-card>

          <el-card class="section-card">
            <template #header><strong>商品明细</strong></template>
            <table class="order-items-table">
              <thead><tr><th>商品</th><th style="width:80px">单价</th><th style="width:80px">数量</th><th style="width:100px">小计</th></tr></thead>
              <tbody>
                <tr v-for="item in cartList" :key="item.id">
                  <td>{{ item.name }}</td>
                  <td>¥{{ item.amount?.toFixed(2) }}</td>
                  <td>x{{ item.number }}</td>
                  <td class="sub-price">¥{{ (item.amount * item.number).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </el-card>

          <el-card class="section-card">
            <template #header><strong>备注</strong></template>
            <el-input v-model="remark" placeholder="选填" maxlength="50" />
          </el-card>
        </div>

        <div class="submit-side">
          <el-card>
            <div class="total-big">¥{{ totalAmount }}</div>
            <div class="total-label">应付金额</div>
            <el-button type="primary" size="large" class="submit-btn" :loading="submitting" :disabled="!selectedAddr" @click="handleSubmit">
              提交订单
            </el-button>
          </el-card>
        </div>
      </div>
    </template>

    <!-- 订单列表模式 -->
    <template v-else>
      <div class="status-tabs">
        <span v-for="s in statusTabs" :key="s.value"
          class="stab" :class="{ active: activeStatus === s.value }"
          @click="activeStatus = s.value; handleSearch()">{{ s.label }}</span>
      </div>

      <div v-loading="loading">
        <div v-if="orderList.length === 0 && !loading" class="empty"><el-empty description="暂无订单" :image-size="80" /></div>
        <table v-else class="order-table">
          <thead>
            <tr><th>订单号</th><th>金额</th><th>状态</th><th>时间</th><th style="width:160px">操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="o in orderList" :key="o.id">
              <td class="mono">{{ o.number }}</td>
              <td class="oprice">¥{{ o.amount?.toFixed(2) }}</td>
              <td><el-tag :type="statusTagType(o.status)" size="small">{{ statusText(o.status) }}</el-tag></td>
              <td class="otime">{{ formatTime(o.orderTime) }}</td>
              <td>
                <el-button size="small" v-if="o.status === 1" type="primary" @click="handlePay(o.id)">支付</el-button>
                <el-button size="small" v-if="o.status === 1 || o.status === 2" @click="handleCancel(o.id)">取消</el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pager" v-if="orderTotal > pagination.pageSize">
        <Pagination v-model:page="pagination.page" v-model:page-size="pagination.pageSize" :total="orderTotal" @change="fetchOrders" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ORDER_STATUS } from '@shared/utils'
import Pagination from '@shared/components/Pagination.vue'
import { getCartList } from '@/api/cart'
import { submitOrder, getOrderPage, cancelOrder, payOrder } from '@/api/order'
import { getAddressList } from '@/api/address'

const route = useRoute()
const router = useRouter()
const isFromCart = computed(() => route.query.from === 'cart')

// 下单模式
const cartList = ref([])
const addresses = ref([])
const selectedAddr = ref(null)
const remark = ref('')
const submitting = ref(false)
const totalAmount = computed(() => cartList.value.reduce((s, i) => s + i.amount * i.number, 0).toFixed(2))

async function initSubmit() {
  const [a, c] = await Promise.allSettled([getAddressList(), getCartList()])
  if (a.status === 'fulfilled') {
    addresses.value = a.value.data ?? []
    const def = addresses.value.find(x => x.isDefault === 1)
    selectedAddr.value = def ? def.id : (addresses.value[0]?.id ?? null)
  }
  if (c.status === 'fulfilled') cartList.value = c.value.data ?? []
}

async function handleSubmit() {
  if (!selectedAddr.value) { ElMessage.warning('请选择地址'); return }
  const addr = addresses.value.find(a => a.id === selectedAddr.value)
  if (!addr) return
  submitting.value = true
  try {
    await submitOrder({
      addressBookId: addr.id, payMethod: 1, remark: remark.value,
      userName: addr.consignee, phone: addr.phone,
      address: `${addr.provinceName}${addr.cityName}${addr.districtName} ${addr.detail}`,
      consignee: addr.consignee,
    })
    ElMessage.success('下单成功')
    router.push('/orders')
  } catch { /* ignore */ } finally { submitting.value = false }
}

// 列表模式
const orderList = ref([])
const orderTotal = ref(0)
const loading = ref(false)
const activeStatus = ref(null)
const pagination = reactive({ page: 1, pageSize: 10 })

const statusTabs = [
  { label: '全部', value: null }, { label: '待付款', value: 1 },
  { label: '已付款', value: 2 }, { label: '已发货', value: 3 }, { label: '已完成', value: 4 },
]

async function fetchOrders() {
  loading.value = true
  try {
    const res = await getOrderPage({ page: pagination.page, pageSize: pagination.pageSize, status: activeStatus.value ?? undefined })
    orderList.value = res.data.records ?? []
    orderTotal.value = res.data.total ?? 0
  } catch { /* ignore */ } finally { loading.value = false }
}
function handleSearch() { pagination.page = 1; fetchOrders() }
async function handlePay(id) { try { await payOrder(id); ElMessage.success('支付成功'); fetchOrders() } catch { /* ignore */ } }
async function handleCancel(id) {
  try { await ElMessageBox.prompt('取消原因', '取消订单'); await cancelOrder(id, ''); ElMessage.success('已取消'); fetchOrders() } catch { /* ignore */ }
}

// 工具
const statusText = s => ORDER_STATUS[s] || '未知'
const statusTagType = s => s === 1 ? 'warning' : s === 2 ? 'primary' : s === 3 ? 'success' : 'info'
const formatTime = v => v ? new Date(v).toLocaleString('zh-CN') : '-'

onMounted(() => isFromCart.value ? initSubmit() : fetchOrders())
</script>

<style scoped lang="scss">
.page-title { font-size: 20px; margin-bottom: 20px; color: $text-primary; }

// 下单布局
.submit-layout { display: flex; gap: 20px; }
.submit-main { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.submit-side { width: 260px; flex-shrink: 0;
  .total-big { font-size: 28px; font-weight: 700; color: #F56C6C; text-align: center; margin-bottom: 4px; }
  .total-label { font-size: 13px; color: $text-secondary; text-align: center; margin-bottom: 16px; }
  .submit-btn { width: 100%; }
}

.section-card { :deep(.el-card__header) { padding: 12px 16px; } }

.empty-addr { color: $text-secondary; font-size: 13px; padding: 8px 0; }

.addr-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }

.addr-card {
  padding: 10px 12px;
  border: 1px solid $border-color;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;

  &.selected { border-color: $--el-color-primary; background: $--el-color-primary-light-9; }
  .ac-row { margin-bottom: 4px; }
  .ac-text { color: $text-secondary; font-size: 12px; margin-bottom: 4px; }
}

.order-items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  th { padding: 8px; border-bottom: 1px solid $border-color; color: $text-secondary; font-weight: 500; }
  td { padding: 10px 8px; border-bottom: 1px solid $border-color; }
  .sub-price { font-weight: 600; color: #F56C6C; }
}

// 列表模式
.status-tabs {
  display: flex;
  gap: 0;
  background: $bg-card;
  border-radius: $radius;
  margin-bottom: 16px;
  padding: 0 8px;
  .stab { padding: 10px 18px; font-size: 13px; color: $text-secondary; cursor: pointer; border-bottom: 2px solid transparent;
    &.active { color: $--el-color-primary; border-bottom-color: $--el-color-primary; }
  }
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  background: $bg-card;
  border-radius: $radius;
  overflow: hidden;
  font-size: 14px;
  th { padding: 12px 14px; background: $bg-page; color: $text-secondary; font-weight: 500; text-align: left; border-bottom: 1px solid $border-color; }
  td { padding: 14px; border-bottom: 1px solid $border-color; }
  .mono { font-family: monospace; color: $text-secondary; }
  .oprice { font-weight: 600; color: #F56C6C; }
  .otime { font-size: 13px; color: $text-secondary; }
}

.empty { padding-top: 60px; }
.pager { display: flex; justify-content: center; margin-top: 20px; }
</style>
