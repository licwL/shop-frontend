import { createRouter, createWebHashHistory } from 'vue-router'
import { getToken } from '@shared/request'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/layout/AdminLayout.vue'),
    redirect: '/employee',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'employee',
        name: 'Employee',
        component: () => import('@/views/employee/EmployeeView.vue'),
        meta: { title: '员工管理', requiresAuth: true },
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('@/views/category/CategoryView.vue'),
        meta: { title: '分类管理', requiresAuth: true },
      },
      {
        path: 'product',
        name: 'Product',
        component: () => import('@/views/product/ProductView.vue'),
        meta: { title: '商品管理', requiresAuth: true },
      },
      {
        path: 'order',
        name: 'Order',
        component: () => import('@/views/order/OrderView.vue'),
        meta: { title: '订单管理', requiresAuth: true },
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/user/UserView.vue'),
        meta: { title: '用户管理', requiresAuth: true },
      },
      {
        path: 'notice',
        name: 'Notice',
        component: () => import('@/views/notice/NoticeView.vue'),
        meta: { title: '公告管理', requiresAuth: true },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = getToken()

  if (to.meta.requiresAuth && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    document.title = (to.meta.title || '管理后台') + ' - 电商平台'
    next()
  }
})

export default router
