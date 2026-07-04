<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="logo-text">MALL</h1>
      <p class="sub">输入手机号登录或注册</p>
      <el-form ref="formRef" :model="form" :rules="rules" @keyup.enter="handleLogin">
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="手机号" maxlength="11" size="large" class="phone-inp" />
        </el-form-item>
        <el-button type="primary" class="login-btn" :loading="loading" size="large" @click="handleLogin">登 录</el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { setToken } from '@shared/request'
import { loginByPhone } from '@/api/user'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const loading = ref(false)
const form = reactive({ phone: '' })
const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
}

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const res = await loginByPhone(form.phone)
    setToken(res.data.token)
    localStorage.setItem('userId', res.data.id)
    localStorage.setItem('userName', res.data.name || '')
    router.push(route.query.redirect || '/')
  } catch { /* interceptor handled */ } finally { loading.value = false }
}
</script>

<style scoped lang="scss">
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #{$bg-page} 0%, #{$--el-color-primary-light-9} 100%);
}

.login-card {
  width: 380px;
  padding: 44px 36px 36px;
  background: $bg-card;
  border-radius: $radius;
  box-shadow: $shadow-card;
  text-align: center;

  @media (max-width: 420px) { width: calc(100% - 32px); padding: 32px 24px 28px; }

  .logo-text {
    font-family: 'DM Serif Display', serif;
    font-size: 32px;
    color: $--el-color-primary;
    letter-spacing: 4px;
    margin-bottom: 6px;
  }

  .sub { font-size: 14px; color: $text-secondary; margin-bottom: 28px; }

  .phone-inp { :deep(.el-input__wrapper) { border-radius: $radius; } }
  .login-btn { width: 100%; height: 44px; font-size: 15px; letter-spacing: 6px; font-weight: 600; }
}
</style>
