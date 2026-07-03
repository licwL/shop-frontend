<template>
  <div class="notice-page">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <div class="search-bar">
        <el-input v-model="searchTitle" placeholder="公告标题" clearable style="width:200px" @keyup.enter="handleSearch" />
        <el-select v-model="searchTypeId" placeholder="类型" clearable style="width:150px">
          <el-option v-for="t in typeList" :key="t.id" :label="t.name" :value="t.id" />
        </el-select>
        <el-select v-model="searchStatus" placeholder="状态" clearable style="width:120px">
          <el-option label="已发布" :value="1" />
          <el-option label="草稿" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button type="primary" @click="handleAdd">+ 新增公告</el-button>
        <el-button @click="typeDialogVisible = true">管理类型</el-button>
      </div>
      <div class="batch-bar" v-if="selectedIds.length">
        <el-button type="danger" @click="handleBatchDelete">批量删除 ({{ selectedIds.length }})</el-button>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="(rows) => selectedIds = rows.map(r => r.id)">
        <el-table-column type="selection" width="50" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="typeName" label="类型" width="100" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              active-text="发布"
              inactive-text="草稿"
              @change="(val) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="170">
          <template #default="{ row }">{{ formatTime(row.updateTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <Pagination v-model:page="pagination.page" v-model:page-size="pagination.pageSize" :total="total" @change="fetchList" />
    </el-card>

    <!-- 公告弹窗 -->
    <el-dialog
      :model-value="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      @update:model-value="(val) => !val && handleCancel()"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入公告标题" maxlength="50" />
        </el-form-item>
        <el-form-item label="类型" prop="typeId">
          <el-select v-model="form.typeId" placeholder="请选择类型" style="width:100%">
            <el-option v-for="t in typeList" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="请输入公告内容" maxlength="2000" show-word-limit />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">发布</el-radio>
            <el-radio :value="0">草稿</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleConfirm">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 类型管理弹窗 -->
    <el-dialog v-model="typeDialogVisible" title="管理公告类型" width="500px">
      <div class="type-bar">
        <el-input v-model="newTypeName" placeholder="新类型名称" style="width:180px" maxlength="10" @keyup.enter="handleAddType" />
        <el-button type="primary" @click="handleAddType">添加</el-button>
      </div>
      <el-table :data="typeList" size="small" style="margin-top:12px">
        <el-table-column prop="name" label="类型名称" />
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button link type="primary" @click="startEditType(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelType(row.id)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <span v-if="editTypeRow">
            <el-input v-model="editTypeName" size="small" style="width:140px" @keyup.enter="handleEditType" />
            <el-button size="small" type="primary" @click="handleEditType" style="margin-left:8px">保存</el-button>
            <el-button size="small" @click="editTypeRow = null">取消</el-button>
          </span>
        </template>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Pagination from '@shared/components/Pagination.vue'
import {
  getNoticePage, addNotice, updateNotice, deleteNotices, setNoticeStatus,
  getNoticeTypeList, addNoticeType, updateNoticeType, deleteNoticeType,
} from '@/api/notice'

// ---- 列表 ----
const tableData = ref([])
const total = ref(0)
const loading = ref(false)
const searchTitle = ref('')
const searchTypeId = ref(null)
const searchStatus = ref(null)
const pagination = reactive({ page: 1, pageSize: 10 })
const selectedIds = ref([])
const typeList = ref([])

// ---- 弹窗 ----
const dialogVisible = ref(false)
const dialogTitle = ref('')
const editingRow = ref(null)
const formRef = ref(null)
const submitting = ref(false)

const isEdit = computed(() => !!editingRow.value)

const defaultForm = () => ({ title: '', typeId: null, content: '', status: 1 })
const form = reactive(defaultForm())

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  typeId: [{ required: true, message: '请选择类型', trigger: 'change' }],
}

// ---- 类型管理 ----
const typeDialogVisible = ref(false)
const newTypeName = ref('')
const editTypeRow = ref(null)
const editTypeName = ref('')

async function fetchTypes() {
  try {
    const res = await getNoticeTypeList()
    typeList.value = res.data ?? []
  } catch { /* ignore */ }
}

async function handleAddType() {
  if (!newTypeName.value.trim()) return
  try {
    await addNoticeType({ name: newTypeName.value.trim() })
    ElMessage.success('添加成功')
    newTypeName.value = ''
    fetchTypes()
  } catch { /* ignore */ }
}

function startEditType(row) {
  editTypeRow.value = row
  editTypeName.value = row.name
}

async function handleEditType() {
  if (!editTypeName.value.trim()) return
  try {
    await updateNoticeType({ id: editTypeRow.value.id, name: editTypeName.value.trim() })
    ElMessage.success('修改成功')
    editTypeRow.value = null
    fetchTypes()
  } catch { /* ignore */ }
}

async function handleDelType(id) {
  try {
    await ElMessageBox.confirm('确定删除该类型吗？', '提示', { type: 'warning' })
    await deleteNoticeType(id)
    ElMessage.success('删除成功')
    fetchTypes()
  } catch { /* ignore */ }
}

// ---- 数据 ----
async function fetchList() {
  loading.value = true
  try {
    const res = await getNoticePage({
      page: pagination.page,
      pageSize: pagination.pageSize,
      title: searchTitle.value || undefined,
      typeId: searchTypeId.value || undefined,
      status: searchStatus.value ?? undefined,
    })
    tableData.value = res.data.records ?? []
    total.value = res.data.total ?? 0
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

function handleSearch() { pagination.page = 1; fetchList() }

// ---- 弹窗 ----
function handleAdd() {
  editingRow.value = null
  dialogTitle.value = '新增公告'
  Object.assign(form, defaultForm())
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function handleEdit(row) {
  editingRow.value = { ...row }
  dialogTitle.value = '编辑公告'
  form.title = row.title
  form.typeId = row.typeId
  form.content = row.content ?? ''
  form.status = row.status
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

async function handleConfirm() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    const data = { title: form.title, typeId: form.typeId, content: form.content, status: form.status }
    if (isEdit.value) {
      data.id = editingRow.value.id
      await updateNotice(data)
      ElMessage.success('编辑成功')
    } else {
      await addNotice(data)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch { /* ignore */ } finally { submitting.value = false }
}

function handleCancel() { dialogVisible.value = false }

// ---- 状态/删除 ----
async function handleStatusChange(row, newValue) {
  const newStatus = newValue ? 1 : 0
  try {
    await setNoticeStatus(newStatus, row.id)
    ElMessage.success(newStatus === 1 ? '已发布' : '已撤回')
    fetchList()
  } catch { /* ignore */ }
}

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定删除该公告吗？', '提示', { type: 'warning' })
    await deleteNotices([id])
    ElMessage.success('删除成功')
    fetchList()
  } catch { /* ignore */ }
}

async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条公告吗？`, '提示', { type: 'warning' })
    await deleteNotices(selectedIds.value)
    ElMessage.success('删除成功')
    selectedIds.value = []
    fetchList()
  } catch { /* ignore */ }
}

function formatTime(val) {
  if (!val) return '-'
  return new Date(val).toLocaleString('zh-CN')
}

onMounted(() => { fetchTypes(); fetchList() })
</script>

<style scoped lang="scss">
.notice-page {
  .search-card {
    margin-bottom: 16px;
    .search-bar { display: flex; gap: 12px; flex-wrap: wrap; }
    .batch-bar { margin-top: 12px; padding-top: 12px; border-top: 1px solid $border-color; }
  }
  .table-card { :deep(.el-card__body) { padding-bottom: 8px; } }
  .type-bar { display: flex; gap: 8px; }
}
</style>
