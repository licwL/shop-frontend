<template>
  <div class="site-layout">
    <!-- 顶部导航 -->
    <header class="top-bar">
      <div class="top-inner">
        <router-link to="/" class="logo">🛒 电商商城</router-link>
        <div class="nav-links">
          <router-link to="/home" class="nav-link">首页</router-link>
          <router-link to="/cart" class="nav-link cart-link">
            购物车
            <span v-if="cartCount" class="cart-badge">{{ cartCount > 99 ? '99+' : cartCount }}</span>
          </router-link>
          <router-link to="/orders" class="nav-link">我的订单</router-link>
          <router-link to="/profile" class="nav-link">个人中心</router-link>
        </div>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="main-area">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="site-footer">
      <span>© 2026 电商平台 版权所有</span>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const cartCount = ref(0)
</script>

<style scoped lang="scss">
.site-layout {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background: $bg-page;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: $bg-card;
  border-bottom: 1px solid $border-color;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.top-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 20px;

  .logo {
    font-size: 20px;
    font-weight: 700;
    color: $--el-color-primary;
    text-decoration: none;
    margin-right: 40px;
    flex-shrink: 0;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .nav-link {
    font-size: 14px;
    color: $text-primary;
    text-decoration: none;
    position: relative;

    &:hover, &.router-link-active { color: $--el-color-primary; }
  }

  .cart-link { position: relative; }

  .cart-badge {
    position: absolute;
    top: -8px;
    right: -16px;
    min-width: 16px;
    height: 16px;
    line-height: 16px;
    text-align: center;
    font-size: 10px;
    color: #fff;
    background: #F56C6C;
    border-radius: 8px;
    padding: 0 4px;
  }
}

.main-area {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
}

.site-footer {
  text-align: center;
  padding: 24px;
  font-size: 12px;
  color: $text-secondary;
  border-top: 1px solid $border-color;
}
</style>
