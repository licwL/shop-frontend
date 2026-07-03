import request from '@/api/request'

// token 工具仍从 shared 导入
export { setToken, getToken, clearToken } from '@/api/request'

/** 登录 */
export function login(data) {
  return request.post('/admin/employee/login', data)
}

/** 退出 */
export function logout() {
  return request.post('/admin/employee/logout')
}

/** 分页查询员工 */
export function getEmployeePage(params) {
  return request.get('/admin/employee/page', { params })
}

/** 新增员工 */
export function addEmployee(data) {
  return request.post('/admin/employee', data)
}

/** 按 ID 查询员工（预留） */
export function getEmployeeById(id) {
  return request.get(`/admin/employee/${id}`)
}

/** 编辑员工 */
export function updateEmployee(data) {
  return request.put('/admin/employee', data)
}

/** 启/禁用员工 status: 1启用 0禁用 */
export function setEmployeeStatus(status, id) {
  return request.post(`/admin/employee/status/${status}?id=${id}`)
}
