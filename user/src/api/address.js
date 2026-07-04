import request from '@/api/request'

/** 地址列表 */
export function getAddressList() {
  return request.get('/user/addressBook/list')
}

/** 地址详情 */
export function getAddressById(id) {
  return request.get(`/user/addressBook/${id}`)
}

/** 新增地址 */
export function addAddress(data) {
  return request.post('/user/addressBook', data)
}

/** 修改地址 */
export function updateAddress(data) {
  return request.put('/user/addressBook', data)
}

/** 删除地址 */
export function deleteAddress(id) {
  return request.delete(`/user/addressBook/${id}`)
}

/** 设为默认 */
export function setDefaultAddress(id) {
  return request.put(`/user/addressBook/default/${id}`)
}
