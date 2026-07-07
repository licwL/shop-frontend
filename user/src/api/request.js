import axios from 'axios'
import { ElMessage } from 'element-plus'

const instance = axios.create({
  baseURL: '',
  timeout: 10000,
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.token = token
  return config
})

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
      window.location.href = '/login'
    }
    ElMessage.error('网络错误')
    return Promise.reject(err)
  },
)

export default instance
export { setToken, getToken, clearToken } from '@shared/request'
