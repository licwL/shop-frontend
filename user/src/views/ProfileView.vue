<template>
  <div class="page-container">
    <h2 class="page-title display-font">个人中心</h2>
    <div class="profile-layout">
      <div class="side-menu">
        <div class="avatar-box">
          <el-avatar :size="60" :src="info.avatar"><el-icon :size="28"><UserFilled /></el-icon></el-avatar>
          <div class="uname">{{ info.name || '未设置' }}</div>
        </div>
        <div class="menu-item active">基本信息</div>
        <div class="menu-item" @click="$router.push('/address')">收货地址</div>
        <div class="menu-item" @click="$router.push('/orders')">我的订单</div>
        <div class="menu-item danger" @click="logout">退出登录</div>
      </div>

      <div class="main-panel">
        <el-card><template #header><strong>基本信息</strong></template>
          <el-form :model="info" label-width="80px" class="info-form">
            <el-form-item label="昵称">
              <span v-if="!en">{{ info.name || '-' }}</span>
              <el-input v-else v-model="ename" maxlength="20" style="width:180px" />
              <el-button text type="primary" size="small" @click="toggleName">{{ en ? '保存' : '修改' }}</el-button>
            </el-form-item>
            <el-form-item label="手机号"><span>{{ info.phone }}</span></el-form-item>
            <el-form-item label="性别">
              <span v-if="!es">{{ info.sex === '1' ? '男' : info.sex === '0' ? '女' : '-' }}</span>
              <el-radio-group v-else v-model="esex">
                <el-radio value="1">男</el-radio><el-radio value="0">女</el-radio>
              </el-radio-group>
              <el-button text type="primary" size="small" @click="toggleSex">{{ es ? '保存' : '修改' }}</el-button>
            </el-form-item>
            <el-form-item label="注册时间"><span>{{ fmt(info.createTime) }}</span></el-form-item>
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
const en = ref(false); const es = ref(false)
const ename = ref(''); const esex = ref('')

async function load() { try { Object.assign(info, (await getUserInfo()).data) } catch { /* ignore */ } }

async function toggleName() {
  if (en.value) { try { await updateUserInfo({ name: ename.value, sex: info.sex }); info.name = ename.value; ElMessage.success('已更新') } catch { /* ignore */ } }
  else ename.value = info.name || ''
  en.value = !en.value
}

async function toggleSex() {
  if (es.value) { try { await updateUserInfo({ name: info.name, sex: esex.value }); info.sex = esex.value; ElMessage.success('已更新') } catch { /* ignore */ } }
  else esex.value = info.sex || '1'
  es.value = !es.value
}

function logout() { clearToken(); localStorage.clear(); router.push('/login') }
const fmt = v => v ? new Date(v).toLocaleString('zh-CN') : '-'

onMounted(() => load())
</script>

<style scoped lang="scss">
.page-title { font-size: 24px; margin-bottom: 20px; }

.profile-layout { display: flex; gap: 24px; @media (max-width: 640px) { flex-direction: column; } }

.side-menu {
  width: 180px; flex-shrink: 0; background: $bg-card; border-radius: $radius; padding: 20px 0;

  .avatar-box { text-align: center; padding-bottom: 14px; margin-bottom: 6px; border-bottom: 1px solid $border-color;
    .uname { margin-top: 8px; font-weight: 600; font-size: 14px; color: $text-primary; }
  }
  .menu-item { padding: 11px 20px; font-size: 14px; color: $text-secondary; cursor: pointer; font-weight: 500;
    &.active { color: $--el-color-primary; font-weight: 600; background: $--el-color-primary-light-9; }
    &:hover { color: $--el-color-primary; }
    &.danger { color: $danger; margin-top: 14px; border-top: 1px solid $border-color; padding-top: 15px; }
  }
}

.main-panel { flex: 1; .info-form { :deep(.el-form-item) { margin-bottom: 18px; } } }
</style>
