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
    component: () => import('@/layout/UserLayout.vue'),
    redirect: '/home',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: '首页', requiresAuth: true },
      },
      {
        path: 'product/:id',
        name: 'ProductDetail',
        component: () => import('@/views/ProductDetailView.vue'),
        meta: { title: '商品详情', requiresAuth: true },
      },
      {
        path: 'cart',
        name: 'Cart',
        component: () => import('@/views/CartView.vue'),
        meta: { title: '购物车', requiresAuth: true },
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/OrderListView.vue'),
        meta: { title: '我的订单', requiresAuth: true },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { title: '我的', requiresAuth: true },
      },
      {
        path: 'address',
        name: 'Address',
        component: () => import('@/views/address/AddressView.vue'),
        meta: { title: '收货地址', requiresAuth: true },
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
    document.title = (to.meta.title || '商城') + ' - 电商平台'
    next()
  }
})

export default router
