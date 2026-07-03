import request from '@/api/request'

/** 分页查询用户 */
export function getUserPage(params) {
  return request.get('/admin/user/page', { params })
}

/** 启/禁用用户 status: 1启用 0禁用 */
export function setUserStatus(status, id) {
  return request.post(`/admin/user/status/${status}?id=${id}`)
}
