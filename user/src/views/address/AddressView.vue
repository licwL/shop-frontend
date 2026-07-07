<template>
  <div class="page-container">
    <h2 class="page-title display-font">
      <el-icon class="back-icon" @click="$router.back()"><ArrowLeft /></el-icon>
      收货地址
    </h2>
    <div class="addr-grid">
      <div v-for="a in list" :key="a.id" class="addr-card" :class="{ def: a.isDefault }">
        <div class="ac-top"><strong>{{ a.consignee }}</strong><span class="ac-phone">{{ a.phone }}</span><el-tag v-if="a.isDefault" size="small" type="warning">默认</el-tag></div>
        <div class="ac-detail">{{ a.provinceName }}{{ a.cityName }}{{ a.districtName }} {{ a.detail }}</div>
        <div class="ac-label" v-if="a.label">{{ a.label }}</div>
        <div class="ac-actions">
          <el-button text size="small" @click="edit(a)">编辑</el-button>
          <el-button text size="small" type="danger" @click="del(a.id)">删除</el-button>
          <el-button text size="small" v-if="!a.isDefault" @click="setDef(a.id)">设为默认</el-button>
        </div>
      </div>
      <div class="addr-card add-card" @click="open()"><el-icon :size="24"><Plus /></el-icon><span>新增地址</span></div>
    </div>

    <el-dialog v-model="vis" :title="eid ? '编辑地址' : '新增地址'" width="480px">
      <el-form ref="fr" :model="fm" :rules="rls" label-width="80px">
        <el-row :gutter="12">
          <el-col :span="12"><el-form-item label="收货人" prop="consignee"><el-input v-model="fm.consignee" maxlength="20" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="手机号" prop="phone"><el-input v-model="fm.phone" maxlength="11" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="8"><el-form-item label="省"><el-input v-model="fm.provinceName" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="市"><el-input v-model="fm.cityName" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="区"><el-input v-model="fm.districtName" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="详细地址" prop="detail"><el-input v-model="fm.detail" maxlength="100" /></el-form-item>
        <el-form-item label="标签"><el-input v-model="fm.label" placeholder="家/公司" maxlength="10" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="vis = false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowLeft } from '@element-plus/icons-vue'
import { getAddressList, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/api/address'

const list = ref([]); const vis = ref(false); const eid = ref(null); const fr = ref(null); const saving = ref(false)
const empt = () => ({ consignee: '', phone: '', sex: '1', provinceCode: '', provinceName: '', cityCode: '', cityName: '', districtCode: '', districtName: '', detail: '', label: '', isDefault: 0 })
const fm = reactive(empt())
const rls = { consignee: [{ required: true, message: '请输入' }], phone: [{ required: true, message: '请输入' }, { pattern: /^1\d{10}$/, message: '格式不正确' }] }

async function load() { try { list.value = (await getAddressList()).data ?? [] } catch { /* ignore */ } }
function open() { eid.value = null; Object.assign(fm, empt()); vis.value = true; nextTick(() => fr.value?.clearValidate()) }
function edit(row) { eid.value = row.id; Object.assign(fm, row); vis.value = true; nextTick(() => fr.value?.clearValidate()) }
async function save() { if (!await fr.value.validate().catch(() => false)) return; saving.value = true; try { eid.value ? await updateAddress({ ...fm, id: eid.value }) : await addAddress(fm); ElMessage.success(eid.value ? '修改成功' : '添加成功'); vis.value = false; load() } catch { /* ignore */ } finally { saving.value = false } }
async function del(id) { try { await ElMessageBox.confirm('确定删除？'); await deleteAddress(id); ElMessage.success('已删除'); load() } catch { /* ignore */ } }
async function setDef(id) { try { await setDefaultAddress(id); ElMessage.success('已设为默认'); load() } catch { /* ignore */ } }

onMounted(() => load())
</script>

<style scoped lang="scss">
.page-title { font-size: 24px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
.back-icon { cursor: pointer; color: $text-secondary; transition: color 0.2s; &:hover { color: $--el-color-primary; } }
.addr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; @media (max-width: $bp-mobile) { grid-template-columns: repeat(2, 1fr); } @media (max-width: 480px) { grid-template-columns: 1fr; } }
.addr-card { background: $bg-card; border: 1px solid $border-color; border-radius: $radius; padding: 18px; min-height: 120px; transition: 0.2s;
  &.def { border-color: $--el-color-primary; }
  .ac-top { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 14px; .ac-phone { color: $text-secondary; font-size: 13px; } }
  .ac-detail { font-size: 13px; color: $text-secondary; margin-bottom: 6px; line-height: 1.5; }
  .ac-label { font-size: 12px; color: $text-secondary; margin-bottom: 8px; }
  .ac-actions { display: flex; gap: 0; margin-top: 8px; padding-top: 8px; border-top: 1px solid $border-color; }
}
.add-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: $--el-color-primary; cursor: pointer; border-style: dashed; font-weight: 500; font-size: 14px; &:hover { background: $--el-color-primary-light-9; } }
</style>
