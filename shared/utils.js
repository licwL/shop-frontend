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
