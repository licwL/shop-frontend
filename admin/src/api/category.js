import request from '@/api/request'

/** 分页查询分类 */
export function getCategoryPage(params) {
  return request.get('/admin/category/page', { params })
}

/** 查询所有分类（不分页） */
export function getCategoryList() {
  return request.get('/admin/category/list')
}

/** 新增分类 */
export function addCategory(data) {
  return request.post('/admin/category', data)
}

/** 编辑分类 */
export function updateCategory(data) {
  return request.put('/admin/category', data)
}

/** 删除分类 */
export function deleteCategory(id) {
  return request.delete(`/admin/category?id=${id}`)
}

/** 启/禁用分类 status: 1启用 0禁用 */
export function setCategoryStatus(status, id) {
  return request.post(`/admin/category/status/${status}?id=${id}`)
}
