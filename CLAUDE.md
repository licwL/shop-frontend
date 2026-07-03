# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **如果缺少图片或者需要我进行操作，请跟我明说，不要瞎猜。**

---

## 仓库信息

| 项 | 值 |
|------|------|
| 路径 | `f:/Commercial/shop-frontend` |
| 默认分支 | `master` |
| 远端 | `origin https://github.com/licwL/shop-frontend.git` |
| 目录 | `admin/` 管理端、`user/` 用户端、`shared/` 公共代码 |

### Git 规范

**分支策略**：在新分支上开发，完成后合回 `master`。

```bash
# 开始新功能
git checkout master && git pull origin master
git checkout -b feat/xxx    # 功能分支

# 开发完成后
git add -A
git commit -m "feat(admin): xxx"
git push origin feat/xxx
# 到 GitHub 创建 PR 合入 master，或本地 merge
```

**Commit 格式**（Conventional Commits）：

```
<type>(<scope>): <描述>

type:    feat | fix | refactor | style | docs | chore
scope:   admin | user | shared（可选）
```

示例：
```
feat(admin): 新增员工管理页面
fix(shared): 修复 axios 401 拦截跳转路径
refactor(admin): 抽取分页组件到 shared
chore: 更新依赖版本
```

**禁止操作**：
- 禁止 `--force` 推送到 `master`
- 禁止直接在 `master` 上开发（应切分支）
- 禁止提交 `node_modules/`、`dist/`、`.env.local` 等（已在 `.gitignore`）

**日常命令**：
```bash
git push origin master           # 推送
git status                       # 查看状态
git diff                         # 查看改动
```

---

## 技术栈

Vue 3 (Composition API + `<script setup>`) + Vite + Element Plus + Axios + Vue Router

不引入 TypeScript、不引入 Pinia/Vuex（登录态存 localStorage，页面状态用组件局部 ref/reactive）。

---

## 目录结构

```
├── admin/       管理端（后台管理系统）
├── user/        用户端（购物商城）
└── shared/      公共代码（axios封装、主题色、工具函数、组件）
    ├── request.js           Axios 封装
    ├── utils.js             工具函数
    ├── styles/
    │   └── variables.scss   主题色 + Element Plus 变量覆盖 + 布局变量
    └── components/
        └── Pagination.vue   通用分页组件（v-model:page / v-model:pageSize）
```

`shared/` 下的代码通过 Vite alias (`@shared`) 引入，打包时编译进各自 dist，无需单独部署。

---

## 启动命令

```bash
# 管理端
cd admin && npm install && npm run dev

# 用户端
cd user && npm install && npm run dev
```

---

## 后端 API

- 开发环境：`http://localhost:8080`
- 接口文档：`http://localhost:8080/doc.html`（Knife4j / Swagger）
- API 文档源文件：`f:\Commercial\sky-take-out\docs\API接口文档-管理端.md`

### 统一响应格式

```json
// 成功
{ "code": 1, "msg": null, "data": { ... } }

// 失败
{ "code": 0, "msg": "错误描述", "data": null }

// 分页
{ "code": 1, "msg": null, "data": { "total": 100, "records": [...] } }
```

- `code: 1` = 成功，`code: 0` = 失败
- 分页参数：`page`（1-based）、`pageSize`
- 认证方式：JWT，请求头 `token` 字段
- 密码需 MD5 加密后发送

---

## 共享模块

### `shared/request.js` — Axios 封装

导出 `createRequest`, `setToken`, `getToken`, `clearToken`。

```js
import { createRequest } from '@shared/request'
const request = createRequest()
// baseURL: http://localhost:8080, timeout: 10s
// 请求拦截器: localStorage.token → config.headers.token
// 响应拦截器: data.code === 0 → ElMessage.error + reject
//             HTTP 401 → 清 token → window.location.href = '/login'
//             成功 → return data (完整响应体，调用方取 .data 得业务数据)
```

### `shared/utils.js` — 工具函数

```js
import { ORDER_STATUS, orderStatusText } from '@shared/utils'
// ORDER_STATUS: { 1:'待付款', 2:'已付款', 3:'已发货', 4:'已完成', 5:'已取消' }
// orderStatusText(status): 返回中文状态文本
```

后续通用的映射函数、格式化函数统一加到这里。

### `shared/components/Pagination.vue` — 通用分页

封装 `el-pagination`，统一管理端和用户端的分页行为，避免重复配置。

**Props：**
- `page` (Number, v-model) — 当前页码
- `pageSize` (Number, v-model) — 每页条数
- `total` (Number) — 总记录数

**Emits：**
- `change()` — 页码或每页条数变化时触发，父组件监听后重新请求数据

