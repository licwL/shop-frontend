import request from '@/api/request'

/** 收藏商品 */
export function addFavorite(productId) {
  return request.post(`/user/favorite/${productId}`)
}

/** 取消收藏 */
export function removeFavorite(productId) {
  return request.delete(`/user/favorite/${productId}`)
}

/** 收藏列表 */
export function getFavoriteList() {
  return request.get('/user/favorite/list')
}
