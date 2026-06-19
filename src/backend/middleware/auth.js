const jwt = require('jsonwebtoken')
const { models } = require('../models')

/**
 * 认证中间件
 * 验证请求头中的JWT token
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 获取token
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证token'
      })
    }

    const token = authHeader.split(' ')[1]

    // 验证token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'marketai-secret-key')
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          code: 401,
          message: 'token已过期，请重新登录'
        })
      }
      return res.status(401).json({
        code: 401,
        message: 'token无效'
      })
    }

    // 查询用户
    const user = await models.User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    })

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户不存在'
      })
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        code: 403,
        message: '账号已被禁用'
      })
    }

    // 将用户信息附加到请求对象
    req.user = user
    req.userId = user.id
    req.userRole = user.role

    // 记录API访问日志
    console.log(`[API] ${req.method} ${req.path} - User: ${user.username}`)

    next()
  } catch (error) {
    console.error('认证中间件错误:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    })
  }
}

/**
 * 权限检查中间件
 * @param {string|Array} permissions - 需要的权限
 */
const permissionMiddleware = (permissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        code: 401,
        message: '未认证'
      })
    }

    // 管理员拥有所有权限
    if (req.user.role === 'admin' || req.user.permissions.includes('*')) {
      return next()
    }

    // 检查权限
    const userPermissions = req.user.permissions || []
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions]

    const hasPermission = requiredPermissions.some(perm => userPermissions.includes(perm))

    if (!hasPermission) {
      return res.status(403).json({
        code: 403,
        message: '权限不足'
      })
    }

    next()
  }
}

/**
 * 角色检查中间件
 * @param {string|Array} roles - 需要的角色
 */
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        code: 401,
        message: '未认证'
      })
    }

    const userRole = req.user.role
    const allowedRoles = Array.isArray(roles) ? roles : [roles]

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        code: 403,
        message: '角色权限不足'
      })
    }

    next()
  }
}

module.exports = {
  authMiddleware,
  permissionMiddleware,
  roleMiddleware
}
