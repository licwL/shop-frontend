# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **如果缺少图片或者需要我进行操作，请跟我明说，不要瞎猜。**

---

## 仓库信息

| 场景 | 命令 |
|------|------|
| 路径 | `f:/Commercial/shop-frontend` |
| 默认分支 | `master` |
| 推送 | `git push origin master` |
| 目录 | `admin/` 管理端、`user/` 用户端、`shared/` 公共代码 |

---

## 技术栈

Vue 3 (Composition API + `<script setup>`) + Vite + Element Plus + Axios + Vue Router

不引入 TypeScript、不引入 Pinia/Vuex（登录态存 localStorage，页面状态用组件局部 ref/reactive 即可）。

---

## 目录结构

```
├── admin/       管理端（后台管理系统）
├── user/        用户端（购物商城）
└── shared/      公共代码（axios封装、工具函数、组件）
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

// 分页成功
{ "code": 1, "msg": null, "data": { "total": 100, "records": [...] } }
```

- `code: 1` = 成功，`code: 0` = 失败
- 分页参数：`page`（1-based）、`pageSize`
- 认证方式：JWT，请求头 `token` 字段（`POST /admin/employee/login` 获取）
- 密码需 MD5 加密后发送

---

## 共享模块

### `shared/request.js` — Axios 封装

源码：`f:\Commercial\shop-frontend\shared\request.js`

```js
// 导出: createRequest, setToken, getToken, clearToken
// createRequest() 每次调用创建新的 axios 实例
//   - baseURL: 'http://localhost:8080', timeout: 10s
//   - 请求拦截器: 从 localStorage.token 读 token → config.headers.token
//   - 响应拦截器: data.code === 0 → ElMessage.error + reject
//                 HTTP 401 → 清 token → window.location.href = '/login'
//                 成功 → return data（即整个响应体 {code, msg, data}）
```

**关键约定：**
- `createRequest()` 返回的实例，成功时 `return data`（完整响应体），调用方取 `.data` 拿业务数据
- 401 时用 `window.location.href` 硬跳转（因为 `shared/` 不依赖 vue-router）
- `setToken(token)` 写入 `localStorage.token`，`getToken()` 读取，`clearToken()` 清除

使用方式：
```js
import { createRequest, setToken, getToken, clearToken } from '@shared/request'
const request = createRequest()
const res = await request.get('/admin/employee/page', { params: { page: 1, pageSize: 10 } })
// res.data.records, res.data.total
```

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
    ├── main.js                    # 入口：注册 Element Plus(中文)、router、挂载
    ├── App.vue                    # <router-view />
    ├── router/
    │   └── index.js               # 路由表 + beforeEach 导航守卫
    ├── api/
    │   └── employee.js            # 员工 API（thin wrapper，模块作用域单例）
    ├── composables/
    │   └── useEmployee.js         # 员工列表状态 + CRUD 编排
    ├── layout/
    │   └── AdminLayout.vue        # 侧边栏 + 顶栏 + <router-view />
    ├── views/
    │   ├── LoginView.vue          # 登录页（独立页面，无布局外壳）
    │   └── employee/
    │       └── EmployeeView.vue   # 员工管理页
    └── components/
        └── employee/
            └── EmployeeDialog.vue # 新增/编辑弹窗（纯展示组件）
```

### 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 状态管理 | 不用 Pinia/Vuex | 登录态存 localStorage；列表状态用 composable 局部管理 |
| 密码加密 | `js-md5` | ESM 原生支持，比 CJS 的 `md5` 包兼容性好 |
| 路由模式 | `createWebHashHistory` | 无需服务端配置 SPA fallback，部署更简单 |
| CORS | 假设后端已开启 CORS | `shared/request.js` 硬编码 `localhost:8080`，不动它 |
| Element Plus 图标 | `@element-plus/icons-vue` | 侧边栏菜单等需要图标，独立包需单独安装 |
| Element Plus 语言 | 中文 locale | 管理端面向中文用户 |

如果后端未开 CORS，需在 `vite.config.js` 加 proxy：
```js
server: {
  port: 3000,
  proxy: { '/admin': { target: 'http://localhost:8080', changeOrigin: true } }
}
```
此时需在 `api/employee.js` 中自行创建 axios 实例（`baseURL: ''`），不复用 `createRequest()`。

### package.json 依赖清单

```json
{
  "dependencies": {
    "vue": "^3.4",
    "vue-router": "^4.3",
    "element-plus": "^2.7",
    "@element-plus/icons-vue": "^2.3",
    "axios": "^1.7",
    "js-md5": "^0.8"
  },
  "devDependencies": {
    "vite": "^5.4",
    "@vitejs/plugin-vue": "^5.1"
  }
}
```

> `axios` 必须列在 admin 的 dependencies 中，因为 `shared/request.js` import 了 axios，运行时从 admin 的 node_modules 解析。

### 路由设计

```
/login           → LoginView（无需登录）
/                → AdminLayout（需登录，redirect → /employee）
  /employee      → EmployeeView
