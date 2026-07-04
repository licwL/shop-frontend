<template>
  <div class="site-layout">
    <!-- 顶部导航 -->
    <header class="top-bar">
      <div class="top-inner">
        <router-link to="/" class="logo">MALL</router-link>

        <!-- 桌面导航 -->
        <nav class="nav-desktop">
          <router-link to="/home" class="nav-link">首页</router-link>
          <router-link to="/cart" class="nav-link cart-link">
            购物车 <span v-if="cartCount" class="badge">{{ cartCount > 99 ? '99+' : cartCount }}</span>
          </router-link>
          <router-link to="/orders" class="nav-link">订单</router-link>
          <router-link to="/profile" class="nav-link">我的</router-link>
        </nav>

        <!-- 移动端汉堡 -->
        <button class="hamburger" @click="mobileOpen = !mobileOpen">
          <span :class="{ open: mobileOpen }"></span>
        </button>
      </div>

      <!-- 移动端下拉菜单 -->
      <nav class="nav-mobile" :class="{ open: mobileOpen }">
        <router-link to="/home" class="mob-link" @click="mobileOpen = false">首页</router-link>
        <router-link to="/cart" class="mob-link" @click="mobileOpen = false">购物车</router-link>
        <router-link to="/orders" class="mob-link" @click="mobileOpen = false">我的订单</router-link>
        <router-link to="/profile" class="mob-link" @click="mobileOpen = false">个人中心</router-link>
      </nav>
    </header>

    <!-- 主内容 -->
    <main class="main-area">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="site-footer">
      <span>© 2026 MALL</span>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const cartCount = ref(0)
const mobileOpen = ref(false)
</script>

<style scoped lang="scss">
.site-layout {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

// ---- Top Bar ----
.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba($bg-card, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid $border-color;
}

.top-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.logo {
  font-size: 22px;
  font-weight: 700;
  color: $--el-color-primary;
  letter-spacing: -0.5px;
  text-decoration: none;
}

// ---- Desktop Nav ----
.nav-desktop {
  display: flex;
  align-items: center;
  gap: 36px;

  @media (max-width: 640px) { display: none; }
}

.nav-link {
  font-size: 14px;
  font-weight: 500;
  color: $text-secondary;
  text-decoration: none;
  position: relative;
  transition: color 0.2s;

  &:hover, &.router-link-active { color: $--el-color-primary; }
}

.cart-link { position: relative; }

.badge {
  position: absolute;
  top: -7px;
  right: -15px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  background: $accent;
  border-radius: 8px;
  padding: 0 5px;
}

// ---- Mobile ----
.hamburger {
  display: none;
  width: 24px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  flex-direction: column;
  justify-content: space-between;
  padding: 0;

  @media (max-width: 640px) { display: flex; }

  span {
    display: block;
    height: 2px;
    background: $text-primary;
    border-radius: 2px;
    transition: 0.25s;
    transform-origin: center;

    &.open {
      &:first-child { transform: translateY(9px) rotate(45deg); }
      &:nth-child(2) { opacity: 0; }
    }
  }
}

.nav-mobile {
  display: none;
  flex-direction: column;
  background: $bg-card;
  border-top: 1px solid $border-color;
  padding: 8px 0;

  &.open { display: flex; }
}

.mob-link {
  padding: 14px 24px;
  font-size: 15px;
  color: $text-primary;
  text-decoration: none;
  border-bottom: 1px solid $border-color;

  &:last-child { border-bottom: none; }
}

// ---- Main ----
.main-area {
  flex: 1;
}

// ---- Footer ----
.site-footer {
  text-align: center;
  padding: 20px;
  font-size: 12px;
  font-weight: 500;
  color: $text-secondary;
  border-top: 1px solid $border-color;
}
</style>
