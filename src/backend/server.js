const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
const { Sequelize } = require('sequelize')

// 导入路由
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const videoRoutes = require('./routes/video')
const shortvideoRoutes = require('./routes/shortvideo')
const digitalRoutes = require('./routes/digital')
const wechatRoutes = require('./routes/wechat')
const wecomRoutes = require('./routes/wecom')
const bossRoutes = require('./routes/boss')
const legalRoutes = require('./routes/legal')
const knowledgeRoutes = require('./routes/knowledge')
const systemRoutes = require('./routes/system')

// 导入中间件
const { authMiddleware } = require('./middleware/auth')
const { errorHandler } = require('./middleware/error')

// 初始化Express应用
const app = express()
const PORT = process.env.PORT || 3000

// 数据库连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database/marketai.db'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    paranoid: true, // 软删除
  }
})

// 测试数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('✓ 数据库连接成功')
    // 同步模型到数据库
    return sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
  })
  .then(() => {
    console.log('✓ 数据库模型同步完成')
  })
  .catch(err => {
    console.error('✗ 数据库连接失败:', err)
  })

// 中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}))
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : false,
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')))

// 请求日志
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`)
  })
  next()
})

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: require('../../package.json').version
  })
})

// API路由
app.use('/api/auth', authRoutes)
app.use('/api/user', authMiddleware, userRoutes)
app.use('/api/video', authMiddleware, videoRoutes)
app.use('/api/shortvideo', authMiddleware, shortvideoRoutes)
app.use('/api/digital', authMiddleware, digitalRoutes)
app.use('/api/wechat', authMiddleware, wechatRoutes)
app.use('/api/wecom', authMiddleware, wecomRoutes)
app.use('/api/boss', authMiddleware, bossRoutes)
app.use('/api/legal', authMiddleware, legalRoutes)
app.use('/api/knowledge', authMiddleware, knowledgeRoutes)
app.use('/api/system', authMiddleware, systemRoutes)

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '请求的资源不存在',
    path: req.path
  })
})

// 错误处理
app.use(errorHandler)

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║     MarketAI Pro 后端服务已启动           ║
  ╠══════════════════════════════════════════╣
  ║     环境: ${process.env.NODE_ENV || 'development'}                    
  ║     端口: ${PORT}                                 
  ║     时间: ${new Date().toLocaleString('zh-CN')}       
  ╚══════════════════════════════════════════╝
  `)
})

// WebSocket服务（用于实时通信）
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : false,
    methods: ['GET', 'POST']
  }
})

io.on('connection', (socket) => {
  console.log('✓ 客户端连接:', socket.id)
  
  socket.on('join', (userId) => {
    socket.join(`user:${userId}`)
    console.log(`用户 ${userId} 加入房间`)
  })
  
  socket.on('disconnect', () => {
    console.log('✗ 客户端断开:', socket.id)
  })
})

// 优雅退出
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，准备关闭服务器...')
  server.close(() => {
    console.log('服务器已关闭')
    sequelize.close()
    process.exit(0)
  })
})

module.exports = { app, server, io, sequelize }
