/**
 * 本地 axios 实例 — baseURL 为空，通过 Vite proxy 转发到后端。
 * 拦截器逻辑与 shared/request.js 保持一致。
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'

const instance = axios.create({
  baseURL: '',
  timeout: 10000,
})

// 请求拦截 — 自动带 token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.token = token
  }
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
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    ElMessage.error('网络错误')
    return Promise.reject(err)
  },
)

export default instance

// 从 shared 透传 token 工具函数
export { setToken, getToken, clearToken } from '@shared/request'
