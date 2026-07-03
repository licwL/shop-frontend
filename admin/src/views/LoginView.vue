<template>
  <div class="login-page">
    <div class="login-card">
      <div class="card-header">
        <h1 class="title">电商管理后台</h1>
        <p class="subtitle">请登录您的账号</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleLogin"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import md5 from 'js-md5'
import { setToken } from '@shared/request'
import { login } from '@/api/employee'

const router = useRouter()
const route = useRoute()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res = await login({
      username: form.username,
      password: md5(form.password),
    })
    setToken(res.data.token)
    localStorage.setItem('userId', res.data.id)
    localStorage.setItem('userName', res.data.name)
    ElMessage.success('登录成功')
    router.push(route.query.redirect || '/')
  } catch {
    // 错误已由拦截器处理
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $bg-page 0%, $--el-color-primary-light-9 100%);
}

.login-card {
  width: 400px;
  padding: 40px;
  background: $bg-card;
  border-radius: $radius;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);

  .card-header {
    text-align: center;
    margin-bottom: 32px;

    .title {
      font-size: 24px;
      color: $text-primary;
      margin-bottom: 8px;
    }

    .subtitle {
      font-size: 14px;
      color: $text-secondary;
    }
  }

  .login-btn {
    width: 100%;
    height: 42px;
    font-size: 16px;
    letter-spacing: 4px;
  }
}
</style>
