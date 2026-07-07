// 公共工具函数

// 订单状态映射
export const ORDER_STATUS = {
  1: '待付款',
  2: '已付款',
  3: '已发货',
  4: '已完成',
  5: '已取消',
}

export function orderStatusText(status) {
  return ORDER_STATUS[status] || '未知'
}

/** 订单状态 → el-tag type */
export function orderStatusType(status) {
  if (status === 1) return 'warning'
  if (status === 2) return 'primary'
  if (status === 3) return 'success'
  if (status === 4) return 'info'
  if (status === 5) return 'danger'
  return 'info'
}

/** 格式化时间 */
export function formatTime(val) {
  if (!val) return '-'
  return new Date(val).toLocaleString('zh-CN')
}
