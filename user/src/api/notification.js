import request from '@/api/request'

/** 我的通知列表 */
export function getNotifications() {
  return request.get('/user/notification/list')
}

/** 未读数量 */
export function getUnreadCount() {
  return request.get('/user/notification/unread')
}

/** 标记已读 */
export function markRead(id) {
  return request.put(`/user/notification/read/${id}`)
}
