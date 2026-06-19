const express = require('express')
const router = express.Router()
const { query } = require('../config/database')

// 获取职位列表
router.get('/jobs', async (req, res) => {
  try {
    const { page = 1, limit = 20, keyword, status } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = 'WHERE 1=1'
    const params = []
    
    if (keyword) {
      whereClause += ' AND title LIKE ?'
      params.push(`%${keyword}%`)
    }
    
    if (status) {
      whereClause += ' AND status = ?'
      params.push(status)
    }
    
    const jobs = await query(
      `SELECT * FROM boss_jobs ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    )
    
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM boss_jobs ${whereClause}`,
      params
    )
    
    res.json({
      code: 200,
      data: {
        list: jobs,
        total: totalResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 添加职位
router.post('/jobs', async (req, res) => {
  try {
    const { title, company, location, salary, description, requirements, status } = req.body
    
    await query(
      `INSERT INTO boss_jobs (title, company, location, salary, description, requirements, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [title, company, location, salary, description, requirements, status]
    )
    
    res.json({ code: 200, message: '添加成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 更新职位
router.put('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, company, location, salary, description, requirements, status } = req.body
    
    await query(
      `UPDATE boss_jobs 
       SET title = ?, company = ?, location = ?, salary = ?, description = ?, requirements = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [title, company, location, salary, description, requirements, status, id]
    )
    
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 删除职位
router.delete('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await query('DELETE FROM boss_jobs WHERE id = ?', [id])
    
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 获取候选人列表
router.get('/candidates', async (req, res) => {
  try {
    const { page = 1, limit = 20, keyword, status } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = 'WHERE 1=1'
    const params = []
    
    if (keyword) {
      whereClause += ' AND name LIKE ?'
      params.push(`%${keyword}%`)
    }
    
    if (status) {
      whereClause += ' AND status = ?'
      params.push(status)
    }
    
    const candidates = await query(
      `SELECT * FROM boss_candidates ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    )
    
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM boss_candidates ${whereClause}`,
      params
    )
    
    res.json({
      code: 200,
      data: {
        list: candidates,
        total: totalResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 添加候选人
router.post('/candidates', async (req, res) => {
  try {
    const { name, phone, email, resume_url, job_id, status } = req.body
    
    await query(
      `INSERT INTO boss_candidates (name, phone, email, resume_url, job_id, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [name, phone, email, resume_url, job_id, status]
    )
    
    res.json({ code: 200, message: '添加成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 更新候选人
router.put('/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, phone, email, resume_url, job_id, status } = req.body
    
    await query(
      `UPDATE boss_candidates 
       SET name = ?, phone = ?, email = ?, resume_url = ?, job_id = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [name, phone, email, resume_url, job_id, status, id]
    )
    
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 删除候选人
router.delete('/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await query('DELETE FROM boss_candidates WHERE id = ?', [id])
    
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 获取聊天记录
router.get('/chats', async (req, res) => {
  try {
    const { candidate_id } = req.query
    
    let whereClause = 'WHERE 1=1'
    const params = []
    
    if (candidate_id) {
      whereClause += ' AND candidate_id = ?'
      params.push(candidate_id)
    }
    
    const chats = await query(
      `SELECT * FROM boss_chats ${whereClause} ORDER BY created_at ASC`,
      params
    )
    
    res.json({
      code: 200,
      data: chats
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 添加聊天记录
router.post('/chats', async (req, res) => {
  try {
    const { candidate_id, message, sender } = req.body
    
    await query(
      `INSERT INTO boss_chats (candidate_id, message, sender, created_at)
       VALUES (?, ?, ?, datetime('now'))`,
      [candidate_id, message, sender]
    )
    
    res.json({ code: 200, message: '添加成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

module.exports = router
