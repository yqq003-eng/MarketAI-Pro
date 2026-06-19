const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')

// 初始化Express应用
const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(helmet({
  contentSecurityPolicy: false // 开发环境禁用CSP
}))
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

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

// 模拟API路由（返回示例数据）
app.get('/api/health', (req, res) => {
  res.json({
    code: 200,
    message: 'MarketAI Pro API 运行正常',
    data: {
      version: '1.0.0',
      modules: [
        '短视频矩阵',
        '智能获客',
        '企业微信运营',
        '数字人短视频',
        'BOSS招聘自动化',
        '法务智能',
        '企业智库',
        '系统管理'
      ]
    }
  })
})

// 模拟用户登录
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  if (username === 'admin' && password === 'admin123') {
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token: 'mock-jwt-token-12345',
        user: {
          id: 1,
          username: 'admin',
          name: '管理员',
          role: 'admin'
        }
      }
    })
  } else {
    res.json({
      code: 401,
      message: '用户名或密码错误'
    })
  }
})

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '请求的资源不存在',
    path: req.path
  })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err)
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

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

// 优雅退出
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，准备关闭服务器...')
  server.close(() => {
    console.log('服务器已关闭')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，准备关闭服务器...')
  server.close(() => {
    console.log('服务器已关闭')
    process.exit(0)
  })
})
