<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <div class="logo-area">
        <img v-if="!isCollapse" src="@/assets/logo.png" alt="MarketAI Pro" class="logo-img">
        <img v-else src="@/assets/logo-mini.png" alt="M" class="logo-mini">
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        background-color="#0a0e1a"
        text-color="#e0e6ff"
        active-text-color="#6366f1"
        router
        class="aside-menu"
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <el-sub-menu v-if="route.children && route.children.length > 0" :index="route.path">
            <template #title>
              <el-icon><component :is="route.meta.icon" /></el-icon>
              <span>{{ route.meta.title }}</span>
            </template>
            <el-menu-item
              v-for="child in route.children"
              :key="child.path"
              :index="child.path"
            >
              {{ child.meta.title }}
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="route.path">
            <el-icon><component :is="route.meta.icon" /></el-icon>
            <template #title>{{ route.meta.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="layout-main-container">
      <!-- 顶部导航栏 -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="$route.meta.title">
              {{ $route.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-badge :value="3" :max="99" class="notification-badge">
            <el-icon class="header-icon"><Bell /></el-icon>
          </el-badge>
          
          <el-dropdown trigger="click" @command="handleUserCommand">
            <div class="user-info">
              <el-avatar :size="32" src="@/assets/avatar.png" />
              <span class="user-name">{{ userName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="settings">系统设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import {
  DataBoard,
  VideoCamera,
  UserFilled,
  ChatDotRound,
  OfficeBuilding,
  Briefcase,
  Scale,
  Collection,
  Setting,
  Fold,
  Expand,
  Bell,
  ArrowDown
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const userName = computed(() => userStore.userName || '用户')

// 获取菜单路由
const menuRoutes = computed(() => {
  return router.options.routes.filter(route => route.meta && route.meta.title)
})

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 切换侧边栏折叠
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 用户下拉菜单处理
const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/system/profile')
      break
    case 'settings':
      // 打开设置
      break
    case 'logout':
      // 退出登录
      userStore.logout()
      router.push('/login')
      break
  }
}

onMounted(() => {
  // 初始化用户数据
  userStore.initUserInfo()
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
  overflow: hidden;
}

.layout-aside {
  background-color: #0a0e1a;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  transition: width 0.3s;
  overflow: hidden;
}

.logo-area {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo-img {
  height: 36px;
}

.logo-mini {
  height: 32px;
  width: 32px;
  border-radius: 6px;
}

.aside-menu {
  border-right: none !important;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.layout-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px !important;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
}

.collapse-btn:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.notification-badge {
  cursor: pointer;
}

.header-icon {
  font-size: 20px;
  color: #606266;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-name {
  font-size: 14px;
  color: #303133;
}

.layout-main {
  background-color: #f0f2f5;
  padding: 20px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
