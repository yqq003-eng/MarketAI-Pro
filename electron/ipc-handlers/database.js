const { ipcMain } = require('electron')
const { sequelize } = require('../../src/backend/models')

/**
 * 数据库查询IPC处理
 */
ipcMain.handle('db:query', async (event, sql, params = []) => {
  try {
    const [results, metadata] = await sequelize.query(sql, {
      replacements: params,
      type: sequelize.QueryTypes.SELECT
    })
    return { success: true, data: results }
  } catch (error) {
    console.error('数据库查询失败:', error)
    return { success: false, error: error.message }
  }
})

/**
 * 数据库执行IPC处理
 */
ipcMain.handle('db:execute', async (event, sql, params = []) => {
  try {
    const [results, metadata] = await sequelize.query(sql, {
      replacements: params,
      type: sequelize.QueryTypes.INSERT || sequelize.QueryTypes.UPDATE || sequelize.QueryTypes.DELETE
    })
    return { success: true, data: results, affectedRows: metadata }
  } catch (error) {
    console.error('数据库执行失败:', error)
    return { success: false, error: error.message }
  }
})

/**
 * 数据库同步IPC处理
 */
ipcMain.handle('db:sync', async (event, force = false) => {
  try {
    await sequelize.sync({ force, alter: true })
    return { success: true, message: '数据库同步成功' }
  } catch (error) {
    console.error('数据库同步失败:', error)
    return { success: false, error: error.message }
  }
})

/**
 * 数据库备份IPC处理
 */
ipcMain.handle('db:backup', async (event, backupPath) => {
  try {
    const fs = require('fs')
    const path = require('path')
    const dbPath = path.join(__dirname, '../../../database/marketai.db')
    const backupDir = path.dirname(backupPath)
    
    // 确保备份目录存在
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    // 复制数据库文件
    fs.copyFileSync(dbPath, backupPath)
    
    return { success: true, message: '数据库备份成功', path: backupPath }
  } catch (error) {
    console.error('数据库备份失败:', error)
    return { success: false, error: error.message }
  }
})

/**
 * 数据库恢复IPC处理
 */
ipcMain.handle('db:restore', async (event, backupPath) => {
  try {
    const fs = require('fs')
    const path = require('path')
    const dbPath = path.join(__dirname, '../../../database/marketai.db')
    
    // 检查备份文件是否存在
    if (!fs.existsSync(backupPath)) {
      return { success: false, error: '备份文件不存在' }
    }
    
    // 关闭数据库连接
    await sequelize.close()
    
    // 恢复数据库文件
    fs.copyFileSync(backupPath, dbPath)
    
    // 重新连接数据库
    await sequelize.authenticate()
    
    return { success: true, message: '数据库恢复成功' }
  } catch (error) {
    console.error('数据库恢复失败:', error)
    return { success: false, error: error.message }
  }
})

module.exports = {
  // IPC处理器已注册
}
