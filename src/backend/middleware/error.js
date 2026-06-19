const { Sequelize } = require('sequelize')

/**
 * 错误处理中间件
 * 统一处理应用中的错误
 */
const errorHandler = (err, req, res, next) => {
  console.error('错误详情:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query
  })

  // Sequelize 验证错误
  if (err instanceof Sequelize.ValidationError) {
    return res.status(400).json({
      code: 400,
      message: '数据验证失败',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }))
    })
  }

  // Sequelize 唯一约束错误
  if (err instanceof Sequelize.UniqueConstraintError) {
    return res.status(409).json({
      code: 409,
      message: '数据已存在',
      errors: err.errors.map(e => ({
        field: e.path,
        message: `${e.path} 已存在`
      }))
    })
  }

  // Sequelize 外键约束错误
  if (err instanceof Sequelize.ForeignKeyConstraintError) {
    return res.status(400).json({
      code: 400,
      message: '关联数据不存在',
      field: err.fields
    })
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 401,
      message: 'token无效'
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 401,
      message: 'token已过期'
    })
  }

  // Express-validator 错误
  if (err.type === 'validation') {
    return res.status(400).json({
      code: 400,
      message: '输入验证失败',
      errors: err.errors
    })
  }

  // 文件上传错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      code: 400,
      message: '文件大小超出限制'
    })
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      code: 400,
      message: '文件数量超出限制'
    })
  }

  // 自定义业务错误
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
      data: err.data
    })
  }

  // 默认服务器错误
  const statusCode = err.status || 500
  const message = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误' 
    : err.message || '服务器内部错误'

  res.status(statusCode).json({
    code: statusCode,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

/**
 * 404 错误处理
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    code: 404,
    message: `无法找到 ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  })
}

/**
 * 异步错误捕获包装器
 * 自动捕获async函数的错误并传递给错误处理中间件
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * 创建业务错误
 * @param {number} statusCode - HTTP状态码
 * @param {string} message - 错误信息
 * @param {any} data - 额外数据
 */
const createError = (statusCode, message, data = null) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.data = data
  return error
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  createError
}
