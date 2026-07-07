/**
 * 本地 axios 实例 — baseURL 为空，通过 Vite proxy 转发到后端。
 * 拦截器逻辑与 shared/request.js 保持一致。
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'

const instance = axios.create({
  baseURL: '',
  timeout: 10000,
  // 数组参数序列化为 ids=1&ids=2 (Spring 标准)，而非 ids[]=1&ids[]=2
  paramsSerializer: (params) => {
    const parts = []
    for (const key of Object.keys(params)) {
      const val = params[key]
      if (val === undefined || val === null) continue
      if (Array.isArray(val)) {
        val.forEach(v => parts.push(`${key}=${encodeURIComponent(v)}`))
      } else {
        parts.push(`${key}=${encodeURIComponent(val)}`)
      }
    }
    return parts.join('&')
  },
})

// 请求拦截 — 自动带 token + /api 前缀（区分 SPA 路由和 API 请求）
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.token = token
  }
  // /admin/... → /api/admin/... (Nginx 剥离 /api 后代理到后端)
  config.url = '/api' + config.url
  return config
})

// 响应拦截 — 统一错误处理
instance.interceptors.response.use(
  (res) => {
    const data = res.data
    if (data.code === 0) {
      ElMessage.error(data.msg || '请求失败')
      return Promise.reject(new Error(data.msg))
    }
    return data
  },
  (err) => {
    if (err.response?.status === 401) {
      clearToken()
      localStorage.removeItem('userId')
      localStorage.removeItem('userName')
      window.location.href = '/admin/login'
    }
    ElMessage.error('网络错误')
    return Promise.reject(err)
  },
)

export default instance

// 从 shared 透传 token 工具函数
export { setToken, getToken, clearToken } from '@shared/request'
