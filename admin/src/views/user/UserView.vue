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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Pagination from '@shared/components/Pagination.vue'
import { formatTime } from '@shared/utils'
import { usePaginationList } from '@shared/composables/usePaginationList'
import { getUserPage, setUserStatus } from '@/api/user'

const searchName = ref('')
const searchPhone = ref('')
const { list: tableData, total, loading, pagination, fetchList, search: handleSearch } = usePaginationList(
  (page, pageSize) => getUserPage({ page, pageSize, name: searchName.value || undefined, phone: searchPhone.value || undefined })
)

async function handleStatusChange(row, newValue) {
  const newStatus = newValue ? 1 : 0
  try {
    await setUserStatus(newStatus, row.id)
    ElMessage.success(newStatus === 1 ? '已启用' : '已禁用')
    fetchList()
  } catch { /* 错误时开关不变 */ }
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