**使用方式：**
```vue
<script setup>
import { ref } from 'vue'
import Pagination from '@shared/components/Pagination.vue'

const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

function fetchList() { /* 请求数据 */ }
</script>

<template>
  <el-table :data="list" />
  <Pagination v-model:page="page" v-model:pageSize="pageSize" :total="total" @change="fetchList" />
</template>
```

> 后续管理端和用户端所有分页列表统一用这个组件，不要直接写 `el-pagination`。

**抽取原则**：管理端和用户端之间存在复杂但重复的组件，或者需要统一维护的 UI 模式，都应抽到 `shared/components/` 下复用。目前确定的有分页组件，后续发现新的可复用模式持续补充。

### `shared/styles/variables.scss` — 主题 & 布局变量

**设计系统：奶油杏暖调 (Cream Apricot Warm)**

```scss
// Element Plus 主题覆盖
$--el-color-primary: #D4845A;          // 主色
$--el-color-primary-light-3: #DEA07E;
$--el-color-primary-light-5: #E7B99F;
$--el-color-primary-light-7: #F0D3C1;
$--el-color-primary-light-8: #F5E2D5;
$--el-color-primary-light-9: #FAF0EA;
$--el-color-primary-dark-2: #B56E45;

// 页面用色
$bg-page: #FFF8F3;                     // 页面底色（暖白）
$bg-card: #FFFFFF;                     // 卡片白
$bg-sidebar: #2C241E;                  // 侧边栏深色
$text-primary: #3A3028;                // 主文字
$text-secondary: #8B7D72;              // 次要文字
$border-color: #F0E4DA;                // 边框暖调

// 布局尺寸
$sidebar-width: 220px;
$header-height: 56px;
$radius: 8px;
```

所有组件的颜色和尺寸都应引用这些变量，而不是硬编码。

---

## 管理端架构（admin/）

### 当前状态

`admin/` 目录为空，需从零搭建。

### 目标目录结构

```
admin/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.js                    # 入口：Element Plus(中文) + router + 全局样式
    ├── App.vue                    # <router-view />
    ├── styles/
    │   └── global.scss            # 全局样式，@import '@shared/styles/variables.scss'
    ├── router/
    │   └── index.js               # 路由表 + beforeEach 守卫
    ├── api/
    │   └── employee.js            # 员工 API（thin wrapper）
    ├── layout/
    │   └── AdminLayout.vue        # 侧边栏 + 顶栏 + <router-view />
    ├── views/
    │   ├── LoginView.vue          # 登录页（独立，无布局外壳）
    │   └── employee/
    │       └── EmployeeView.vue   # 员工管理页
    └── components/
        └── employee/
            └── EmployeeDialog.vue # 新增/编辑弹窗
```

### 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 主题色 | 引用 `@shared/styles/variables.scss` | 统一设计系统，已在 shared 定义 |
| 状态管理 | 不用 Pinia/Vuex | 登录态存 localStorage；列表状态局部管理 |
| 密码加密 | `js-md5`（ESM） | API 要求 MD5 |
| 路由模式 | `createWebHashHistory` | 无需服务端 SPA fallback |
| CORS | 假设后端已开启 | `shared/request.js` baseURL 直连 `localhost:8080` |

### package.json 依赖

```json
{
  "dependencies": {
    "vue": "^3.4",
    "vue-router": "^4.3",
    "element-plus": "^2.7",
    "@element-plus/icons-vue": "^2.3",
    "axios": "^1.7",
    "js-md5": "^0.8",
    "sass": "^1.77"
  },
  "devDependencies": {
    "vite": "^5.4",
    "@vitejs/plugin-vue": "^5.1"
  }
}
```

> `axios` 和 `sass` 必须列在 admin dependencies 中：axios 被 shared/request.js import；sass 用于编译 SCSS。

### vite.config.js

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, '../shared'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 全局注入 variables，每个 .vue 文件可直接使用 $bg-page 等变量
        additionalData: `@use "@shared/styles/variables.scss" as *;`,
      },
    },
  },
  server: {
    port: 3000,
  },
})
```

### 路由设计

```
/login           → LoginView（无需登录，meta: { title: '登录' }）
/                → AdminLayout（需登录，meta: { requiresAuth: true }，redirect → /employee）
  /employee      → EmployeeView（meta: { title: '员工管理', requiresAuth: true }）
