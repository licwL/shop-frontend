import request from '@/api/request'

/** 通知列表（仅已发布） */
export function getNoticePage(params) {
  return request.get('/user/notice/page', { params })
}

/** 通知详情 */
export function getNoticeDetail(id) {
  return request.get(`/user/notice/${id}`)
}
