/**
 * Axios 封装 — 管理端和用户端共用
 *
 * 使用方式:
 *   import { createRequest, setToken, clearToken } from '@shared/request'
 *   const request = createRequest()
 *   request.get('/admin/employee/page', { params: { page: 1, pageSize: 10 } })
 */

import axios from 'axios'
import { ElMessage } from 'element-plus'

const BASE_URL = 'http://localhost:8080'

export function createRequest() {
  const instance = axios.create({
    baseURL: BASE_URL,
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

  return instance
}

export function setToken(token) {
  localStorage.setItem('token', token)
}

export function getToken() {
  return localStorage.getItem('token')
}

export function clearToken() {
  localStorage.removeItem('token')
}
