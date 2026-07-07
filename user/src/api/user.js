import request from '@/api/request'

/** 密码登录 */
export function login(data) {
  return request.post('/user/user/login', data)
}

/** 注册 */
export function register(data) {
  return request.post('/user/user/register', data)
}

/** 获取验证码 */
export function getCaptcha() {
  return request.get('/user/captcha')
}

/** 获取个人信息 */
export function getUserInfo() {
  return request.get('/user/user/info')
}

/** 修改个人信息 */
export function updateUserInfo(data) {
  return request.put('/user/user/info', data)
}

/** 上传头像 */
export function uploadAvatar(file) {
  const fd = new FormData()
  fd.append('file', file)
  return request.post('/user/common/upload', fd)
}
