import request from '@/api/request'

/** 分页查询订单 */
export function getOrderPage(params) {
  return request.get('/admin/order/page', { params })
}

/** 订单详情 */
export function getOrderDetail(id) {
  return request.get(`/admin/order/details/${id}`)
}

/** 修改订单状态 status: 3=已发货 4=已完成 */
export function setOrderStatus(status, id) {
  return request.put(`/admin/order/status/${status}?id=${id}`)
}
