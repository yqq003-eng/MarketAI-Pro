# MarketAI Pro - 企业级AI营销自动化平台

## 📋 项目简介

MarketAI Pro 是一款面向企业的**新一代AI营销自动化平台**，集成了短视频矩阵、数字人生成、智能获客、企业微信运营、BOSS招聘自动化、法务智能、企业智库等核心功能模块，帮助企业实现营销全流程的智能化升级。

本项目为**全原创开发**，基于灵犀AI功能分析报告进行需求梳理和架构设计，采用现代化的技术栈实现。

## ✨ 核心功能模块

### 1. 🎬 短视频矩阵
- 多平台（抖音/小红书/快手）批量视频创作与分发
- 多场景AI剪辑，自动生成差异化内容
- 视频库与素材库管理
- 多账号授权绑定与任务调度
- 定时发布与数据总览

### 2. 🤖 数字人短视频
- AI声音定制与克隆
- 数字人形象定制与生成
- 数字人视频精剪
- 文字/脚本驱动视频批量生成

### 3. 💬 智能获客（个微）
- 地图获客：基于位置数据采集潜在客户
- 聚合聊天：多设备微信消息统一处理
- 关键词自动回复与人工接管
- 精准群发与好友管理
- 朋友圈任务自动化

### 4. 🏢 企业微信运营
- 企微账号授权与多账号管理
- 消息群发与加好友任务
- 客户标签体系与会话管理
- 关键词自动回复

### 5. 💼 BOSS直聘招聘自动化
- AI筛选匹配候选人
- 批量自动沟通与打招呼
- 简历管理与招聘数据分析

### 6. ⚖️ 法务智能
- AI法律问答咨询
- 法律条文/案例智能检索
- 合同文本自动审查与风险识别

### 7. 🧠 企业智库 / AI智能体
- 创建企业专属AI智能体
- 智能体知识库挂载与向量化
- 企业知识分类与全文检索
- 培训课堂管理

### 8. ⚙️ 企业管理 & 系统设置
- 激活码生成与分发
- 部门/员工/设备管理
- 数据罗盘与算力消耗统计
- 系统更新与个性化设置

## 🛠️ 技术栈

### 前端
- **框架**: Vue 3.x + Vite
- **UI组件**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **图表**: ECharts 5
- **HTTP客户端**: Axios
- **实时通信**: Socket.io-client

### 后端
- **运行时**: Node.js 18+
- **框架**: Express 4
- **数据库**: SQLite 3 (通过Sequelize ORM)
- **认证**: JWT (jsonwebtoken)
- **加密**: bcryptjs + CryptoJS
- **实时通信**: Socket.io

### 桌面端
- **框架**: Electron 27
- **打包**: electron-builder
- **自动更新**: electron-updater

### 开发工具
- **版本控制**: Git
- **包管理**: npm
- **代码规范**: ESLint + Prettier
- **构建工具**: Vue CLI / Vite

## 📦 项目结构

```
marketai-pro/
├── electron/                # Electron主进程
│   ├── main.js            # 主进程入口
│   ├── preload.js         # 预加载脚本
│   └── ipc-handlers/     # IPC通信处理
├── src/
│   ├── frontend/         # Vue前端项目
│   │   ├── public/       # 静态资源
│   │   ├── src/
│   │   │   ├── views/    # 页面组件
│   │   │   ├── components/ # 通用组件
│   │   │   ├── store/    # Pinia状态管理
│   │   │   ├── router/   # 路由配置
│   │   │   └── assets/   # 样式和图片
│   │   └── package.json
│   └── backend/          # Node.js后端
│       ├── server.js      # 服务器入口
│       ├── routes/        # API路由
│       ├── models/        # 数据库模型
│       ├── services/      # 业务逻辑
│       └── middleware/    # 中间件
├── resources/             # 应用资源
├── database/              # 数据库文件
├── docs/                 # 项目文档
├── dist/                 # 构建输出
└── package.json          # 项目配置
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### 安装依赖

```bash
# 克隆项目
cd marketai-pro

