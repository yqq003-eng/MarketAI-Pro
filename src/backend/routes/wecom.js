const express = require('express')
const router = express.Router()
const { query } = require('../config/database')

// 获取客户列表
router.get('/customers', async (req, res) => {
  try {
    const { page = 1, limit = 20, tag, keyword } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = 'WHERE 1=1'
    const params = []
    
    if (tag) {
      whereClause += ' AND tags LIKE ?'
      params.push(`%${tag}%`)
    }
    
    if (keyword) {
      whereClause += ' AND (name LIKE ? OR company LIKE ?)'
      params.push(`%${keyword}%`, `%${keyword}%`)
    }
    
    const customers = await query(
      `SELECT * FROM wecom_customers ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    )
    
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM wecom_customers ${whereClause}`,
      params
    )
    
    res.json({
      code: 200,
      data: {
        list: customers,
        total: totalResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 添加客户
router.post('/customers', async (req, res) => {
  try {
    const { name, phone, company, tags, owner } = req.body
    
    await query(
      `INSERT INTO wecom_customers (name, phone, company, tags, owner, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [name, phone, company, tags, owner]
    )
    
    res.json({ code: 200, message: '添加成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 更新客户
router.put('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, phone, company, tags, owner } = req.body
    
    await query(
      `UPDATE wecom_customers 
       SET name = ?, phone = ?, company = ?, tags = ?, owner = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [name, phone, company, tags, owner, id]
    )
    
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 删除客户
router.delete('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await query('DELETE FROM wecom_customers WHERE id = ?', [id])
    
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 获取群列表
router.get('/groups', async (req, res) => {
  try {
    const { page = 1, limit = 20, keyword } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = 'WHERE 1=1'
    const params = []
    
    if (keyword) {
      whereClause += ' AND name LIKE ?'
      params.push(`%${keyword}%`)
    }
    
    const groups = await query(
      `SELECT * FROM wecom_groups ${whereClause} ORDER BY member_count DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    )
    
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM wecom_groups ${whereClause}`,
      params
    )
    
    res.json({
      code: 200,
      data: {
        list: groups,
        total: totalResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 创建群
router.post('/groups', async (req, res) => {
  try {
    const { name, owner, member_count, status } = req.body
    
    await query(
      `INSERT INTO wecom_groups (name, owner, member_count, status, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [name, owner, member_count, status]
    )
    
    res.json({ code: 200, message: '创建成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 更新群
router.put('/groups/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, owner, member_count, status } = req.body
    
    await query(
      `UPDATE wecom_groups 
       SET name = ?, owner = ?, member_count = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [name, owner, member_count, status, id]
    )
    
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 删除群
router.delete('/groups/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await query('DELETE FROM wecom_groups WHERE id = ?', [id])
    
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 获取消息群发任务
router.get('/mass-messages', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = 'WHERE 1=1'
    const params = []
    
    if (status) {
      whereClause += ' AND status = ?'
      params.push(status)
    }
    
    const tasks = await query(
      `SELECT * FROM wecom_mass_messages ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    )
    
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM wecom_mass_messages ${whereClause}`,
      params
    )
    
    res.json({
      code: 200,
      data: {
        list: tasks,
        total: totalResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 创建消息群发任务
router.post('/mass-messages', async (req, res) => {
  try {
    const { title, content, target_type, target_tags, send_time, status } = req.body
    
    await query(
      `INSERT INTO wecom_mass_messages (title, content, target_type, target_tags, send_time, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [title, content, target_type, target_tags, send_time, status]
    )
    
    res.json({ code: 200, message: '创建成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 更新消息群发任务
router.put('/mass-messages/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, target_type, target_tags, send_time, status } = req.body
    
    await query(
      `UPDATE wecom_mass_messages 
       SET title = ?, content = ?, target_type = ?, target_tags = ?, send_time = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [title, content, target_type, target_tags, send_time, status, id]
    )
    
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 删除消息群发任务
router.delete('/mass-messages/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await query('DELETE FROM wecom_mass_messages WHERE id = ?', [id])
    
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 获取自动回复规则
router.get('/auto-replies', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = 'WHERE 1=1'
    const params = []
    
    if (status !== undefined) {
      whereClause += ' AND status = ?'
      params.push(status)
    }
    
    const rules = await query(
      `SELECT * FROM wecom_auto_replies ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    )
    
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM wecom_auto_replies ${whereClause}`,
      params
    )
    
    res.json({
      code: 200,
      data: {
        list: rules,
        total: totalResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 创建自动回复规则
router.post('/auto-replies', async (req, res) => {
  try {
    const { name, keywords, reply_type, reply_content, status } = req.body
    
    await query(
      `INSERT INTO wecom_auto_replies (name, keywords, reply_type, reply_content, status, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [name, keywords, reply_type, reply_content, status]
    )
    
    res.json({ code: 200, message: '创建成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 更新自动回复规则
router.put('/auto-replies/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, keywords, reply_type, reply_content, status } = req.body
    
    await query(
      `UPDATE wecom_auto_replies 
       SET name = ?, keywords = ?, reply_type = ?, reply_content = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [name, keywords, reply_type, reply_content, status, id]
    )
    
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 删除自动回复规则
router.delete('/auto-replies/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await query('DELETE FROM wecom_auto_replies WHERE id = ?', [id])
    
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 获取客户标签
router.get('/customer-tags', async (req, res) => {
  try {
    const tags = await query('SELECT * FROM wecom_customer_tags ORDER BY created_at DESC')
    
    res.json({ code: 200, data: tags })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 创建客户标签
router.post('/customer-tags', async (req, res) => {
  try {
    const { name, color, description } = req.body
    
    await query(
      `INSERT INTO wecom_customer_tags (name, color, description, created_at)
       VALUES (?, ?, ?, datetime('now'))`,
      [name, color, description]
    )
    
    res.json({ code: 200, message: '创建成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 更新客户标签
router.put('/customer-tags/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, color, description } = req.body
    
    await query(
      `UPDATE wecom_customer_tags 
       SET name = ?, color = ?, description = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [name, color, description, id]
    )
    
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 删除客户标签
router.delete('/customer-tags/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await query('DELETE FROM wecom_customer_tags WHERE id = ?', [id])
    
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 获取员工列表
router.get('/employees', async (req, res) => {
  try {
    const { page = 1, limit = 20, department, keyword } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = 'WHERE 1=1'
    const params = []
    
    if (department) {
      whereClause += ' AND department = ?'
      params.push(department)
    }
    
    if (keyword) {
      whereClause += ' AND (name LIKE ? OR position LIKE ?)'
      params.push(`%${keyword}%`, `%${keyword}%`)
    }
    
    const employees = await query(
      `SELECT * FROM wecom_employees ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    )
    
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM wecom_employees ${whereClause}`,
      params
    )
    
    res.json({
      code: 200,
      data: {
        list: employees,
        total: totalResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 添加员工
router.post('/employees', async (req, res) => {
  try {
    const { name, position, department, phone, email, status } = req.body
    
    await query(
      `INSERT INTO wecom_employees (name, position, department, phone, email, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [name, position, department, phone, email, status]
    )
    
    res.json({ code: 200, message: '添加成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 更新员工
router.put('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, position, department, phone, email, status } = req.body
    
    await query(
      `UPDATE wecom_employees 
       SET name = ?, position = ?, department = ?, phone = ?, email = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [name, position, department, phone, email, status, id]
    )
    
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 删除员工
router.delete('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await query('DELETE FROM wecom_employees WHERE id = ?', [id])
    
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 获取数据统计
router.get('/statistics', async (req, res) => {
  try {
    const { start_date, end_date } = req.query
    
    // 客户增长趋势
    const customerTrend = await query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM wecom_customers
       WHERE DATE(created_at) BETWEEN ? AND ?
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [start_date, end_date]
    )
    
    // 群活跃度
    const groupActivity = await query(
      `SELECT name, member_count, message_count
       FROM wecom_groups
       ORDER BY message_count DESC
       LIMIT 10`
    )
    
    // 消息群发效果
    const massMessageStats = await query(
      `SELECT status, COUNT(*) as count
       FROM wecom_mass_messages
       WHERE DATE(created_at) BETWEEN ? AND ?
       GROUP BY status`,
      [start_date, end_date]
    )
    
    // 汇总数据
    const summary = await query(
      `SELECT 
        (SELECT COUNT(*) FROM wecom_customers) as total_customers,
        (SELECT COUNT(*) FROM wecom_groups) as total_groups,
        (SELECT COUNT(*) FROM wecom_employees WHERE status = 'active') as active_employees,
        (SELECT COUNT(*) FROM wecom_mass_messages WHERE status = 'sent') as sent_messages`
    )
    
    res.json({
      code: 200,
      data: {
        customer_trend: customerTrend,
        group_activity: groupActivity,
        mass_message_stats: massMessageStats,
        summary: summary[0]
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

module.exports = router
