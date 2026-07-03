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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Pagination from '@shared/components/Pagination.vue'
import EmployeeDialog from '@/components/employee/EmployeeDialog.vue'
import {
  getEmployeePage,
  addEmployee,
  updateEmployee,
  setEmployeeStatus,
} from '@/api/employee'

// ---- 列表状态 ----
const tableData = ref([])
const total = ref(0)
const loading = ref(false)
const searchName = ref('')
const pagination = reactive({ page: 1, pageSize: 10 })

// ---- 弹窗状态 ----
const dialogVisible = ref(false)
const editingRow = ref(null)

// ---- 数据请求 ----
async function fetchList() {
  loading.value = true
  try {
    const res = await getEmployeePage({
      page: pagination.page,
      pageSize: pagination.pageSize,
      name: searchName.value || undefined,
    })
    tableData.value = res.data.records ?? []
    total.value = res.data.total ?? 0
  } catch {
    // 错误已由拦截器处理
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchList()
}

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

// ---- 工具函数 ----
function formatTime(val) {
  if (!val) return '-'
  return new Date(val).toLocaleString('zh-CN')
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
