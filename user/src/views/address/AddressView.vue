<template>
  <div class="addr-page">
    <h2 class="page-title">收货地址</h2>

    <div class="addr-grid">
      <div
        v-for="a in list" :key="a.id"
        class="addr-card" :class="{ default: a.isDefault }"
      >
        <div class="ac-top">
          <strong>{{ a.consignee }}</strong>
          <span class="ac-phone">{{ a.phone }}</span>
          <el-tag v-if="a.isDefault" size="small" type="warning">默认</el-tag>
        </div>
        <div class="ac-detail">{{ a.provinceName }}{{ a.cityName }}{{ a.districtName }} {{ a.detail }}</div>
        <div class="ac-label" v-if="a.label">{{ a.label }}</div>
        <div class="ac-actions">
          <el-button text size="small" @click="handleEdit(a)">编辑</el-button>
          <el-button text size="small" type="danger" @click="handleDelete(a.id)">删除</el-button>
          <el-button text size="small" v-if="!a.isDefault" @click="handleDefault(a.id)">设为默认</el-button>
        </div>
      </div>

      <div class="addr-card add-card" @click="handleAdd">
        <el-icon :size="28"><Plus /></el-icon>
        <span>新增地址</span>
      </div>
    </div>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑地址' : '新增地址'" width="480px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="收货人" prop="consignee"><el-input v-model="form.consignee" maxlength="20" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone"><el-input v-model="form.phone" maxlength="11" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item label="省" prop="provinceName"><el-input v-model="form.provinceName" /></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="市" prop="cityName"><el-input v-model="form.cityName" /></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="区" prop="districtName"><el-input v-model="form.districtName" /></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="详细地址" prop="detail"><el-input v-model="form.detail" maxlength="100" /></el-form-item>
        <el-form-item label="标签"><el-input v-model="form.label" placeholder="如: 家/公司" maxlength="10" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getAddressList, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/api/address'

const list = ref([])
const dialogVisible = ref(false)
const editingId = ref(null)
const formRef = ref(null)
const saving = ref(false)

const defaultForm = () => ({
  consignee: '', phone: '', sex: '1',
  provinceCode: '', provinceName: '', cityCode: '', cityName: '',
  districtCode: '', districtName: '', detail: '', label: '', isDefault: 0,
})
const form = reactive(defaultForm())

const rules = {
  consignee: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号' }, { pattern: /^1\d{10}$/, message: '格式不正确' }],
}

async function fetchList() {
  try { const res = await getAddressList(); list.value = res.data ?? [] } catch { /* ignore */ }
}

function handleAdd() {
  editingId.value = null; Object.assign(form, defaultForm()); dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}
function handleEdit(row) {
  editingId.value = row.id; Object.assign(form, row); dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    editingId.value ? await updateAddress({ ...form, id: editingId.value }) : await addAddress(form)
    ElMessage.success(editingId.value ? '修改成功' : '添加成功')
    dialogVisible.value = false; fetchList()
  } catch { /* ignore */ } finally { saving.value = false }
}

async function handleDelete(id) {
  try { await ElMessageBox.confirm('确定删除吗？'); await deleteAddress(id); ElMessage.success('已删除'); fetchList() } catch { /* ignore */ }
}
async function handleDefault(id) {
  try { await setDefaultAddress(id); ElMessage.success('已设为默认'); fetchList() } catch { /* ignore */ }
}

onMounted(() => fetchList())
</script>

<style scoped lang="scss">
.page-title { font-size: 20px; margin-bottom: 20px; color: $text-primary; }

.addr-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.addr-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: $radius;
  padding: 16px;
  min-height: 120px;

  &.default { border-color: $--el-color-primary; }

  .ac-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 14px;
    .ac-phone { color: $text-secondary; font-size: 13px; }
  }

  .ac-detail { font-size: 13px; color: $text-secondary; margin-bottom: 6px; line-height: 1.5; }
  .ac-label { font-size: 12px; color: $text-secondary; margin-bottom: 8px; }

  .ac-actions { display: flex; gap: 0; margin-top: 8px; padding-top: 8px; border-top: 1px solid $border-color; }
}

.add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: $--el-color-primary;
  cursor: pointer;
  border-style: dashed;
  font-size: 14px;

  &:hover { background: $--el-color-primary-light-9; }
}
</style>
