# 电商平台部署全流程详解

## 一、架构总览

```
互联网
  │
  ├─ https://bithaze.online ──→ Nginx (443 SSL)
  │                              ├─ /           → 用户端 SPA  (Vue 3)
  │                              ├─ /admin/     → 管理端 SPA  (Vue 3)
  │                              ├─ /api/admin/ → Spring Boot (8080)
  │                              └─ /user/      → Spring Boot (8080)
  │
  └─ http://43.139.181.137 ──→ Nginx (80，HTTP 不跳转，微信可用)

Docker 容器拓扑
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  shop-nginx  │   │ shop-backend │   │  shop-mysql  │
│  nginx:alpine│──→│ eclipse-tem  │──→│  mysql:8.0   │
│  :80 :443    │   │  urin:11-jre │   │  :3306       │
└──────────────┘   └──────────────┘   └──────────────┘
       ↑                  ↑                   ↑
       └──── 共享网络 shop-frontend_default ──┘
```

## 二、前置知识

### 2.1 Docker 三要素

| 概念 | 解释 | 本项目对应 |
|------|------|-----------|
| **镜像 Image** | 静态模板，包含运行环境和代码 | `shop-frontend-nginx` / `shop-frontend-backend` |
| **容器 Container** | 镜像的运行实例，互相隔离 | `shop-nginx` / `shop-backend` / `shop-mysql` |
| **仓库 Registry** | 存放镜像的地方 | Docker Hub（拉取 `nginx:alpine`、`mysql:8.0` 等基础镜像） |

### 2.2 为什么用 Docker

- **环境一致性**：本地 Windows 开发，服务器 Linux 部署，Docker 保证运行环境完全相同
- **依赖隔离**：MySQL、Java、Nginx 各自独立容器，不会冲突
- **一键启停**：`docker compose up -d` 启动全部，`docker compose down` 停止全部

### 2.3 Docker Compose

Docker Compose 是 Docker 的编排工具，通过一个 YAML 文件定义多个容器之间的关系：

- `services` — 定义三个容器（mysql、backend、nginx）
- `depends_on` — 启动顺序：先 MySQL → 再 Backend → 最后 Nginx
- `volumes` — 数据持久化（数据库文件保存为命名卷，删除容器不丢数据）
- `networks` — 自动创建共享网络，容器间用服务名互访（如 backend 连 `mysql:3306`）
- `healthcheck` — 健康检查，MySQL 就绪后才启动 Backend

### 2.4 Nginx 反向代理

浏览器不能直接访问 Docker 内部的服务，Nginx 作为统一入口：

| 请求路径 | Nginx 处理方式 |
|---------|---------------|
| `/` | 返回 `/usr/share/nginx/html/index.html`（用户端 SPA） |
| `/admin/` | 返回 `/usr/share/nginx/html/admin/index.html`（管理端 SPA） |
| `/api/admin/**` | 代理到 `backend:8080`（管理端 API） |
| `/user/**` | 代理到 `backend:8080`（用户端 API） |

**SPA 路由核心指令**：
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
`try_files` 按顺序查找：
1. `$uri` — 精确匹配文件（如 `/assets/app.js`）
2. `$uri/` — 匹配目录
3. `/index.html` — 都不匹配时回退到首页，由 Vue Router 处理前端路由

### 2.5 为什么加 `/api` 前缀

管理端的 SPA 路由和 API 共享 `/admin/` 前缀：

| 类型 | 路径 |
|------|------|
| 前端页面 | `/admin/employee`（GET） |
| API 请求 | `/admin/employee/page`（GET） |

Nginx 无法区分"页面导航"和"API 调用"，切换 History 模式后会冲突。加的解决方案是在 axios 请求拦截器里给所有 API 请求加 `/api` 前缀：

```
前端页面   → /admin/employee       → Nginx 返回 index.html
API 请求   → /api/admin/employee/  → Nginx 剥离 /api → 代理到后端
```

### 2.6 SSL/TLS 与 HTTPS

- **Let's Encrypt** — 免费 SSL 证书颁发机构，通过 ACME 协议自动验证域名所有权
- **Certbot** — Let's Encrypt 官方客户端，自动申请和续期证书
- **验证方式 webroot**：Certbot 在服务器上创建一个临时文件，Let's Encrypt 通过 HTTP 访问该文件确认你真的拥有这个域名
- **自动续期**：证书 90 天有效期，Certbot 会自动注册定时任务续期

## 三、部署文件清单

| 文件 | 作用 |
|------|------|
| `Dockerfile.frontend` | 构建前端 Nginx 镜像：复制 dist 文件 + nginx 配置 |
| `server/Dockerfile` | 构建后端 Java 镜像：复制 JAR + 安装 curl（健康检查用） |
| `nginx.conf` | Nginx 全部配置：SSL、SPA 路由、API 代理、缓存、Gzip |
| `docker-compose.yml` | 三容器编排：MySQL → Backend → Nginx |
| `.env` | 环境变量：数据库密码、OSS 密钥（不在 Git 中） |
| `init.sql` | 数据库初始化脚本：建表 + 种子数据 |

