<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="sidebarWidth" class="aside">
      <div class="logo">
        <span class="logo-text">电商管理后台</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="$bg-sidebar"
        text-color="#BFB1A5"
        active-text-color="#D4845A"
      >
        <el-menu-item index="/employee">
          <el-icon><UserFilled /></el-icon>
          <span>员工管理</span>
        </el-menu-item>
        <el-menu-item index="/category">
          <el-icon><Grid /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/product">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/order">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/user">
          <el-icon><Avatar /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/notice">
          <el-icon><Bell /></el-icon>
          <span>公告管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧区域 -->
    <el-container>
      <!-- 顶栏 -->
      <el-header :height="headerHeight" class="header">
        <div class="header-right">
          <span class="user-name">{{ userName }}</span>
          <el-button type="danger" text @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>

      <!-- 主内容 -->
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { UserFilled, Grid, Goods, Document, Avatar, Bell } from '@element-plus/icons-vue'
import { clearToken } from '@shared/request'
import { logout } from '@/api/employee'

const router = useRouter()
const route = useRoute()

const sidebarWidth = '220px'
const headerHeight = '56px'

const activeMenu = computed(() => route.path)

const userName = localStorage.getItem('userName') || '管理员'

async function handleLogout() {
  try {
    await logout()
  } catch {
    // 退出失败也继续清除本地状态
  }
  clearToken()
  localStorage.clear()
  router.push('/login')
}
</script>

<style scoped lang="scss">
.admin-layout {
  height: 100%;
}

.aside {
  background: $bg-sidebar;
  overflow-y: auto;

  .logo {
    height: $header-height;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

    .logo-text {
      font-size: 16px;
      font-weight: 600;
      color: $--el-color-primary;
      letter-spacing: 2px;
    }
  }

  .el-menu {
    border-right: none;
  }
}

.header {
  background: $bg-card;
  border-bottom: 1px solid $border-color;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 24px;

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .user-name {
      color: $text-secondary;
      font-size: 14px;
    }
  }
}

.main {
  background: $bg-page;
  padding: 20px;
}
</style>
