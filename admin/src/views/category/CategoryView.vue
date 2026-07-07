<template>
  <div class="category-page">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <div class="search-bar">
        <el-input
          v-model="searchName"
          placeholder="输入分类名称搜索"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button type="primary" @click="handleAdd">+ 新增分类</el-button>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="分类名称" min-width="150" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column label="状态" width="80" align="center">
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
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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
    <el-dialog
      :model-value="dialogVisible"
      :title="dialogTitle"
      width="460px"
      :close-on-click-modal="false"
      @update:model-value="(val) => !val && handleCancel()"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" maxlength="20" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="form.sort"
            :min="0"
            :max="999"
            placeholder="数字越小越靠前"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleConfirm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Pagination from '@shared/components/Pagination.vue'
import { formatTime } from '@shared/utils'
import { usePaginationList } from '@shared/composables/usePaginationList'
import {
  getCategoryPage,
  addCategory,
  updateCategory,
  deleteCategory,
  setCategoryStatus,
} from '@/api/category'

// ---- 列表状态 ----
const searchName = ref('')
const { list: tableData, total, loading, pagination, fetchList, search: handleSearch } = usePaginationList(
  (page, pageSize) => getCategoryPage({ page, pageSize, name: searchName.value || undefined })
)

// ---- 弹窗状态 ----
const dialogVisible = ref(false)
const dialogTitle = ref('')
const editingRow = ref(null)
const formRef = ref(null)
const submitting = ref(false)

const isEdit = computed(() => !!editingRow.value)

const form = reactive({
  name: '',
  sort: 0,
})

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
}

// ---- 弹窗操作 ----
function handleAdd() {
  editingRow.value = null
  dialogTitle.value = '新增分类'
  form.name = ''
  form.sort = 0
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function handleEdit(row) {
  editingRow.value = { ...row }
  dialogTitle.value = '编辑分类'
  form.name = row.name
  form.sort = row.sort
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

async function handleConfirm() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await updateCategory({ id: editingRow.value.id, name: form.name, sort: form.sort })
      ElMessage.success('编辑成功')
    } else {
      await addCategory({ name: form.name, sort: form.sort })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch {
    // 拦截器已处理
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  dialogVisible.value = false
}

// ---- 删除 ----
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除分类「${row.name}」吗？`, '删除确认', {
      type: 'warning',
    })
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    fetchList()
  } catch {
    // 取消或错误
  }
}

// ---- 状态切换 ----
async function handleStatusChange(row, newValue) {
  const newStatus = newValue ? 1 : 0
  try {
    await setCategoryStatus(newStatus, row.id)
    ElMessage.success(newStatus === 1 ? '已启用' : '已禁用')
    fetchList()
  } catch {
    // 错误时开关不会变化（单向绑定）
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped lang="scss">
.category-page {
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
