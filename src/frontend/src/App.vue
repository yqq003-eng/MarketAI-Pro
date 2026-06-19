<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 监听更新通知
onMounted(() => {
  if (window.electronAPI) {
    window.electronAPI.onUpdateAvailable(() => {
      ElMessage.info('发现新版本，正在下载更新...')
    })
    
    window.electronAPI.onUpdateDownloaded(() => {
      ElMessage.success({
        message: '更新已下载完成，重启应用后生效',
        duration: 5000
      })
    })
  }
})

onUnmounted(() => {
  // 清理监听器
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Element Plus 主题覆盖 */
.el-menu {
  border-right: none !important;
}

.el-table {
  font-size: 14px;
}

.el-button {
  font-weight: 400;
}
</style>
