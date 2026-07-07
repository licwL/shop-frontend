<template>
  <div class="product-page">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <div class="search-bar">
        <el-input v-model="searchName" placeholder="商品名称" clearable style="width: 180px" @keyup.enter="handleSearch" />
        <el-select v-model="searchCategoryId" placeholder="分类" clearable style="width: 150px">
          <el-option v-for="c in categoryList" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
        <el-select v-model="searchStatus" placeholder="状态" clearable style="width: 120px">
          <el-option label="上架" :value="1" />
          <el-option label="下架" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button type="primary" @click="handleAdd">+ 新增商品</el-button>
        <el-button type="success" @click="handleExport">导出Excel</el-button>
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
        <el-table-column prop="name" label="商品名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="categoryName" label="分类" width="100" />
        <el-table-column label="图片" width="80">
          <template #default="{ row }">
            <el-image v-if="row.image" :src="row.image" style="width:48px;height:48px" fit="cover" :preview-src-list="[row.image]" />
            <span v-else class="no-img">无</span>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="100" align="right">
          <template #default="{ row }">¥{{ row.price?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" align="center" />
        <el-table-column prop="sales" label="销量" width="80" align="center" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <Pagination v-model:page="pagination.page" v-model:page-size="pagination.pageSize" :total="total" @change="fetchList" />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :model-value="dialogVisible"
      :title="dialogTitle"
      width="620px"
      :close-on-click-modal="false"
      @update:model-value="(val) => !val && handleCancel()"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width:100%">
            <el-option v-for="c in categoryList" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" style="width:100%" placeholder="0.00" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input-number v-model="form.stock" :min="0" style="width:100%" placeholder="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="商品图片" prop="image">
          <div class="upload-row">
            <el-upload
              :show-file-list="false"
              :before-upload="handleBeforeUpload"
              :http-request="handleUpload"
              accept="image/*"
            >
              <el-image v-if="form.image" :src="form.image" style="width:120px;height:120px" fit="cover" />
              <el-button v-else :loading="uploading">
                <el-icon><Plus /></el-icon> 上传图片
              </el-button>
            </el-upload>
            <span v-if="form.image" class="tip-text">点击图片重新上传</span>
          </div>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入商品描述" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">上架</el-radio>
            <el-radio :value="0">下架</el-radio>
          </el-radio-group>
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
import { Plus } from '@element-plus/icons-vue'
import Pagination from '@shared/components/Pagination.vue'
import { usePaginationList } from '@shared/composables/usePaginationList'
import { getProductPage, addProduct, updateProduct, deleteProducts, uploadImage } from '@/api/product'
import { exportProducts } from '@/api/export'
import { getCategoryList } from '@/api/category'

// ---- 列表状态 ----
const searchName = ref('')
const searchCategoryId = ref(null)
const searchStatus = ref(null)
const { list: tableData, total, loading, pagination, fetchList, search: handleSearch } = usePaginationList(
  (page, pageSize) => getProductPage({ page, pageSize, name: searchName.value || undefined, categoryId: searchCategoryId.value || undefined, status: searchStatus.value ?? undefined })
)
const selectedIds = ref([])

// ---- 分类列表（下拉用） ----
const categoryList = ref([])

// ---- 弹窗状态 ----
const dialogVisible = ref(false)
const dialogTitle = ref('')
const editingRow = ref(null)
const formRef = ref(null)
const submitting = ref(false)
const uploading = ref(false)

const isEdit = computed(() => !!editingRow.value)

const defaultForm = () => ({
  name: '',
  categoryId: null,
  price: 0,
  stock: 0,
  image: '',
  description: '',
  status: 1,
})

const form = reactive(defaultForm())

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
}

// ---- 数据请求 ----
async function fetchCategories() {
  try {
    const res = await getCategoryList()
    categoryList.value = res.data ?? []
  } catch { /* ignore */ }
}

// ---- 弹窗操作 ----
function handleAdd() {
  editingRow.value = null
  dialogTitle.value = '新增商品'
  Object.assign(form, defaultForm())
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function handleEdit(row) {
  editingRow.value = { ...row }
  dialogTitle.value = '编辑商品'
  form.name = row.name
  form.categoryId = row.categoryId
  form.price = row.price
  form.stock = row.stock
  form.image = row.image
  form.description = row.description ?? ''
  form.status = row.status
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

async function handleConfirm() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const data = {
      name: form.name,
      categoryId: form.categoryId,
      price: form.price,
      stock: form.stock,
      image: form.image,
      description: form.description,
      status: form.status,
    }
    if (isEdit.value) {
      data.id = editingRow.value.id
      await updateProduct(data)
      ElMessage.success('编辑成功')
    } else {
      await addProduct(data)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch { /* 拦截器已处理 */ } finally {
    submitting.value = false
  }
}

function handleCancel() {
  dialogVisible.value = false
}

// ---- 图片上传 ----
function handleBeforeUpload(file) {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) { ElMessage.error('只能上传图片文件'); return false }
  if (!isLt2M) { ElMessage.error('图片大小不能超过 2MB'); return false }
  return true
}

async function handleUpload({ file }) {
  uploading.value = true
  try {
    const res = await uploadImage(file)
    form.image = res.data
    ElMessage.success('上传成功')
  } catch { /* 拦截器已处理 */ } finally {
    uploading.value = false
  }
}

// ---- 删除 ----
async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定删除该商品吗？', '删除确认', { type: 'warning' })
    await deleteProducts([id])
    ElMessage.success('删除成功')
    fetchList()
  } catch { /* 取消或错误 */ }
}

async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 个商品吗？`, '批量删除', { type: 'warning' })
    await deleteProducts(selectedIds.value)
    ElMessage.success('删除成功')
    selectedIds.value = []
    fetchList()
  } catch { /* 取消或错误 */ }
}

async function handleExport() {
  try {
    const res = await exportProducts()
    const blob = res instanceof Blob ? res : new Blob([res])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = '商品数据.xlsx'; a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch { /* ignore */ }
}

onMounted(() => {
  fetchCategories()
  fetchList()
})
</script>

<style scoped lang="scss">
.product-page {
  .search-card {
    margin-bottom: 16px;

    .search-bar {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .batch-bar {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid $border-color;
    }
  }

  .table-card {
    :deep(.el-card__body) {
      padding-bottom: 8px;
    }
  }

  .upload-row {
    display: flex;
    align-items: center;
    gap: 12px;

    .tip-text {
      font-size: 12px;
      color: $text-secondary;
    }
  }

  .no-img {
    color: $text-secondary;
    font-size: 12px;
  }
}
</style>
