import request from '@/api/request'

// ===== 公告 =====

/** 分页查询公告 */
export function getNoticePage(params) {
  return request.get('/admin/notice/page', { params })
}

/** 按 ID 查询公告 */
export function getNoticeById(id) {
  return request.get(`/admin/notice/${id}`)
}

/** 新增公告 */
export function addNotice(data) {
  return request.post('/admin/notice', data)
}

/** 编辑公告 */
export function updateNotice(data) {
  return request.put('/admin/notice', data)
}

/** 批量删除公告 */
export function deleteNotices(ids) {
  return request.delete('/admin/notice', { params: { ids } })
}

/** 发布/撤回 status: 1发布 0草稿 */
export function setNoticeStatus(status, id) {
  return request.put(`/admin/notice/status/${status}?id=${id}`)
}

// ===== 公告类型 =====

/** 所有公告类型 */
export function getNoticeTypeList() {
  return request.get('/admin/notetype/list')
}

/** 新增类型 */
export function addNoticeType(data) {
  return request.post('/admin/notetype', data)
}

/** 编辑类型 */
export function updateNoticeType(data) {
  return request.put('/admin/notetype', data)
}

/** 删除类型 */
export function deleteNoticeType(id) {
  return request.delete(`/admin/notetype/${id}`)
}
