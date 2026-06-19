import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import './styles/global.css'

// 创建Vue应用
const app = createApp(App)

// 注册Element Plus
app.use(ElementPlus, { size: 'default' })

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册Pinia状态管理
const pinia = createPinia()
app.use(pinia)

// 注册路由
app.use(router)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue错误:', err)
  console.error('错误信息:', info)
  
  // 发送错误到后端（可选）
  // api.logError({ error: err.message, info, stack: err.stack })
}

// 全局属性
app.config.globalProperties.$filters = {
  formatDate(value) {
    if (!value) return ''
    return new Date(value).toLocaleString('zh-CN')
  },
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// 挂载应用
app.mount('#app')

console.log(`
%c MarketAI Pro %c v1.0.0 %c
%c 企业级AI营销自动化平台 %c
`, 
'background:#6366f1; color:#fff; padding:4px 8px; border-radius:4px 0 0 4px; font-weight:bold;',
'background:#a78bfa; color:#fff; padding:4px 8px; border-radius:0 4px 4px 0;',
'',
'background:transparent; color:#6366f1;',
'')
