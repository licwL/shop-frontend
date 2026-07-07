<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="logo-text">MALL</h1>
      <p class="sub">注册新账号</p>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" size="large" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="6-32位密码" show-password size="large" maxlength="32" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPwd">
          <el-input v-model="form.confirmPwd" type="password" placeholder="再次输入密码" show-password size="large" maxlength="32" />
        </el-form-item>
        <el-form-item label="验证码" prop="captchaCode">
          <div class="captcha-row">
            <el-input v-model="form.captchaCode" placeholder="4位验证码" maxlength="4" size="large" style="width:140px" />
            <img v-if="captchaImage" :src="captchaImage" class="captcha-img" @click="refreshCaptcha" title="点击刷新" />
          </div>
        </el-form-item>
        <el-button type="primary" class="login-btn" :loading="loading" size="large" @click="handleRegister">注 册</el-button>
      </el-form>
      <div class="extra">
        <span class="link" @click="$router.push('/login')">已有账号？去登录</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { setToken } from '@shared/request'
import md5 from 'js-md5'
import { register, getCaptcha } from '@/api/user'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const captchaImage = ref('')
const captchaKey = ref('')
const form = reactive({ phone: '', password: '', confirmPwd: '', captchaCode: '' })

const validateConfirm = (rule, value, callback) => {
  if (value !== form.password) callback(new Error('两次密码不一致'))
  else callback()
}

const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度6-32位', trigger: 'blur' },
  ],
  confirmPwd: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' },
  ],
  captchaCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

async function refreshCaptcha() {
  try {
    const res = await getCaptcha()
    captchaImage.value = res.data.image
    captchaKey.value = res.data.key
  } catch { /* ignore */ }
}

async function handleRegister() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const res = await register({
      phone: form.phone,
      password: md5(form.password),
      captchaKey: captchaKey.value,
      captchaCode: form.captchaCode,
    })
    setToken(res.data.token)
    localStorage.setItem('userId', res.data.id)
    localStorage.setItem('userName', res.data.name || '')
    router.push('/')
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

onMounted(() => refreshCaptcha())
</script>

<style scoped lang="scss">
.login-page {
  height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(160deg, #{$bg-page} 0%, #{$--el-color-primary-light-9} 100%);
}

.login-card {
  width: 400px; padding: 36px 32px 32px;
  background: $bg-card; border-radius: $radius; box-shadow: $shadow-card; text-align: center;
  @media (max-width: 440px) { width: calc(100% - 32px); padding: 28px 20px 24px; }

  .logo-text {
    font-size: 28px; color: $--el-color-primary; letter-spacing: 4px; margin-bottom: 4px;
    font-family: 'DM Serif Display', serif;
  }
  .sub { font-size: 14px; color: $text-secondary; margin-bottom: 20px; }
  :deep(.el-form-item) { margin-bottom: 14px; }
  :deep(.el-form-item__label) { padding-bottom: 2px; }
  .login-btn { width: 100%; height: 44px; font-size: 15px; letter-spacing: 6px; font-weight: 600; margin-top: 4px; }
  .extra { margin-top: 12px; }
  .link { font-size: 13px; color: $--el-color-primary; cursor: pointer; &:hover { text-decoration: underline; } }
}

.captcha-row {
  display: flex; align-items: center; gap: 12px;
  .captcha-img { height: 40px; width: 120px; border-radius: 4px; cursor: pointer; border: 1px solid $border-color; }
}
</style>
