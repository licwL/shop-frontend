import request from '@/api/request'
import { ElMessage } from 'element-plus'

/** 导出订单 Excel（返回文件流），出错时自动提示并 throw */
export async function exportOrders() {
  return handleBlobResponse(await request.get('/admin/export/orders', { responseType: 'blob' }))
}

/** 导出商品 Excel（返回文件流），出错时自动提示并 throw */
export async function exportProducts() {
  return handleBlobResponse(await request.get('/admin/export/products', { responseType: 'blob' }))
}

/** Blob 响应可能有 JSON 错误体，统一检测 */
async function handleBlobResponse(blob) {
  if (blob instanceof Blob && blob.type.includes('json')) {
    try {
      const text = await blob.text()
      const json = JSON.parse(text)
      if (json.code === 0) {
        ElMessage.error(json.msg || '导出失败')
        throw new Error(json.msg)
      }
    } catch (e) {
      if (e.message && e.message !== '导出失败') return blob
      throw e
    }
  }
  return blob
}
