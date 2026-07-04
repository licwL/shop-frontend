import request from '@/api/request'

/** 商品分页列表 */
export function getProductPage(params) {
  return request.get('/user/product/page', { params })
}

/** 商品详情 */
export function getProductDetail(id) {
  return request.get(`/user/product/${id}`)
}
