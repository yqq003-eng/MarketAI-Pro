const { sequelize, syncDatabase } = require('../src/backend/models')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

/**
 * 数据库初始化脚本
 * 创建初始数据：管理员账号、示例部门、激活码等
 */
const initDatabase = async () => {
  try {
    console.log('开始初始化数据库...')
    
    // 同步数据库模型
    await syncDatabase(true) // force = true, 会删除现有数据
    
    console.log('✓ 数据库表结构创建完成')
    
    const { models } = require('../src/backend/models')
    const { User, Department, ActivationCode } = models
    
    // 1. 创建默认部门
    console.log('创建默认部门...')
    const salesDept = await Department.create({
      name: '销售部',
      description: '负责市场推广和客户对接',
      parent_id: null,
      sort_order: 1
    })
    
    const techDept = await Department.create({
      name: '技术部',
      description: '负责产品研发和技术支持',
      parent_id: null,
      sort_order: 2
    })
    
    const marketingDept = await Department.create({
      name: '市场部',
      description: '负责品牌推广和内容创作',
      parent_id: null,
      sort_order: 3
    })
    
    console.log('✓ 默认部门创建完成')
    
    // 2. 创建管理员账号
    console.log('创建管理员账号...')
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@marketai.com',
      password: 'admin123', // 会被自动加密
      name: '系统管理员',
      phone: '13800138000',
      role: 'admin',
      status: 'active',
      department_id: techDept.id,
      permissions: ['*'], // 所有权限
      settings: {
        theme: 'dark',
        language: 'zh-CN',
        notifications: true
      }
    })
    
    console.log('✓ 管理员账号创建完成')
    console.log('   用户名: admin')
    console.log('   密码: admin123')
    console.log('   ⚠️ 请及时修改默认密码！')
    
    // 3. 创建测试用户
    console.log('创建测试用户...')
    const testUsers = await User.bulkCreate([
      {
        username: 'marketer',
        email: 'marketer@marketai.com',
        password: 'test123',
        name: '市场专员',
        phone: '13800138001',
        role: 'user',
        status: 'active',
        department_id: marketingDept.id,
        permissions: ['video:read', 'video:create', 'wechat:read', 'wechat:write']
      },
      {
        username: 'sales',
        email: 'sales@marketai.com',
        password: 'test123',
        name: '销售代表',
        phone: '13800138002',
        role: 'user',
        status: 'active',
        department_id: salesDept.id,
        permissions: ['wechat:read', 'wechat:write', 'boss:read', 'boss:write']
      },
      {
        username: 'viewer',
        email: 'viewer@marketai.com',
        password: 'test123',
        name: '数据分析师',
        phone: '13800138003',
        role: 'user',
        status: 'active',
        department_id: null,
        permissions: ['video:read', 'wechat:read', 'analytics:read']
      }
    ])
    
    console.log('✓ 测试用户创建完成')
    
    // 4. 生成示例激活码
    console.log('生成示例激活码...')
    const activationCodes = []
    for (let i = 0; i < 10; i++) {
      activationCodes.push({
        code: uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase(),
        type: i < 5 ? 'trial' : 'official',
        status: 'unused',
        created_by: adminUser.id,
        max_uses: 1,
        notes: i < 5 ? '试用版激活码' : '正式版激活码'
      })
    }
    
    await ActivationCode.bulkCreate(activationCodes)
    
    console.log('✓ 示例激活码生成完成')
    console.log('   已生成 5 个试用版激活码')
    console.log('   已生成 5 个正式版激活码')
    
    // 5. 创建示例视频数据（可选）
    console.log('创建示例数据...')
    const { Video } = models
    
    await Video.bulkCreate([
      {
        user_id: adminUser.id,
        title: '示例视频1 - 产品介绍',
        description: '这是第一个示例视频',
        file_path: '/uploads/videos/demo1.mp4',
        file_size: 1024000,
        duration: 120,
        resolution: '1920x1080',
        thumbnail: '/uploads/thumbnails/demo1.jpg',
        platform: ['douyin', 'xiaohongshu'],
        status: 'published',
        published_at: new Date(),
        play_count: 1234,
        like_count: 89,
        comment_count: 23,
        share_count: 12,
        tags: ['产品介绍', '营销']
      },
      {
        user_id: testUsers[0].id,
        title: '示例视频2 - 教程分享',
        description: '这是第二个示例视频',
        file_path: '/uploads/videos/demo2.mp4',
        file_size: 2048000,
        duration: 180,
        resolution: '1920x1080',
        thumbnail: '/uploads/thumbnails/demo2.jpg',
        platform: ['douyin'],
        status: 'ready',
        tags: ['教程', '分享']
      }
    ])
    
    console.log('✓ 示例数据创建完成')
    
    // 完成
    console.log(`
╔══════════════════════════════════════════╗
║     数据库初始化完成！                     ║
╠══════════════════════════════════════════╣
║  管理员账号:                                  ║
║    用户名: admin                            ║
║    密码:   admin123                        ║
║                                          ║
║  ⚠️ 请尽快登录并修改默认密码！              ║
╚══════════════════════════════════════════╝
    `)
    
    process.exit(0)
  } catch (error) {
    console.error('✗ 数据库初始化失败:', error)
    process.exit(1)
  }
}

// 执行初始化
initDatabase()
