<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="sidebarWidth" class="aside" :class="{ collapsed: !sidebarOpen }">
      <div class="logo">
        <span class="logo-text">MALL</span>
        <span class="logo-tag">Admin</span>
      </div>
      <el-menu
        :default-active="activeMenu" router
        background-color="#1E2130"
        text-color="#9CA0B0"
        active-text-color="#7C89CF"
      >
        <el-menu-item index="/employee"><el-icon><UserFilled /></el-icon><span>员工管理</span></el-menu-item>
        <el-menu-item index="/category"><el-icon><Grid /></el-icon><span>分类管理</span></el-menu-item>
        <el-menu-item index="/product"><el-icon><Goods /></el-icon><span>商品管理</span></el-menu-item>
        <el-menu-item index="/order"><el-icon><Document /></el-icon><span>订单管理</span></el-menu-item>
        <el-menu-item index="/user"><el-icon><Avatar /></el-icon><span>用户管理</span></el-menu-item>
        <el-menu-item index="/notice"><el-icon><Bell /></el-icon><span>公告管理</span></el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 移动端遮罩 -->
    <div v-if="sidebarOpen && isMobile" class="overlay" @click="sidebarOpen = false" />

    <el-container>
      <el-header :height="headerHeight" class="header">
        <div class="header-left">
          <button class="hamburger" @click="sidebarOpen = !sidebarOpen">
            <span :class="{ open: sidebarOpen }" />
          </button>
          <span class="page-label">{{ route.meta.title }}</span>
        </div>
        <div class="header-right">
          <span class="user-name">{{ userName }}</span>
          <el-button type="danger" text size="small" @click="handleLogout">退出</el-button>
        </div>
      </el-header>

      <el-main class="main"><router-view /></el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { UserFilled, Grid, Goods, Document, Avatar, Bell } from '@element-plus/icons-vue'
import { clearToken } from '@shared/request'
import { logout } from '@/api/employee'

const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(true)

const isMobile = computed(() => window.innerWidth < 768)
const sidebarWidth = computed(() => isMobile.value ? '220px' : '220px')

const activeMenu = computed(() => route.path)
const userName = localStorage.getItem('userName') || '管理员'

async function handleLogout() {
  try { await logout() } catch { /* ignore */ }
  clearToken(); localStorage.clear(); router.push('/login')
}
</script>

<style scoped lang="scss">
.admin-layout { height: 100%; }

// ---- Sidebar ----
.aside {
  background: $bg-sidebar;
  overflow-y: auto;
  transition: transform 0.3s;
  z-index: 200;

  @media (max-width: 768px) {
    position: fixed; left: 0; top: 0; bottom: 0;
    transform: translateX(-100%);
    &.collapsed { transform: translateX(0); }
  }
}

.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 150;
}

.logo {
  height: $header-height;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  border-bottom: 1px solid rgba(255,255,255,0.06);

  .logo-text {
    font-size: 18px; font-weight: 700; color: #fff; letter-spacing: 1px;
  }
  .logo-tag {
    font-size: 11px; font-weight: 500; color: $--el-color-primary-light-3;
    background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: $radius-sm;
  }
}

.el-menu { border-right: none; }

// ---- Header ----
.header {
  background: $bg-card;
  border-bottom: 1px solid $border-color;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px;

  @media (max-width: 768px) { padding: 0 14px; }
}

.header-left {
  display: flex; align-items: center; gap: 12px;
  .page-label { font-weight: 600; font-size: 15px; color: $text-primary; }
}

.hamburger {
  display: none; width: 22px; height: 18px;
  background: none; border: none; cursor: pointer;
  flex-direction: column; justify-content: space-between; padding: 0;

  @media (max-width: 768px) { display: flex; }

  span {
    display: block; height: 2px; background: $text-primary; border-radius: 2px; transition: 0.25s;
    &:first-child { transform-origin: left center; }
    &:last-child { transform-origin: left center; }
    &.open {
      &:first-child { transform: rotate(45deg); width: 20px; }
      &:nth-child(2) { opacity: 0; }
      &:last-child { transform: rotate(-45deg); width: 20px; }
    }
  }
}

.header-right { display: flex; align-items: center; gap: 12px; }

.user-name { font-size: 13px; color: $text-secondary; font-weight: 500; }

// ---- Main ----
.main { background: $bg-page; padding: 20px; @media (max-width: 768px) { padding: 14px; } }
</style>
