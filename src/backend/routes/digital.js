const express = require('express')
const router = express.Router()
const { query } = require('../config/database')

// 获取声音定制列表
router.get('/voices', async (req, res) => {
  try {
    const { page = 1, limit = 20, keyword } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = 'WHERE 1=1'
    const params = []
    
    if (keyword) {
      whereClause += ' AND name LIKE ?'
      params.push(`%${keyword}%`)
    }
    
    const voices = await query(
      `SELECT * FROM digital_voices ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    )
    
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM digital_voices ${whereClause}`,
      params
    )
    
    res.json({
      code: 200,
      data: {
        list: voices,
        total: totalResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 添加声音定制
router.post('/voices', async (req, res) => {
  try {
    const { name, gender, age, style, sample_url, status } = req.body
    
    await query(
      `INSERT INTO digital_voices (name, gender, age, style, sample_url, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [name, gender, age, style, sample_url, status]
    )
    
    res.json({ code: 200, message: '添加成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 更新声音定制
router.put('/voices/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, gender, age, style, sample_url, status } = req.body
    
    await query(
      `UPDATE digital_voices 
       SET name = ?, gender = ?, age = ?, style = ?, sample_url = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [name, gender, age, style, sample_url, status, id]
    )
    
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 删除声音定制
router.delete('/voices/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await query('DELETE FROM digital_voices WHERE id = ?', [id])
    
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 获取形象定制列表
router.get('/avatars', async (req, res) => {
  try {
    const { page = 1, limit = 20, keyword } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = 'WHERE 1=1'
    const params = []
    
    if (keyword) {
      whereClause += ' AND name LIKE ?'
      params.push(`%${keyword}%`)
    }
    
    const avatars = await query(
      `SELECT * FROM digital_avatars ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    )
    
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM digital_avatars ${whereClause}`,
      params
    )
    
    res.json({
      code: 200,
      data: {
        list: avatars,
        total: totalResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 添加形象定制
router.post('/avatars', async (req, res) => {
  try {
    const { name, gender, age_range, style, photo_url, model_url, status } = req.body
    
    await query(
      `INSERT INTO digital_avatars (name, gender, age_range, style, photo_url, model_url, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [name, gender, age_range, style, photo_url, model_url, status]
    )
    
    res.json({ code: 200, message: '添加成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 更新形象定制
router.put('/avatars/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, gender, age_range, style, photo_url, model_url, status } = req.body
    
    await query(
      `UPDATE digital_avatars 
       SET name = ?, gender = ?, age_range = ?, style = ?, photo_url = ?, model_url = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [name, gender, age_range, style, photo_url, model_url, status, id]
    )
    
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 删除形象定制
router.delete('/avatars/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await query('DELETE FROM digital_avatars WHERE id = ?', [id])
    
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 获取数字人精剪列表
router.get('/refines', async (req, res) => {
  try {
    const { page = 1, limit = 20, keyword } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = 'WHERE 1=1'
    const params = []
    
    if (keyword) {
      whereClause += ' AND title LIKE ?'
      params.push(`%${keyword}%`)
    }
    
    const refines = await query(
      `SELECT * FROM digital_refines ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    )
    
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM digital_refines ${whereClause}`,
      params
    )
    
    res.json({
      code: 200,
      data: {
        list: refines,
        total: totalResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 添加数字人精剪
router.post('/refines', async (req, res) => {
  try {
    const { title, voice_id, avatar_id, script, video_url, duration, status } = req.body
    
    await query(
      `INSERT INTO digital_refines (title, voice_id, avatar_id, script, video_url, duration, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [title, voice_id, avatar_id, script, video_url, duration, status]
    )
    
    res.json({ code: 200, message: '添加成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 更新数字人精剪
router.put('/refines/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, voice_id, avatar_id, script, video_url, duration, status } = req.body
    
    await query(
      `UPDATE digital_refines 
       SET title = ?, voice_id = ?, avatar_id = ?, script = ?, video_url = ?, duration = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [title, voice_id, avatar_id, script, video_url, duration, status, id]
    )
    
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 删除数字人精剪
router.delete('/refines/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await query('DELETE FROM digital_refines WHERE id = ?', [id])
    
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 获取精剪库列表
router.get('/refine-library', async (req, res) => {
  try {
    const { page = 1, limit = 20, keyword, category } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = 'WHERE 1=1'
    const params = []
    
    if (keyword) {
      whereClause += ' AND title LIKE ?'
      params.push(`%${keyword}%`)
    }
    
    if (category) {
      whereClause += ' AND category = ?'
      params.push(category)
    }
    
    const library = await query(
      `SELECT * FROM digital_refine_library ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    )
    
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM digital_refine_library ${whereClause}`,
      params
    )
    
    res.json({
      code: 200,
      data: {
        list: library,
        total: totalResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 添加精剪库
router.post('/refine-library', async (req, res) => {
  try {
    const { title, category, description, template_url, thumbnail } = req.body
    
    await query(
      `INSERT INTO digital_refine_library (title, category, description, template_url, thumbnail, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [title, category, description, template_url, thumbnail]
    )
    
    res.json({ code: 200, message: '添加成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 更新精剪库
router.put('/refine-library/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, category, description, template_url, thumbnail } = req.body
    
    await query(
      `UPDATE digital_refine_library 
       SET title = ?, category = ?, description = ?, template_url = ?, thumbnail = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [title, category, description, template_url, thumbnail, id]
    )
    
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 删除精剪库
router.delete('/refine-library/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await query('DELETE FROM digital_refine_library WHERE id = ?', [id])
    
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 获取视频生成列表
router.get('/generations', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = 'WHERE 1=1'
    const params = []
    
    if (status) {
      whereClause += ' AND status = ?'
      params.push(status)
    }
    
    const generations = await query(
      `SELECT * FROM digital_generations ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    )
    
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM digital_generations ${whereClause}`,
      params
    )
    
    res.json({
      code: 200,
      data: {
        list: generations,
        total: totalResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 创建视频生成任务
router.post('/generations', async (req, res) => {
  try {
    const { title, voice_id, avatar_id, script, duration, output_format, status } = req.body
    
    await query(
      `INSERT INTO digital_generations (title, voice_id, avatar_id, script, duration, output_format, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [title, voice_id, avatar_id, script, duration, output_format, status]
    )
    
    res.json({ code: 200, message: '创建成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 更新视频生成任务
router.put('/generations/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, voice_id, avatar_id, script, duration, output_format, status, output_url } = req.body
    
    await query(
      `UPDATE digital_generations 
       SET title = ?, voice_id = ?, avatar_id = ?, script = ?, duration = ?, output_format = ?, status = ?, output_url = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [title, voice_id, avatar_id, script, duration, output_format, status, output_url, id]
    )
    
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 删除视频生成任务
router.delete('/generations/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await query('DELETE FROM digital_generations WHERE id = ?', [id])
    
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

module.exports = router