```

`router.beforeEach` 守卫：
1. `to.meta.requiresAuth && !getToken()` → `next('/login?redirect=' + to.fullPath)`
2. `to.path === '/login' && getToken()` → `next('/')`
3. 通过 → `document.title = to.meta.title || '管理后台'` → `next()`

### 组件树 & 数据流

```
App.vue
├── LoginView
│   └── el-form → md5(password) → login() API → setToken() → router.push('/')
└── AdminLayout
    ├── el-aside: 项目标题 + el-menu (router, bg: $bg-sidebar)
    ├── el-header: 用户名 + 退出按钮 (height: $header-height)
    └── el-main (bg: $bg-page)
        └── EmployeeView
            ├── el-card (bg: $bg-card): 搜索栏 + 新增按钮
            ├── el-table (v-loading): 员工列表
            ├── Pagination (@shared/components/Pagination.vue)
            └── EmployeeDialog (el-dialog + el-form)
```

### API 层 (`api/employee.js`)

```js
import { createRequest } from '@shared/request'
const request = createRequest()

login(data)              // POST /admin/employee/login       body: {username, password(MD5)}
logout()                 // POST /admin/employee/logout
getEmployeePage(params)  // GET  /admin/employee/page         params: {page, pageSize, name?}
addEmployee(data)        // POST /admin/employee              body: {username, name, phone, sex, idNumber}
getEmployeeById(id)      // GET  /admin/employee/{id}         （预留）
updateEmployee(data)     // PUT  /admin/employee              body: {id, name, phone, sex, idNumber}
setEmployeeStatus(status, id) // POST /admin/employee/status/{status}?id={id}
```

### 关键组件说明

**LoginView.vue** — 居中卡片布局，logo 图片（如有），`el-form` + username + password(show-password)。提交时 `md5(password)` → `login()` → `setToken(res.data.token)` → `localStorage.setItem('userId', res.data.id)` → `localStorage.setItem('userName', res.data.name)` → `router.push(route.query.redirect || '/')`。

**AdminLayout.vue** — 侧边栏 `bg: $bg-sidebar`、`width: $sidebar-width`；顶栏 `height: $header-height`；退出按钮调 `logout()` → `clearToken()` + `localStorage.clear()` → `router.push('/login')`。

**EmployeeView.vue** — 调 `useEmployee()` composable，组合搜索/表格/分页/弹窗。

**EmployeeDialog.vue** — 纯展示组件，props: `visible` + `editingRow`，emits: `confirm` + `cancel`。字段: username(编辑时disabled)、name、phone、sex(radio，男"1"女"0")、idNumber。

---

## 员工管理 API 速查

| 接口 | 方法 | 说明 |
|------|------|------|
| `/admin/employee/login` | POST | 登录，body: `{username, password(MD5)}`，返回 `{id, userName, name, token}` |
| `/admin/employee/logout` | POST | 退出 |
| `/admin/employee/page` | GET | 分页 `?page=&pageSize=&name=`，返回 `{total, records}` |
| `/admin/employee` | POST | 新增，body: `{username, name, phone, sex, idNumber}`（不含 id） |
| `/admin/employee/{id}` | GET | 按 ID 查询 |
| `/admin/employee` | PUT | 编辑，body: `{id, name, phone, sex, idNumber}`（含 id） |
| `/admin/employee/status/{status}?id=` | POST | 启/禁用，status: 1启用 0禁用 |

字段：`id, username, name, phone, sex("1"男"0"女), idNumber, status(1启用0禁用), createTime, updateTime`

---

## 实现顺序

1. **项目骨架**：`package.json` → `npm install` → `vite.config.js` → `index.html`
2. **入口 + 全局样式**：`main.js`（含 Element Plus 中文 locale）→ `styles/global.scss` → `App.vue`
3. **路由**：`router/index.js`（含导航守卫）
4. **API 层**：`api/employee.js`
5. **共享分页组件**：`shared/components/Pagination.vue`
6. **布局外壳**：`layout/AdminLayout.vue`（引用 SCSS 变量）
7. **登录页**：`views/LoginView.vue`（需准备 logo 图片，如无请跟我说）
8. **员工弹窗**：`components/employee/EmployeeDialog.vue`
9. **员工管理页**：`views/employee/EmployeeView.vue`（内联或抽 composable）
10. **验证**：登录 → 列表 → 搜索 → 新增 → 编辑 → 启禁用 → 退出

---

## 注意事项

- `shared/request.js` **不可修改**，管理端和用户端共用
- 所有颜色/尺寸引用 `@shared/styles/variables.scss` 变量，不硬编码
- `vite.config.js` 通过 `css.preprocessorOptions.scss.additionalData` 全局注入 variables
- 表格 `el-switch` 用 `:model-value` 单向绑定 + `@change` 调 API，避免失败后状态不一致
- 时间字段用 `new Date(val).toLocaleString('zh-CN')` 格式化
- 菜单扩展：加 `el-menu-item` + 对应路由即可