## 四、逐步命令详解

### Step 1：服务器准备

```bash
sudo mkdir -p /opt/shop && sudo chown ubuntu:ubuntu /opt/shop
```
- `mkdir -p`：递归创建目录，已存在不报错
- `chown ubuntu:ubuntu`：把目录所有权给普通用户，避免后续上传需要 sudo

### Step 2：构建前端生产包

```bash
cd f:/Commercial/shop-frontend/admin && npm run build
cd f:/Commercial/shop-frontend/user && npm run build
```
- `npm run build` → 执行 `vite build`，Vite 会把 `.vue` 编译成 `.js/.css`，输出到 `dist/`
- admin 配置了 `base: '/admin/'`，所以 `index.html` 里资源路径是 `/admin/assets/app.js`

### Step 3：上传文件（OrcaTerm / scp）

```bash
scp -r f:/Commercial/shop-frontend root@43.139.181.137:/opt/shop/
```
- `-r`：递归复制整个目录

### Step 4：启动服务

```bash
cd /opt/shop/shop-frontend
sudo docker compose up -d
```
- `-d`：后台运行（daemon），不阻塞终端
- 首次运行会自动拉取基础镜像（`mysql:8.0`、`nginx:alpine`、`eclipse-temurin:11-jre`）并构建自定义镜像

### Step 5：查看状态

```bash
sudo docker compose ps        # 容器运行状态
sudo docker compose logs nginx # Nginx 日志
```

### Step 6：申请 SSL 证书

```bash
sudo snap install --classic certbot
sudo certbot certonly --webroot -w /opt/shop/certbot-webroot -d bithaze.online -d www.bithaze.online
```
- `certonly`：只申请证书，不自动修改 nginx
- `--webroot`：验证方式，在指定目录放置验证文件
- `-d`：要申请的域名

### Step 7：重建 Nginx（更新配置后）

```bash
sudo docker compose build nginx   # 重新构建镜像
sudo docker compose up -d nginx   # 用新镜像重启容器
```

## 五、日常运维命令

| 命令 | 作用 |
|------|------|
| `docker compose ps` | 查看所有容器状态 |
| `docker compose logs -f backend` | 实时查看后端日志 |
| `docker compose restart backend` | 重启后端 |
| `docker compose down` | 停止并删除容器（数据卷保留） |
| `docker compose down -v` | 停止并删除容器和数据卷（⚠ 数据库清空） |
| `docker compose pull` | 拉取基础镜像最新版 |
| `docker exec -it shop-mysql mysql -ushop -p` | 进入 MySQL 命令行 |

## 六、企业级规范评估

### 已达标

| 维度 | 规范 | 本项目 |
|------|------|--------|
| **环境一致性** | 开发-测试-生产环境一致 | Docker 镜像保证完全相同 |
| **配置外置** | 敏感信息不硬编码 | `.env` 文件 + `application-prod.yml` 环境变量 |
| **HTTPS 强制** | 全站加密传输 | 域名强制 HTTPS，HTTP 301 重定向 |
| **静态资源缓存** | 减少带宽，加速加载 | JS/CSS/图片 30 天缓存 |
| **Gzip 压缩** | 文本资源压缩传输 | nginx gzip 开启，压缩比约 70% |
| **健康检查** | 自动检测服务可用性 | MySQL + Backend + Nginx 三容器 healthcheck |
| **依赖顺序** | 启动顺序正确 | MySQL → Backend → Nginx |
| **数据持久化** | 容器销毁数据不丢 | MySQL 数据卷 `mysql_data` |
| **SPA 路由支持** | 前端路由正确处理 | `try_files` fallback 到 index.html |
| **CI/CD 友好** | 可自动化部署 | Docker 镜像构建标准化 |

### 待改进

| 问题 | 企业标准做法 | 当前状态 |
|------|-------------|---------|
| **Docker 镜像优化** | 多阶段构建，镜像体积 < 200MB | 单阶段，Nginx 镜像 ~50MB（还行），Backend 镜像 ~400MB |
| **日志收集** | 集中化日志（ELK/Loki） | 仅 `docker logs`，容器重启日志丢失 |
| **监控告警** | Prometheus + Grafana | 无 |
| **自动备份** | 数据库定时备份到 OSS | 无 |
| **CI/CD** | GitHub Actions / Jenkins 自动构建部署 | 手动 scp 上传 |
| **滚动更新** | 零停机部署 | 每次 rebuild 有短暂中断 |
| **密钥管理** | HashiCorp Vault / 云厂商 KMS | `.env` 文件（已 Git 排除） |
| **容器健康检查** | 接口返回 200 + 业务级检查 | 仅检查进程存活性 |

### 总结

**达到了小型项目/个人作品的商用级别**，生产环境可运行。对于 2-3 人的小团队或作业展示完全够用。如果需要往企业级演进，优先补日志和自动备份。EOF