```

`router.beforeEach` 守卫：
1. `to.meta.requiresAuth && !getToken()` → `next('/login?redirect=' + to.fullPath)`
2. `to.path === '/login' && getToken()` → `next('/')`
3. 通过 → `document.title = to.meta.title || '管理后台'` → `next()`

### 组件树与数据流

```
App.vue
├── LoginView
│   └── el-form → md5(password) → login() → setToken() → router.push('/')
└── AdminLayout
    ├── el-aside: el-menu (router 模式)
    ├── el-header: 用户名 + 退出按钮
    └── el-main: <router-view>
        └── EmployeeView
            ├── 搜索栏: el-input(v-model searchName) + el-button(查询/新增)
            ├── el-table (v-loading)
            │   └── 列: 序号/用户名/姓名/手机/性别/身份证号/状态(el-switch)/创建时间/操作
            ├── el-pagination
            └── EmployeeDialog (el-dialog + el-form)
```

数据流：
```
EmployeeView → 调 composable 方法
  → useEmployee.js（持有响应式状态，编排 API 调用）
    → api/employee.js（thin wrapper）
      → shared/request.js（拦截器：加 token、统一错误处理）
        → 后端 http://localhost:8080
```

### API 层 (`api/employee.js`)

```js
import { createRequest } from '@shared/request'
const request = createRequest()  // 模块作用域单例

// 所有函数返回 axios promise，调用方取 res.data 获取业务数据
login(data)              // POST /admin/employee/login      body: {username, password(MD5)}
logout()                 // POST /admin/employee/logout
getEmployeePage(params)  // GET  /admin/employee/page        params: {page, pageSize, name?}
addEmployee(data)        // POST /admin/employee             body: {username, name, phone, sex, idNumber}（不含id）
getEmployeeById(id)      // GET  /admin/employee/{id}        （预留，本期编辑用行数据回显，暂不调用）
updateEmployee(data)     // PUT  /admin/employee             body: {id, name, phone, sex, idNumber}
setEmployeeStatus(status, id)  // POST /admin/employee/status/{status}?id={id}   status: 1启用 0禁用
```

> **注意**：`login()` 响应 `res.data` = `{id, userName, name, token}`。登录成功后需同时存储 token 和用户信息。

### 核心 Composable (`useEmployee.js`)

导出 `useEmployee()`，返回响应式状态和方法：

```js
// === 状态 ===
tableData: ref([])           // 当前页记录
total: ref(0)                // 总记录数
loading: ref(false)          // 表格加载态
searchName: ref('')          // 搜索关键词
pagination: reactive({ page: 1, pageSize: 10 })
dialogVisible: ref(false)
dialogTitle: ref('')         // "新增员工" | "编辑员工"
editingRow: ref(null)        // 编辑中的行数据（新增时为 null）

