import request from '@/api/request'

/** 手机号登录（新用户自动注册） */
export function loginByPhone(phone) {
  return request.post('/user/user/login', { phone })
}

/** 获取个人信息 */
export function getUserInfo() {
  return request.get('/user/user/info')
}

/** 修改个人信息 */
export function updateUserInfo(data) {
  return request.put('/user/user/info', data)
}
