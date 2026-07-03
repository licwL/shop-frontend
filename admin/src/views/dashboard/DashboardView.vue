<template>
  <div class="dashboard">
    <!-- 日期筛选 -->
    <div class="date-bar">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始"
        end-placeholder="结束"
        value-format="YYYY-MM-DD"
        style="width:260px"
        @change="fetchAll"
      />
      <el-button @click="handleExportOrders">导出订单</el-button>
      <el-button @click="handleExportProducts">导出商品</el-button>
    </div>

    <!-- 今日概览 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="4" v-for="s in statCards" :key="s.label">
        <el-card class="stat-card">
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-value" :style="{ color: s.color }">{{ s.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>营业额趋势</template>
          <div ref="turnoverChart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>订单量趋势</template>
          <div ref="orderChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>销量 Top10</template>
          <div ref="top10Chart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>用户趋势</template>
          <div ref="userChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getTurnover, getOrderReport, getTop10, getUserReport, getBusiness, exportOrders, exportProducts } from '@/api/report'

// ---- 日期 ----
const today = new Date()
const begin = new Date(today.getFullYear(), today.getMonth(), 1)
const dateRange = ref([
  `${begin.getFullYear()}-${String(begin.getMonth() + 1).padStart(2, '0')}-01`,
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
])

const getDateParams = () => ({
  begin: dateRange.value?.[0] || undefined,
  end: dateRange.value?.[1] || undefined,
})

// ---- 概览 ----
const statCards = reactive([
  { label: '今日营业额', value: '-', color: '#D4845A' },
  { label: '有效订单', value: '-', color: '#409EFF' },
  { label: '完成率', value: '-', color: '#67C23A' },
  { label: '客单价', value: '-', color: '#E6A23C' },
  { label: '新增用户', value: '-', color: '#909399' },
])

// ---- 图表 ----
const turnoverChart = ref(null)
const orderChart = ref(null)
const top10Chart = ref(null)
const userChart = ref(null)
let charts = []

function initChart(ref, option) {
  if (!ref.value) return
  const instance = echarts.init(ref.value)
  instance.setOption(option)
  charts.push(instance)
  return instance
}

function resizeCharts() {
  charts.forEach(c => c?.resize())
}

// ---- 数据 ----
async function fetchAll() {
  const params = getDateParams()
  await Promise.allSettled([
    fetchBusiness(),
    fetchTurnover(params),
    fetchOrderReport(params),
    fetchTop10(params),
    fetchUserReport(params),
  ])
}

async function fetchBusiness() {
  try {
    const res = await getBusiness()
    const d = res.data
    statCards[0].value = d.turnover != null ? `¥${Number(d.turnover).toFixed(0)}` : '-'
    statCards[1].value = d.validOrderCount ?? '-'
    statCards[2].value = d.orderCompletionRate != null ? `${Number(d.orderCompletionRate).toFixed(0)}%` : '-'
    statCards[3].value = d.unitPrice != null ? `¥${Number(d.unitPrice).toFixed(0)}` : '-'
    statCards[4].value = d.newUsers ?? '-'
  } catch { /* ignore */ }
}

async function fetchTurnover(params) {
  try {
    const res = await getTurnover(params)
    const { dateList, turnoverList } = res.data
    initChart(turnoverChart, {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: dateList || [] },
      yAxis: { type: 'value' },
      series: [{
        type: 'line', data: turnoverList || [], smooth: true,
        lineStyle: { color: '#D4845A' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [ { offset: 0, color: 'rgba(212,132,90,0.25)' }, { offset: 1, color: 'rgba(212,132,90,0)' } ]) },
      }],
      grid: { left: 40, right: 20, top: 20, bottom: 30 },
    })
  } catch { /* ignore */ }
}

async function fetchOrderReport(params) {
  try {
    const res = await getOrderReport(params)
    const { dateList, orderCountList, validOrderCountList } = res.data
    initChart(orderChart, {
      tooltip: { trigger: 'axis' },
      legend: { data: ['订单总数', '有效订单'] },
      xAxis: { type: 'category', data: dateList || [] },
      yAxis: { type: 'value' },
      series: [
        { name: '订单总数', type: 'bar', data: orderCountList || [], color: '#409EFF' },
        { name: '有效订单', type: 'bar', data: validOrderCountList || [], color: '#67C23A' },
      ],
      grid: { left: 40, right: 20, top: 40, bottom: 30 },
    })
  } catch { /* ignore */ }
}

async function fetchTop10(params) {
  try {
    const res = await getTop10(params)
    const { nameList, numberList } = res.data
    initChart(top10Chart, {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: (nameList || []).slice(0, 10).reverse(), inverse: true },
      series: [{
        type: 'bar', data: (numberList || []).slice(0, 10).reverse(),
        itemStyle: { color: '#D4845A', borderRadius: [0, 4, 4, 0] },
      }],
      grid: { left: 80, right: 20, top: 10, bottom: 20 },
    })
  } catch { /* ignore */ }
}

async function fetchUserReport(params) {
  try {
    const res = await getUserReport(params)
    const { dateList, totalUserList, newUserList } = res.data
    initChart(userChart, {
      tooltip: { trigger: 'axis' },
      legend: { data: ['总用户', '新增'] },
      xAxis: { type: 'category', data: dateList || [] },
      yAxis: { type: 'value' },
      series: [
        { name: '总用户', type: 'line', data: totalUserList || [], smooth: true, color: '#409EFF' },
        { name: '新增', type: 'line', data: newUserList || [], smooth: true, color: '#67C23A' },
      ],
      grid: { left: 40, right: 20, top: 40, bottom: 30 },
    })
  } catch { /* ignore */ }
}

// ---- 导出 ----
async function handleExportOrders() {
  try {
    const res = await exportOrders()
    downloadBlob(res, '订单数据.xlsx')
  } catch { /* ignore */ }
}

async function handleExportProducts() {
  try {
    const res = await exportProducts()
    downloadBlob(res, '商品数据.xlsx')
  } catch { /* ignore */ }
}

function downloadBlob(res, filename) {
  const blob = res instanceof Blob ? res : new Blob([res])
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ---- 生命周期 ----
onMounted(async () => {
  await fetchAll()
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  charts.forEach(c => c?.dispose())
})
</script>

<style scoped lang="scss">
.dashboard {
  .date-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .stat-row {
    margin-bottom: 16px;
  }

  .stat-card {
    .stat-label {
      font-size: 13px;
      color: $text-secondary;
      margin-bottom: 8px;
    }
    .stat-value {
      font-size: 22px;
      font-weight: 600;
    }
  }

  .chart-row {
    margin-bottom: 16px;
  }

  .chart {
    height: 300px;
  }

  :deep(.el-card__header) {
    font-weight: 600;
    font-size: 14px;
  }
}
</style>