# 安装根目录依赖
npm install

# 安装前端依赖
cd src/frontend
npm install
cd ../..

# 安装后端依赖
cd src/backend
npm install
cd ../..
```

### 开发模式

```bash
# 同时启动前端开发服务器和Electron
npm run dev

# 或分别启动
# 启动前端开发服务器 (http://localhost:8080)
npm run dev:vue

# 启动Electron (开发模式)
npm run dev:electron

# 启动后端服务器 (http://localhost:3000)
npm run server
```

### 生产构建

```bash
# 构建前端
npm run build:vue

# 构建Electron应用
npm run build:electron

# 或一键构建
npm run build
```

### 数据库初始化

```bash
# 初始化数据库表结构
npm run db:init
```

## ⚙️ 配置说明

### 环境变量 (.env)

```bash
# 服务器配置
PORT=3000
NODE_ENV=development

# JWT密钥
JWT_SECRET=your-super-secret-key-change-this

# 数据库配置
DB_PATH=./database/marketai.db

# AI服务配置 (示例)
# AI_API_KEY=your-ai-api-key
# AI_API_URL=https://api.openai.com/v1
```

### Electron构建配置

编辑 `package.json` 中的 `build` 字段：

```json
{
  "build": {
    "appId": "com.marketai.pro",
    "productName": "MarketAI Pro",
    "directories": {
      "output": "dist_electron"
    },
    "win": {
      "target": "nsis",
      "icon": "resources/icon.ico"
    }
  }
}
```

## 📚 API文档

### 认证相关

#### 登录
```
POST /api/auth/login
Body: {
  "username": "string",
  "password": "string"
}
Response: {
  "code": 200,
  "data": {
    "token": "jwt-token",
    "user": {...}
  }
}
```

#### 注册
```
POST /api/auth/register
Body: {
  "username": "string",
  "email": "string",
  "password": "string",
  "activation_code": "string"
}
```

### 视频管理

#### 获取视频列表
```
GET /api/video/list?page=1&limit=20&status=draft
Headers: Authorization: Bearer <token>
```

#### 创建视频
```
POST /api/video/create
Body: {
  "title": "string",
  "description": "string",
  "file_path": "string",
  "platform": ["douyin", "xiaohongshu"]
}
```

### 更多API文档
详见 `docs/api.md` (待补充)

## 🔒 安全注意事项

1. **激活码机制**: 软件采用激活码授权，防止未授权使用
2. **JWT认证**: 所有API请求需携带有效的JWT token
3. **权限控制**: 基于角色的访问控制 (RBAC)
4. **数据加密**: 敏感数据采用AES加密存储
5. **SQL注入防护**: 使用Sequelize ORM，自动防护SQL注入
6. **XSS防护**: 前端采用Vue的模板语法，自动转义HTML
7. **CSRF防护**: 使用JWT token，无需担心CSRF

## 📄 开源协议

本项目采用**商业授权协议**。

- ✅ 允许：学习、研究、修改、私有部署
- ❌ 禁止：未经授权的商业再分发、移除版权信息
- 💼 商业使用：需要购买商业授权

联系方式：marketai@example.com

## 🙏 致谢

感谢以下开源项目：
- Electron
- Vue.js
- Element Plus
- Express
- Sequelize
- ECharts

## 📧 联系方式

- 官网：https://www.marketai.com (示例)
- 邮箱：support@marketai.com
- 问题反馈：https://github.com/marketai/issues

---

**⚠️ 免责声明**
- 本项目为原创开发，不涉及任何第三方软件的逆向工程代码
- 使用本项目进行商业活动时，请确保遵守各平台的API使用条款
- 因使用本项目而产生的任何法律风险，由使用者自行承担

**版本**: v1.0.0  
**最后更新**: 2026-06-20
