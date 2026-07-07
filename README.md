# 🛒 电商平台前端

> B2C 电商平台的前端仓库，含管理端（后台系统）和用户端（购物商城）。覆盖美妆护肤、服饰鞋包、数码家电三大品类。

**线上地址**：[https://bithaze.online](https://bithaze.online)  
**管理端**：[https://bithaze.online/admin/](https://bithaze.online/admin/)（演示账号 `admin` / `123456`）

---

## 技术栈

| 层 | 选型 |
|----|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) |
| 构建 | Vite 5 |
| UI 库 | Element Plus (中文 locale) |
| 路由 | Vue Router 4 (History 模式) |
| HTTP | Axios + JWT 认证 |
| 密码 | js-md5 |
| CSS | SCSS + 全局设计变量 |
| 部署 | Docker + Nginx + Let's Encrypt |

## 目录结构

```
shop-frontend/
├── admin/               管理端（后台管理系统）
│   ├── src/
│   │   ├── api/          API 封装（employee/category/product/order/user/notice）
│   │   ├── components/   复用组件（EmployeeDialog）
│   │   ├── layout/       布局（侧边栏 + 顶栏）
│   │   ├── router/       路由 + 导航守卫
│   │   └── views/        页面（login + 6 个管理模块）
│   └── vite.config.js
├── user/                 用户端（购物商城）
│   ├── src/
│   │   ├── api/          API 封装（product/cart/order/address/favorite/notice）
│   │   ├── layout/       布局（顶导 + 响应式汉堡菜单）
│   │   ├── router/       路由 + 导航守卫
│   │   └── views/        页面（首页/详情/购物车/订单/收藏/通知/个人中心）
│   └── vite.config.js
├── shared/               公共代码
│   ├── request.js        Axios 封装（token 注入 + 统一错误处理 + 401 跳转）
│   ├── utils.js          工具函数（订单状态映射、时间格式化）
│   ├── composables/      Vue composable（usePaginationList）
│   ├── components/       公共组件（Pagination / EmptyState）
│   └── styles/           设计系统变量（主题色 / 语义色 / 断点 / 阴影）
├── nginx.conf            Nginx 配置（SPA 路由 + API 代理 + SSL + Gzip）
├── Dockerfile.frontend   前端 Nginx 镜像
├── docker-compose.yml    Docker 三容器编排（MySQL + Backend + Nginx）
├── .env.example          环境变量模板
└── docs/
    └── deploy-detail.md  部署全流程详解
```

## 快速开始

```bash
# 管理端 — 端口 3000
cd admin && npm install && npm run dev

# 用户端 — 端口 4000
cd user && npm install && npm run dev
```

> 开发环境通过 Vite proxy 转发 API 请求到本地 `localhost:8080`，无需额外配置。

## 功能模块

### 用户端

| 模块 | 功能 | 认证要求 |
|------|------|---------|
| 首页 | 商品分类 + 搜索 + 公告滚动 + 商品网格 | 游客可访问 |
| 商品详情 | 图片预览 / 加购 / 收藏 | 游客可浏览，加购需登录 |
| 购物车 | 增减数量 / 删除 / 结算 | 需登录 |
| 订单 | 下单（多地址选择）/ 支付 / 取消 / 状态追踪 | 需登录 |
| 注册/登录 | 手机号 + 密码 + 图形验证码注册，密码登录 | 无需登录 |
| 个人中心 | 头像上传 / 昵称性别修改 | 需登录 |
| 收藏 / 通知 / 收货地址 | CRUD | 需登录 |

### 管理端

| 模块 | 功能 |
|------|------|
| 员工管理 | 新增/编辑/启禁用/搜索 |
| 分类管理 | 分类 CRUD + 排序 + 启禁用 |
| 商品管理 | 商品 CRUD + 图片上传 + 批量删除 + Excel 导出 |
| 订单管理 | 订单搜索/状态流转/详情（商品明细） |
| 用户管理 | 用户启禁用/搜索 |
| 公告管理 | 公告 CRUD + 类型管理 + 发布/撤回 |

## 设计系统

主题色 + 断点 + 阴影等设计变量统一在 [shared/styles/variables.scss](shared/styles/variables.scss)，全局注入，所有组件引用变量而非硬编码。`$bp-tablet/$bp-mobile/$bp-small` 三个断点变量保证响应式断点一致。

## Docker 部署

```bash
# 1. 构建前端
cd admin && npm run build && cd ../user && npm run build

# 2. 复制 .env 并填入密钥
cp .env.example .env

# 3. 启动
docker compose up -d
```

部署细节见 [docs/deploy-detail.md](docs/deploy-detail.md)。

## 关联仓库

| 项目 | 地址 |
|------|------|
| 后端 Spring Boot | [github.com/licwL/commercial](https://github.com/licwL/commercial) |

## License

MIT
