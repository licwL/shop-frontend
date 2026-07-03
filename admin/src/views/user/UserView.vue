<template>
  <div class="user-page">
    <el-card class="search-card">
      <div class="search-bar">
        <el-input v-model="searchName" placeholder="用户姓名" clearable style="width:180px" @keyup.enter="handleSearch" />
        <el-input v-model="searchPhone" placeholder="手机号" clearable style="width:180px" @keyup.enter="handleSearch" />
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column label="性别" width="70">
          <template #default="{ row }">{{ row.sex === '1' ? '男' : '女' }}</template>
        </el-table-column>
        <el-table-column prop="idNumber" label="身份证号" width="200" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              @change="(val) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="170">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
      </el-table>

      <Pagination v-model:page="pagination.page" v-model:page-size="pagination.pageSize" :total="total" @change="fetchList" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Pagination from '@shared/components/Pagination.vue'
import { getUserPage, setUserStatus } from '@/api/user'

const tableData = ref([])
const total = ref(0)
const loading = ref(false)
const searchName = ref('')
const searchPhone = ref('')
const pagination = reactive({ page: 1, pageSize: 10 })

async function fetchList() {
  loading.value = true
  try {
    const res = await getUserPage({
      page: pagination.page,
      pageSize: pagination.pageSize,
      name: searchName.value || undefined,
      phone: searchPhone.value || undefined,
    })
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

async function handleStatusChange(row, newValue) {
  const newStatus = newValue ? 1 : 0
  try {
    await setUserStatus(newStatus, row.id)
    ElMessage.success(newStatus === 1 ? '已启用' : '已禁用')
    fetchList()
  } catch { /* 错误时开关不变 */ }
}

function formatTime(val) {
  if (!val) return '-'
  return new Date(val).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped lang="scss">
.user-page {
  .search-card {
    margin-bottom: 16px;
    .search-bar { display: flex; gap: 12px; }
  }
  .table-card {
    :deep(.el-card__body) { padding-bottom: 8px; }
  }
}
</style>
