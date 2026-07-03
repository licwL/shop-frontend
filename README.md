# 电商平台前端

技术栈：Vue 3 + Vite + Element Plus + Axios

## 目录结构

```
├── admin/       管理端（后台管理系统）
├── user/        用户端（购物商城）
└── shared/      公共代码（axios封装、工具函数、组件）
```

## 启动

```bash
# 管理端
cd admin && npm install && npm run dev

# 用户端
cd user && npm install && npm run dev
```

## 后端 API

`http://localhost:8080`，接口文档见 `http://localhost:8080/doc.html`

## 共享模块

`shared/` 下的代码通过 Vite alias 引入，打包时编译进各自 dist，无需单独部署。
