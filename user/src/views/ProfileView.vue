<template>
  <div class="profile-page">
    <h2 class="page-title">个人中心</h2>

    <div class="profile-layout">
      <!-- 左侧菜单 -->
      <div class="side-menu">
        <div class="avatar-area">
          <el-avatar :size="64" :src="info.avatar"><el-icon :size="32"><UserFilled /></el-icon></el-avatar>
          <div class="user-name">{{ info.name || '未设置' }}</div>
        </div>
        <div class="menu-item active">个人信息</div>
        <div class="menu-item" @click="router.push('/address')">收货地址</div>
        <div class="menu-item" @click="router.push('/orders')">我的订单</div>
        <div class="menu-item danger" @click="handleLogout">退出登录</div>
      </div>

      <!-- 右侧内容 -->
      <div class="main-panel">
        <el-card>
          <template #header><strong>基本信息</strong></template>
          <el-form :model="info" label-width="80px" class="info-form">
            <el-form-item label="昵称">
              <span v-if="!editingName">{{ info.name || '未设置' }}</span>
              <el-input v-else v-model="editName" maxlength="20" style="width:200px" />
              <el-button text type="primary" size="small" @click="toggleName">
                {{ editingName ? '保存' : '修改' }}
              </el-button>
            </el-form-item>
            <el-form-item label="手机号"><span>{{ info.phone }}</span></el-form-item>
            <el-form-item label="性别">
              <span v-if="!editingSex">{{ info.sex === '1' ? '男' : info.sex === '0' ? '女' : '未设置' }}</span>
              <el-radio-group v-else v-model="editSex">
                <el-radio value="1">男</el-radio>
                <el-radio value="0">女</el-radio>
              </el-radio-group>
              <el-button text type="primary" size="small" @click="toggleSex">
                {{ editingSex ? '保存' : '修改' }}
              </el-button>
            </el-form-item>
            <el-form-item label="注册时间"><span>{{ formatTime(info.createTime) }}</span></el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { clearToken } from '@shared/request'
import { getUserInfo, updateUserInfo } from '@/api/user'

const router = useRouter()
const info = reactive({ name: '', phone: '', sex: '', avatar: '', createTime: '' })
const editingName = ref(false)
const editingSex = ref(false)
const editName = ref('')
const editSex = ref('')

async function fetchInfo() {
  try {
    const res = await getUserInfo()
    Object.assign(info, res.data)
  } catch { /* ignore */ }
}

async function toggleName() {
  if (editingName.value) {
    try { await updateUserInfo({ name: editName.value, sex: info.sex }); info.name = editName.value; ElMessage.success('已更新') } catch { /* ignore */ }
  } else {
    editName.value = info.name || ''
  }
  editingName.value = !editingName.value
}

async function toggleSex() {
  if (editingSex.value) {
    try { await updateUserInfo({ name: info.name, sex: editSex.value }); info.sex = editSex.value; ElMessage.success('已更新') } catch { /* ignore */ }
  } else {
    editSex.value = info.sex || '1'
  }
  editingSex.value = !editingSex.value
}

function handleLogout() { clearToken(); localStorage.clear(); router.push('/login') }
function formatTime(v) { return v ? new Date(v).toLocaleString('zh-CN') : '-' }

onMounted(() => fetchInfo())
</script>

<style scoped lang="scss">
.page-title { font-size: 20px; margin-bottom: 20px; color: $text-primary; }

.profile-layout { display: flex; gap: 20px; }

.side-menu {
  width: 200px;
  flex-shrink: 0;
  background: $bg-card;
  border-radius: $radius;
  padding: 24px 0;

  .avatar-area {
    text-align: center;
    padding-bottom: 16px;
    margin-bottom: 8px;
    border-bottom: 1px solid $border-color;
    .user-name { margin-top: 8px; font-size: 14px; font-weight: 600; color: $text-primary; }
  }

  .menu-item {
    padding: 12px 24px;
    font-size: 14px;
    color: $text-secondary;
    cursor: pointer;
    &.active { color: $--el-color-primary; font-weight: 600; background: $--el-color-primary-light-9; }
    &:hover { color: $--el-color-primary; }
    &.danger { color: #F56C6C; margin-top: 16px; border-top: 1px solid $border-color; padding-top: 16px; }
  }
}

.main-panel {
  flex: 1;
  .info-form { :deep(.el-form-item) { margin-bottom: 18px; } }
}
</style>
