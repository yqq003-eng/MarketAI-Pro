import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据驾驶舱', icon: 'DataBoard' }
      }
    ]
  },
  
  // 短视频矩阵模块
  {
    path: '/video-matrix',
    component: Layout,
    redirect: '/video-matrix/overview',
    meta: { title: '短视频矩阵', icon: 'VideoCamera' },
    children: [
      {
        path: 'overview',
        name: 'VideoOverview',
        component: () => import('@/views/video/Overview.vue'),
        meta: { title: '数据总览' }
      },
      {
        path: 'edit',
        name: 'VideoEdit',
        component: () => import('@/views/video/Edit.vue'),
        meta: { title: '多场景剪辑' }
      },
      {
        path: 'library',
        name: 'VideoLibrary',
        component: () => import('@/views/video/Library.vue'),
        meta: { title: '视频库' }
      },
      {
        path: 'materials',
        name: 'VideoMaterials',
        component: () => import('@/views/video/Materials.vue'),
        meta: { title: '素材库' }
      },
      {
        path: 'accounts',
        name: 'VideoAccounts',
        component: () => import('@/views/video/Accounts.vue'),
        meta: { title: '账号管理' }
      },
      {
        path: 'tasks',
        name: 'VideoTasks',
        component: () => import('@/views/video/Tasks.vue'),
        meta: { title: '任务管理' }
      },
      {
        path: 'schedule',
        name: 'VideoSchedule',
        component: () => import('@/views/video/Schedule.vue'),
        meta: { title: '定时发布' }
      },
      {
        path: 'cover',
        name: 'CoverGenerate',
        component: () => import('@/views/video/Cover.vue'),
        meta: { title: '封面生成' }
      }
    ]
  },

  // 数字人短视频模块
  {
    path: '/digital-human',
    component: Layout,
    redirect: '/digital-human/voice',
    meta: { title: '数字人短视频', icon: 'UserFilled' },
    children: [
      {
        path: 'voice',
        name: 'DigitalVoice',
        component: () => import('@/views/digital/Voice.vue'),
        meta: { title: '声音定制' }
      },
      {
        path: 'avatar',
        name: 'DigitalAvatar',
        component: () => import('@/views/digital/Avatar.vue'),
        meta: { title: '形象定制' }
      },
      {
        path: 'refine',
        name: 'DigitalRefine',
        component: () => import('@/views/digital/Refine.vue'),
        meta: { title: '数字人精剪' }
      },
      {
        path: 'refine-lib',
        name: 'DigitalRefineLib',
        component: () => import('@/views/digital/RefineLib.vue'),
        meta: { title: '精剪库' }
      },
      {
        path: 'generate',
        name: 'DigitalGenerate',
        component: () => import('@/views/digital/Generate.vue'),
        meta: { title: '视频生成' }
      }
    ]
  },

  // 智能获客（个微）模块
  {
    path: '/wechat-marketing',
    component: Layout,
    redirect: '/wechat-marketing/map',
    meta: { title: '智能获客', icon: 'ChatDotRound' },
    children: [
      {
        path: 'map',
        name: 'MapCustomers',
        component: () => import('@/views/wechat/MapCustomers.vue'),
        meta: { title: '地图获客' }
      },
      {
        path: 'aggregate-chat',
        name: 'AggregateChat',
        component: () => import('@/views/wechat/AggregateChat.vue'),
        meta: { title: '聚合聊天' }
      },
      {
        path: 'tags',
        name: 'CustomerTags',
        component: () => import('@/views/wechat/Tags.vue'),
        meta: { title: '标签管理' }
      },
      {
        path: 'keyword-reply',
        name: 'KeywordReply',
        component: () => import('@/views/wechat/KeywordReply.vue'),
        meta: { title: '关键词回复' }
      },
      {
        path: 'mass-send',
        name: 'MassSend',
        component: () => import('@/views/wechat/MassSend.vue'),
        meta: { title: '精准群发' }
      },
      {
        path: 'friends',
        name: 'FriendList',
        component: () => import('@/views/wechat/FriendList.vue'),
        meta: { title: '好友列表' }
      },
      {
        path: 'moments',
        name: 'MomentsTask',
        component: () => import('@/views/wechat/Moments.vue'),
        meta: { title: '朋友圈任务' }
      }
    ]
  },

  // 企业微信运营模块
  {
    path: '/wecom',
    component: Layout,
    redirect: '/wecom/customers',
    meta: { title: '企业微信运营', icon: 'OfficeBuilding' },
    children: [
      {
        path: 'customers',
        name: 'WecomCustomers',
        component: () => import('@/views/wecom/CustomerManagement.vue'),
        meta: { title: '客户管理' }
      },
      {
        path: 'groups',
        name: 'WecomGroups',
        component: () => import('@/views/wecom/GroupManagement.vue'),
        meta: { title: '群管理' }
      },
      {
        path: 'mass-message',
        name: 'WecomMassMessage',
        component: () => import('@/views/wecom/MassMessage.vue'),
        meta: { title: '消息群发' }
      },
      {
        path: 'auto-reply',
        name: 'WecomAutoReply',
        component: () => import('@/views/wecom/AutoReply.vue'),
        meta: { title: '自动回复' }
      },
      {
        path: 'customer-tags',
        name: 'WecomCustomerTags',
        component: () => import('@/views/wecom/CustomerTags.vue'),
        meta: { title: '客户标签' }
      },
      {
        path: 'statistics',
        name: 'WecomStatistics',
        component: () => import('@/views/wecom/DataStatistics.vue'),
        meta: { title: '数据统计' }
      },
      {
        path: 'employees',
        name: 'WecomEmployees',
        component: () => import('@/views/wecom/EmployeeManagement.vue'),
        meta: { title: '员工管理' }
      }
    ]
  },

  // BOSS直聘模块
  {
    path: '/boss',
    component: Layout,
    redirect: '/boss/recommend',
    meta: { title: 'BOSS招聘自动化', icon: 'Briefcase' },
    children: [
      {
        path: 'recommend',
        name: 'BossRecommend',
        component: () => import('@/views/boss/Recommend.vue'),
        meta: { title: '牛人推荐' }
      },
      {
        path: 'chat',
        name: 'BossChat',
        component: () => import('@/views/boss/Chat.vue'),
        meta: { title: '沟通聊天' }
      },
      {
        path: 'resume',
        name: 'BossResume',
        component: () => import('@/views/boss/Resume.vue'),
        meta: { title: '简历管理' }
      },
      {
        path: 'analytics',
        name: 'BossAnalytics',
        component: () => import('@/views/boss/Analytics.vue'),
        meta: { title: '招聘数据' }
      }
    ]
  },

  // 法务智能模块
  {
    path: '/legal',
    component: Layout,
    redirect: '/legal/consult',
    meta: { title: '法务智能', icon: 'Scale' },
    children: [
      {
        path: 'consult',
        name: 'LegalConsult',
        component: () => import('@/views/legal/Consult.vue'),
        meta: { title: '法务咨询' }
      },
      {
        path: 'search',
        name: 'LegalSearch',
        component: () => import('@/views/legal/Search.vue'),
        meta: { title: '法务检索' }
      },
      {
        path: 'contract',
        name: 'ContractReview',
        component: () => import('@/views/legal/Contract.vue'),
        meta: { title: '合同审查' }
      }
    ]
  },

  // 企业智库模块
  {
    path: '/knowledge',
    component: Layout,
    redirect: '/knowledge/documents',
    meta: { title: '企业智库', icon: 'Collection' },
    children: [
      {
        path: 'documents',
        name: 'KnowledgeDocuments',
        component: () => import('@/views/knowledge/Document.vue'),
        meta: { title: '知识文档' }
      },
      {
        path: 'categories',
        name: 'KnowledgeCategories',
        component: () => import('@/views/knowledge/Category.vue'),
        meta: { title: '知识分类' }
      },
      {
        path: 'qa',
        name: 'KnowledgeQA',
        component: () => import('@/views/knowledge/QA.vue'),
        meta: { title: '知识问答' }
      },
      {
        path: 'search',
        name: 'KnowledgeSearch',
        component: () => import('@/views/knowledge/Search.vue'),
        meta: { title: '知识搜索' }
      },
      {
        path: 'statistics',
        name: 'KnowledgeStatistics',
        component: () => import('@/views/knowledge/Statistics.vue'),
        meta: { title: '知识统计' }
      }
    ]
  },

  // 系统管理模块
  {
    path: '/system',
    component: Layout,
    redirect: '/system/users',
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      {
        path: 'users',
        name: 'SystemUsers',
        component: () => import('@/views/system/User.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'roles',
        name: 'SystemRoles',
        component: () => import('@/views/system/Role.vue'),
        meta: { title: '角色管理' }
      },
      {
        path: 'configs',
        name: 'SystemConfigs',
        component: () => import('@/views/system/Config.vue'),
        meta: { title: '系统配置' }
      },
      {
        path: 'logs',
        name: 'SystemLogs',
        component: () => import('@/views/system/Log.vue'),
        meta: { title: '操作日志' }
      },
      {
        path: 'notifications',
        name: 'SystemNotifications',
        component: () => import('@/views/system/Notification.vue'),
        meta: { title: '系统通知' }
      },
      {
        path: 'statistics',
        name: 'SystemStatistics',
        component: () => import('@/views/system/Statistics.vue'),
        meta: { title: '系统统计' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '首页'} - MarketAI Pro`
  next()
})

export default router
