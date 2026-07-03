import request from '@/api/request'

/** 营业额统计 */
export function getTurnover(params) {
  return request.get('/admin/report/turnover', { params })
}

/** 订单统计 */
export function getOrderReport(params) {
  return request.get('/admin/report/order', { params })
}

/** 销量 Top10 */
export function getTop10(params) {
  return request.get('/admin/report/top10', { params })
}

/** 用户统计 */
export function getUserReport(params) {
  return request.get('/admin/report/user', { params })
}

/** 今日概览 */
export function getBusiness() {
  return request.get('/admin/report/business')
}

/** 导出订单 Excel */
export function exportOrders() {
  return request.get('/admin/export/orders', { responseType: 'blob' })
}

/** 导出商品 Excel */
export function exportProducts() {
  return request.get('/admin/export/products', { responseType: 'blob' })
}
