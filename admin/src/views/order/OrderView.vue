<template>
  <div class="order-page">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <div class="search-bar">
        <el-input v-model="searchNumber" placeholder="订单号" clearable style="width:200px" @keyup.enter="handleSearch" />
        <el-select v-model="searchStatus" placeholder="订单状态" clearable style="width:140px">
          <el-option v-for="(label, val) in ORDER_STATUS" :key="val" :label="label" :value="Number(val)" />
        </el-select>
        <el-date-picker v-model="searchDate" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width:260px" />
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="number" label="订单号" width="180" />
        <el-table-column prop="userName" label="用户" width="100" />
        <el-table-column prop="consignee" label="收货人" width="100" />
        <el-table-column label="金额" width="100" align="right">
          <template #default="{ row }">¥{{ row.amount?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ orderStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="170">
          <template #default="{ row }">{{ formatTime(row.orderTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
            <el-button v-if="row.status === 2" type="success" link @click="handleStatus(row, 3)">发货</el-button>
            <el-button v-if="row.status === 3" type="warning" link @click="handleStatus(row, 4)">完成</el-button>
          </template>
        </el-table-column>
      </el-table>

      <Pagination v-model:page="pagination.page" v-model:page-size="pagination.pageSize" :total="total" @change="fetchList" />
    </el-card>

    <!-- 订单详情抽屉 -->
    <el-drawer v-model="drawerVisible" title="订单详情" size="480px">
      <template v-if="detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="订单号">{{ detail.number }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusType(detail.status)" size="small">{{ orderStatusText(detail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户">{{ detail.userName }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ detail.phone }}</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ detail.consignee }}</el-descriptions-item>
          <el-descriptions-item label="地址">{{ detail.address }}</el-descriptions-item>
          <el-descriptions-item label="金额">¥{{ detail.amount?.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatTime(detail.orderTime) }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.deliveryTime" label="发货时间">{{ formatTime(detail.deliveryTime) }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.cancelReason" label="取消原因">{{ detail.cancelReason }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="detail-title">商品明细</h4>
        <el-table :data="detail.orderDetailList" size="small">
          <el-table-column type="index" label="#" width="40" />
          <el-table-column label="图片" width="60">
            <template #default="{ row }">
              <el-image v-if="row.image" :src="row.image" style="width:40px;height:40px" fit="cover" />
            </template>
          </el-table-column>
          <el-table-column prop="name" label="商品" min-width="120" show-overflow-tooltip />
          <el-table-column prop="number" label="数量" width="50" align="center" />
          <el-table-column label="金额" width="80" align="right">
            <template #default="{ row }">¥{{ row.amount?.toFixed(2) }}</template>
          </el-table-column>
        </el-table>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Pagination from '@shared/components/Pagination.vue'
import { ORDER_STATUS } from '@shared/utils'
import { getOrderPage, getOrderDetail, setOrderStatus } from '@/api/order'

// ---- 列表状态 ----
const tableData = ref([])
const total = ref(0)
const loading = ref(false)
const searchNumber = ref('')
const searchStatus = ref(null)
const searchDate = ref(null)
const pagination = reactive({ page: 1, pageSize: 10 })

// ---- 详情抽屉 ----
const drawerVisible = ref(false)
const detail = ref(null)

// ---- 数据请求 ----
async function fetchList() {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      number: searchNumber.value || undefined,
      status: searchStatus.value ?? undefined,
    }
    if (searchDate.value?.length === 2) {
      params.beginTime = searchDate.value[0]
      params.endTime = searchDate.value[1]
    }
    const res = await getOrderPage(params)
    tableData.value = res.data.records ?? []
    total.value = res.data.total ?? 0
  } catch { /* 拦截器已处理 */ } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchList()
}

function handleReset() {
  searchNumber.value = ''
  searchStatus.value = null
  searchDate.value = null
  handleSearch()
}

// ---- 详情 ----
async function handleDetail(row) {
  try {
    const res = await getOrderDetail(row.id)
    detail.value = res.data
    drawerVisible.value = true
  } catch { /* 拦截器已处理 */ }
}

// ---- 状态变更 ----
async function handleStatus(row, status) {
  const label = status === 3 ? '发货' : '完成'
  try {
    await ElMessageBox.confirm(`确认${label}该订单吗？`, '操作确认', { type: 'info' })
    await setOrderStatus(status, row.id)
    ElMessage.success(`已${label}`)
    fetchList()
  } catch { /* 取消或错误 */ }
}

// ---- 工具 ----
const statusType = (s) => {
  if (s === 1) return 'warning'
  if (s === 2) return 'primary'
  if (s === 3) return 'success'
  if (s === 4) return 'info'
  if (s === 5) return 'danger'
  return 'info'
}

function formatTime(val) {
  if (!val) return '-'
  return new Date(val).toLocaleString('zh-CN')
}

function orderStatusText(val) {
  return ORDER_STATUS[val] || '未知'
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped lang="scss">
.order-page {
  .search-card {
    margin-bottom: 16px;

    .search-bar {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  }

  .table-card {
    :deep(.el-card__body) {
      padding-bottom: 8px;
    }
  }

  .detail-title {
    margin: 20px 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
  }
}
</style>
