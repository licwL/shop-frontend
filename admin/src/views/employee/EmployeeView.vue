<template>
  <div class="employee-page">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <div class="search-bar">
        <el-input
          v-model="searchName"
          placeholder="输入员工姓名搜索"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button type="primary" @click="handleAdd">+ 新增员工</el-button>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column label="性别" width="70">
          <template #default="{ row }">
            {{ row.sex === '1' ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="idNumber" label="身份证号" width="200" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              @change="(val) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <Pagination
        v-model:page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="total"
        @change="fetchList"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <EmployeeDialog
      :visible="dialogVisible"
      :editing-row="editingRow"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Pagination from '@shared/components/Pagination.vue'
import { formatTime } from '@shared/utils'
import { usePaginationList } from '@shared/composables/usePaginationList'
import EmployeeDialog from '@/components/employee/EmployeeDialog.vue'
import {
  getEmployeePage,
  addEmployee,
  updateEmployee,
  setEmployeeStatus,
} from '@/api/employee'

// ---- 列表状态 ----
const searchName = ref('')
const { list: tableData, total, loading, pagination, fetchList, search: handleSearch } = usePaginationList(
  (page, pageSize) => getEmployeePage({ page, pageSize, name: searchName.value || undefined })
)

// ---- 弹窗状态 ----
const dialogVisible = ref(false)
const editingRow = ref(null)

// ---- 弹窗操作 ----
function handleAdd() {
  editingRow.value = null
  dialogVisible.value = true
}

function handleEdit(row) {
  editingRow.value = { ...row }
  dialogVisible.value = true
}

async function handleConfirm(formData) {
  try {
    if (editingRow.value) {
      await updateEmployee(formData)
      ElMessage.success('编辑成功')
    } else {
      await addEmployee(formData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch {
    // 错误已由拦截器处理
  }
}

function handleCancel() {
  dialogVisible.value = false
}

// ---- 状态切换 ----
async function handleStatusChange(row, newValue) {
  const newStatus = newValue ? 1 : 0
  try {
    await setEmployeeStatus(newStatus, row.id)
    ElMessage.success(newStatus === 1 ? '已启用' : '已禁用')
    fetchList()
  } catch {
    // 错误已由拦截器处理；开关因单向绑定不会变化
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped lang="scss">
.employee-page {
  .search-card {
    margin-bottom: 16px;

    .search-bar {
      display: flex;
      gap: 12px;
    }
  }

  .table-card {
    :deep(.el-card__body) {
      padding-bottom: 8px;
    }
  }
}
</style>
