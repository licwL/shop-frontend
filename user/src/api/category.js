import request from '@/api/request'

/** 查询所有启用的分类 */
export function getCategoryList() {
  return request.get('/user/category/list')
}
