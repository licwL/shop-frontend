import request from '@/api/request'

/** 加入购物车 */
export function addToCart(data) {
  return request.post('/user/shoppingCart/add', data)
}

/** 查看购物车 */
export function getCartList() {
  return request.get('/user/shoppingCart/list')
}

/** 减少数量 */
export function subCart(data) {
  return request.post('/user/shoppingCart/sub', data)
}

/** 清空购物车 */
export function cleanCart() {
  return request.delete('/user/shoppingCart/clean')
}
