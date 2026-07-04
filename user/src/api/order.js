import request from '@/api/request'

/** 提交订单 */
export function submitOrder(data) {
  return request.post('/user/order/submit', data)
}

/** 历史订单 */
export function getOrderPage(params) {
  return request.get('/user/order/page', { params })
}

/** 订单详情 */
export function getOrderDetail(id) {
  return request.get(`/user/order/details/${id}`)
}

/** 取消订单 */
export function cancelOrder(id, reason) {
  return request.put(`/user/order/cancel/${id}?reason=${encodeURIComponent(reason || '')}`)
}

/** 支付订单 */
export function payOrder(id) {
  return request.put(`/user/order/pay/${id}`)
}
