import { ref, reactive } from 'vue'

/**
 * 分页列表通用逻辑 — 封装 loading / list / total / pagination + fetch / search
 *
 * @param {Function} fetchPage  签名: (page, pageSize) => Promise<{ data: { records, total } }>
 *                               调用方用闭包捕获自己的搜索条件
 *
 * 用法:
 *   const { list, total, loading, pagination, fetchList, search } = usePaginationList(
 *     (page, pageSize) => getEmployeePage({ page, pageSize, name: searchName.value || undefined })
 *   )
 */
export function usePaginationList(fetchPage) {
  const list = ref([])
  const total = ref(0)
  const loading = ref(false)
  const pagination = reactive({ page: 1, pageSize: 10 })

  async function fetchList() {
    loading.value = true
    try {
      const res = await fetchPage(pagination.page, pagination.pageSize)
      list.value = res.data.records ?? []
      total.value = res.data.total ?? 0
    } catch {
      // 错误已由拦截器处理
    } finally {
      loading.value = false
    }
  }

  /** 重置页码并重新请求 */
  function search() {
    pagination.page = 1
    fetchList()
  }

  return { list, total, loading, pagination, fetchList, search }
}