// === 方法 ===
fetchList()                  // getEmployeePage → 更新 tableData/total
handleSearch()               // page=1 → fetchList
handlePageChange(page)       // 更新 page → fetchList
handleSizeChange(size)       // 更新 pageSize, page=1 → fetchList
handleAdd()                  // editingRow=null → 打开弹窗
handleEdit(row)              // editingRow=深拷贝(row) → 打开弹窗
handleConfirm(formData)      // editingRow ? updateEmployee : addEmployee → fetchList → 关弹窗
handleCancel()               // 关弹窗
handleStatusChange(row)      // setEmployeeStatus(新status, row.id) → fetchList
```

### EmployeeDialog 组件

纯展示组件，不调 API：
- Props: `visible` (Boolean), `editingRow` (Object|null)
- Emits: `confirm(formData)`, `cancel()`
- 表单字段: username、name、phone、sex(radio: 男"1"/女"0")、idNumber
- 校验规则: username 必填 2-20位、name 必填、phone 必填 11位、idNumber 必填 18位、sex 必填
- 编辑模式: watch `visible` 为 true 时回显数据，username disabled；新增模式: 重置表单
- 提交时 `emit('confirm', { ...form, id: editingRow?.id })`

### LoginView

- 居中卡片布局，`el-form` + username + password（`show-password`）
- 提交: `const encrypted = md5(form.password)` → `const res = await login({ username: form.username, password: encrypted })` → `setToken(res.data.token)` → `localStorage.setItem('userId', res.data.id)` → `localStorage.setItem('userName', res.data.name)` → `ElMessage.success('登录成功')` → `router.push(route.query.redirect || '/')`
- 表单校验: 两个字段都必填
- **图片**：需要一张 logo 图片放在卡片顶部（如 `src/assets/logo.png`）

### AdminLayout

- `el-container` 全屏高度
- `el-aside`(width: 200px): 顶部 logo 区域 + `el-menu`(router 模式)
  - `el-menu-item index="/employee"` → 员工管理（图标: User）
- `el-header`: 右侧显示 `localStorage.userName` + 退出按钮
  - 退出: `await logout()`（容错，失败也继续）→ `clearToken()` + `localStorage.clear()` → `router.push('/login')`
- `el-main`: `<router-view />`

---

## 员工管理 API 速查

| 接口 | 方法 | 说明 |
|------|------|------|
| `/admin/employee/login` | POST | 登录，body: `{username, password}`（密码 MD5），返回 `{id, userName, name, token}` |
| `/admin/employee/logout` | POST | 退出 |
| `/admin/employee/page` | GET | 分页查询，参数 `page, pageSize, name`，返回 `{total, records}` |
| `/admin/employee` | POST | 新增，body: `{username, name, phone, sex, idNumber}`（**不含 id**） |
| `/admin/employee/{id}` | GET | 按 ID 查询 |
| `/admin/employee` | PUT | 编辑，body: `{id, name, phone, sex, idNumber}`（**含 id**） |
| `/admin/employee/status/{status}?id=` | POST | 启/禁用，status: 1启用 0禁用 |

员工字段：`id, username, name, phone, sex("1"男"0"女), idNumber, status(1启用0禁用), createTime, updateTime`

---

## 实现顺序

1. **项目初始化**：`package.json`、`vite.config.js`（alias: `@`→`./src`、`@shared`→`../shared`，server port 3000）、`index.html`
2. **入口 + 路由**：`main.js`（含 Element Plus 中文 locale）、`App.vue`、`router/index.js`（含导航守卫）
3. **API 层**：`api/employee.js`
4. **布局外壳**：`layout/AdminLayout.vue`
5. **登录页**：`views/LoginView.vue`（需要准备 logo 图片）
6. **员工弹窗组件**：`components/employee/EmployeeDialog.vue`
7. **员工 Composable**：`composables/useEmployee.js`
8. **员工管理页**：`views/employee/EmployeeView.vue`
9. **验证**：`npm install && npm run dev`，按顺序测：无 token 跳转登录 → 登录 → 列表加载 → 搜索 → 新增 → 编辑 → 启禁用 → 退出

---

## 注意事项

- `shared/request.js` 不可修改（管理端和用户端共用），通过 Vite alias 引用
- `axios` 必须作为 admin 的 dependency（被 shared/request.js import）
- 密码用 `import md5 from 'js-md5'`，不用 `md5` 包（CJS 兼容性差）
- 表格 `el-switch` 用 `:model-value="row.status === '1'"` 单向绑定 + `@change` 调 API，成功后重新 fetchList。避免 API 失败后开关状态不一致
- `el-switch` 的 active-value="1" inactive-value="0"（字符串，与后端一致）
- `dateTime` 列用 `new Date(val).toLocaleString('zh-CN')` 格式化
- 后续添加新菜单：在 `AdminLayout.vue` 的 `el-menu` 加一项 + `router/index.js` 加一条路由即可
