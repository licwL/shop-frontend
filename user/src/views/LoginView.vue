<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="title">欢迎光临</h1>
      <p class="subtitle">输入手机号即可登录</p>
      <el-form ref="formRef" :model="form" :rules="rules" @keyup.enter="handleLogin">
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" size="large" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" :loading="loading" size="large" @click="handleLogin">登 录</el-button>
        </el-form-item>
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
  } catch { /* 拦截器已处理 */ } finally {
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
  width: 340px;
  padding: 40px 32px;
  background: $bg-card;
  border-radius: $radius;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  text-align: center;

  .title { font-size: 24px; color: $text-primary; margin-bottom: 8px; }
  .subtitle { font-size: 14px; color: $text-secondary; margin-bottom: 28px; }
  .login-btn { width: 100%; letter-spacing: 4px; }
}
</style>
