<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="520px"
    :close-on-click-modal="false"
    @update:model-value="(val) => !val && handleCancel()"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="84px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="form.username"
          :disabled="isEdit"
          placeholder="请输入用户名"
          maxlength="20"
        />
      </el-form-item>

      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" maxlength="20" />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
      </el-form-item>

      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="form.sex">
          <el-radio value="1">男</el-radio>
          <el-radio value="0">女</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="身份证号" prop="idNumber">
        <el-input v-model="form.idNumber" placeholder="请输入身份证号" maxlength="18" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleConfirm">
        确 定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  editingRow: { type: Object, default: null },
})

const emit = defineEmits(['confirm', 'cancel'])

const formRef = ref(null)
const submitting = ref(false)

const isEdit = computed(() => !!props.editingRow)
const title = computed(() => (isEdit.value ? '编辑员工' : '新增员工'))

const form = reactive({
  username: '',
  name: '',
  phone: '',
  sex: '1',
  idNumber: '',
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度 2-20 位', trigger: 'blur' },
  ],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
  idNumber: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^\d{17}[\dXx]$/, message: '身份证号格式不正确', trigger: 'blur' },
  ],
}

watch(
  () => props.visible,
  async (val) => {
    if (val) {
      await nextTick()
      if (props.editingRow) {
        form.username = props.editingRow.username || ''
        form.name = props.editingRow.name || ''
        form.phone = props.editingRow.phone || ''
        form.sex = props.editingRow.sex || '1'
        form.idNumber = props.editingRow.idNumber || ''
      } else {
        formRef.value?.resetFields()
        form.sex = '1'
      }
    }
  },
)

async function handleConfirm() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const data = {
    name: form.name,
    phone: form.phone,
    sex: form.sex,
    idNumber: form.idNumber,
  }

  if (isEdit.value) {
    data.id = props.editingRow.id
  } else {
    data.username = form.username
  }

  emit('confirm', data)
}

function handleCancel() {
  emit('cancel')
}
</script>
