const express = require('express')
const router = express.Router()
const { models } = require('../models')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: '输入验证失败',
        errors: errors.array()
      })
    }

    const { username, password } = req.body

    // 查找用户
    const user = await models.User.findOne({
      where: {
        [ Sequelize.Op.or]: [
          { username: username },
          { email: username }
        ]
      }
    })

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      })
    }

    // 验证密码
    const isValidPassword = await user.validatePassword(password)
    if (!isValidPassword) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      })
    }

    // 检查账号状态
    if (user.status !== 'active') {
      return res.status(403).json({
        code: 403,
        message: '账号已被禁用，请联系管理员'
      })
    }

    // 更新最后登录信息
    await user.update({
      last_login_at: new Date(),
      last_login_ip: req.ip
    })

    // 生成JWT token
    const token = user.generateToken()

    // 返回用户信息（不包含密码）
    const userData = user.toJSON()
    delete userData.password

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: userData
      }
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    })
  }
})

/**
 * POST /api/auth/logout
 * 用户登出
 */
router.post('/logout', (req, res) => {
  // 前端负责删除token
  res.json({
    code: 200,
    message: '登出成功'
  })
})

/**
 * POST /api/auth/refresh
 * 刷新token
 */
router.post('/refresh', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供token'
      })
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'marketai-secret-key')
    
    // 获取用户信息
    const user = await models.User.findByPk(decoded.id)
    
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        code: 401,
        message: '用户不存在或已被禁用'
      })
    }

    // 生成新token
    const newToken = user.generateToken()

    res.json({
      code: 200,
      message: 'token刷新成功',
      data: {
        token: newToken
      }
    })
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: 'token已过期'
      })
    }
    
    return res.status(401).json({
      code: 401,
      message: 'token无效'
    })
  }
})

/**
 * POST /api/auth/register
 * 用户注册（需要激活码）
 */
router.post('/register', [
  body('username').isLength({ min: 3, max: 50 }).withMessage('用户名长度3-50字符'),
  body('email').isEmail().withMessage('邮箱格式不正确'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
  body('activation_code').notEmpty().withMessage('激活码不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: '输入验证失败',
        errors: errors.array()
      })
    }

    const { username, email, password, activation_code, name } = req.body

    // 检查用户名是否已存在
    const existingUser = await models.User.findOne({
      where: {
        [ Sequelize.Op.or]: [
          { username: username },
          { email: email }
        ]
      }
    })

    if (existingUser) {
      return res.status(400).json({
        code: 400,
        message: '用户名或邮箱已被注册'
      })
    }

    // 验证激活码
    const codeRecord = await models.ActivationCode.findOne({
      where: {
        code: activation_code,
        status: 'unused'
      }
    })

    if (!codeRecord) {
      return res.status(400).json({
        code: 400,
        message: '激活码无效或已被使用'
      })
    }

    // 创建用户
    const user = await models.User.create({
      username,
      email,
      password,
      name: name || username,
      role: 'user',
      status: 'active'
    })

    // 标记激活码已使用
    await codeRecord.update({
      status: 'used',
      used_by: user.id,
      used_at: new Date()
    })

    res.status(201).json({
      code: 201,
      message: '注册成功',
      data: {
        user_id: user.id
      }
    })
  } catch (error) {
    console.error('注册失败:', error)
    res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    })
  }
})

module.exports = router
