import request from '@/api/request'

/** 分页查询商品 */
export function getProductPage(params) {
  return request.get('/admin/product/page', { params })
}

/** 按 ID 查询商品 */
export function getProductById(id) {
  return request.get(`/admin/product/${id}`)
}

/** 新增商品 */
export function addProduct(data) {
  return request.post('/admin/product', data)
}

/** 编辑商品 */
export function updateProduct(data) {
  return request.put('/admin/product', data)
}

/** 批量删除商品 ids: 数组 */
export function deleteProducts(ids) {
  return request.delete('/admin/product', { params: { ids } })
}

/** 上传图片 */
export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  // 不手动设 Content-Type，让 axios 自动带 boundary
  return request.post('/admin/common/upload', formData)
}
