const express = require('express')
const router = express.Router()
const { query } = require('../config/database')

// 获取法务咨询列表
router.get('/consults', async (req, res) => {
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
    
    const consults = await query(
      `SELECT * FROM legal_consults ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    )
    
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM legal_consults ${whereClause}`,
      params
    )
    
    res.json({
      code: 200,
      data: {
        list: consults,
        total: totalResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 添加法务咨询
router.post('/consults', async (req, res) => {
  try {
    const { title, category, content, status } = req.body
    
    await query(
      `INSERT INTO legal_consults (title, category, content, status, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [title, category, content, status]
    )
    
    res.json({ code: 200, message: '添加成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 更新法务咨询
router.put('/consults/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, category, content, answer, status } = req.body
    
    await query(
      `UPDATE legal_consults 
       SET title = ?, category = ?, content = ?, answer = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [title, category, content, answer, status, id]
    )
    
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 删除法务咨询
router.delete('/consults/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await query('DELETE FROM legal_consults WHERE id = ?', [id])
    
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 获取法务检索列表
router.get('/searches', async (req, res) => {
  try {
    const { page = 1, limit = 20, keyword } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = 'WHERE 1=1'
    const params = []
    
    if (keyword) {
      whereClause += ' AND keyword LIKE ?'
      params.push(`%${keyword}%`)
    }
    
    const searches = await query(
      `SELECT * FROM legal_searches ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    )
    
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM legal_searches ${whereClause}`,
      params
    )
    
    res.json({
      code: 200,
      data: {
        list: searches,
        total: totalResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 添加法务检索
router.post('/searches', async (req, res) => {
  try {
    const { keyword, category, result_count } = req.body
    
    await query(
      `INSERT INTO legal_searches (keyword, category, result_count, created_at)
       VALUES (?, ?, ?, datetime('now'))`,
      [keyword, category, result_count]
    )
    
    res.json({ code: 200, message: '添加成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 删除法务检索
router.delete('/searches/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await query('DELETE FROM legal_searches WHERE id = ?', [id])
    
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 获取合同审查列表
router.get('/contracts', async (req, res) => {
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
    
    const contracts = await query(
      `SELECT * FROM contract_reviews ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    )
    
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM contract_reviews ${whereClause}`,
      params
    )
    
    res.json({
      code: 200,
      data: {
        list: contracts,
        total: totalResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 添加合同审查
router.post('/contracts', async (req, res) => {
  try {
    const { title, contract_type, file_url, content, status } = req.body
    
    await query(
      `INSERT INTO contract_reviews (title, contract_type, file_url, content, status, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [title, contract_type, file_url, content, status]
    )
    
    res.json({ code: 200, message: '添加成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 更新合同审查
router.put('/contracts/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, contract_type, file_url, content, issues, suggestions, status } = req.body
    
    await query(
      `UPDATE contract_reviews 
       SET title = ?, contract_type = ?, file_url = ?, content = ?, issues = ?, suggestions = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [title, contract_type, file_url, content, issues, suggestions, status, id]
    )
    
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 删除合同审查
router.delete('/contracts/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await query('DELETE FROM contract_reviews WHERE id = ?', [id])
    
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

module.exports = router
