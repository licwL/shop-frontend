<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="logo-text">MALL</h1>
      <p class="sub">登录您的账号</p>
      <p class="student-info">李崇文 24120320</p>
      <el-form ref="formRef" :model="form" :rules="rules" @keyup.enter="handleLogin">
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="手机号" maxlength="11" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" show-password size="large" maxlength="32" />
        </el-form-item>
        <el-button type="primary" class="login-btn" :loading="loading" size="large" @click="handleLogin">登 录</el-button>
      </el-form>
      <div class="extra">
        <span class="link" @click="$router.push('/register')">没有账号？去注册</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { setToken } from '@shared/request'
import md5 from 'js-md5'
import { login } from '@/api/user'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const loading = ref(false)
const form = reactive({ phone: '', password: '' })

const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度6-32位', trigger: 'blur' },
  ],
}

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const res = await login({ phone: form.phone, password: md5(form.password) })
    setToken(res.data.token)
    localStorage.setItem('userId', res.data.id)
    localStorage.setItem('userName', res.data.name || '')
    const redirect = route.query.redirect
    router.push(redirect && redirect.startsWith('/') ? redirect : '/')
  } catch { /* ignore */ } finally { loading.value = false }
}
</script>

<style scoped lang="scss">
.login-page {
  height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(160deg, #{$bg-page} 0%, #{$--el-color-primary-light-9} 100%);
}

.login-card {
  width: 380px; padding: 44px 36px 36px;
  background: $bg-card; border-radius: $radius; box-shadow: $shadow-card; text-align: center;
  @media (max-width: 420px) { width: calc(100% - 32px); padding: 32px 24px 28px; }

  .logo-text {
    font-size: 32px; color: $--el-color-primary; letter-spacing: 4px; margin-bottom: 6px;
    font-family: 'DM Serif Display', serif;
  }
  .sub { font-size: 14px; color: $text-secondary; margin-bottom: 28px; }
	  .student-info { font-size: 12px; color: $text-muted; margin-top: -22px; margin-bottom: 6px; }
  .login-btn { width: 100%; height: 44px; font-size: 15px; letter-spacing: 6px; font-weight: 600; }
  .extra { margin-top: 16px; }
  .link { font-size: 13px; color: $--el-color-primary; cursor: pointer; &:hover { text-decoration: underline; } }
}
</style>
