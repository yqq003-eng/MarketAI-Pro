<template>
  <div class="statistics-container">
    <div class="page-header">
      <h2>系统统计</h2>
      <el-button type="primary" @click="refreshStatistics">刷新</el-button>
    </div>

    <div class="statistics-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ statistics.userCount || 0 }}</div>
            <div class="stat-label">用户总数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ statistics.activeUserCount || 0 }}</div>
            <div class="stat-label">激活用户</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ statistics.roleCount || 0 }}</div>
            <div class="stat-label">角色总数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ statistics.configCount || 0 }}</div>
            <div class="stat-label">配置总数</div>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ statistics.logCount || 0 }}</div>
            <div class="stat-label">日志总数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ statistics.unreadNotificationCount || 0 }}</div>
            <div class="stat-label">未读通知</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-container">
            <h3>最近操作日志</h3>
            <el-table :data="statistics.recentLogs || []" style="width: 100%">
              <el-table-column prop="action" label="操作动作" min-width="150"></el-table-column>
              <el-table-column prop="module" label="操作模块" width="120"></el-table-column>
              <el-table-column prop="userId" label="操作用户" width="120"></el-table-column>
              <el-table-column prop="createdAt" label="操作时间" width="180"></el-table-column>
            </el-table>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-container">
            <h3>未读通知</h3>
            <el-table :data="statistics.recentNotifications || []" style="width: 100%">
              <el-table-column prop="title" label="通知标题" min-width="200"></el-table-column>
              <el-table-column prop="type" label="类型" width="100">
                <template #default="scope">
                  <el-tag :type="getTypeType(scope.row.type)">
                    {{ getTypeText(scope.row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="发送时间" width="180"></el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="actions-section">
      <h3>系统操作</h3>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-button type="primary" @click="markAllRead">标记所有通知为已读</el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="warning" @click="clearOldLogs">清除旧日志</el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const statistics = ref({})

const getTypeType = (type) => {
  const map = {
    'info': 'info',
    'warning': 'warning',
    'error': 'danger',
    'success': 'success'
  }
  return map[type] || 'info'
}

const getTypeText = (type) => {
  const map = {
    'info': '信息',
    'warning': '警告',
    'error': '错误',
    'success': '成功'
  }
  return map[type] || type
}

const loadStatistics = async () => {
  try {
    const response = await axios.get('/api/system/statistics')
    statistics.value = response.data.data || {}
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  }
}

const refreshStatistics = () => {
  loadStatistics()
}

const markAllRead = async () => {
  try {
    await axios.post('/api/system/notifications/read-all')
    ElMessage.success('标记成功')
    loadStatistics()
  } catch (error) {
    ElMessage.error('标记失败')
  }
}

const clearOldLogs = () => {
  ElMessageBox.prompt('请输入要清除多少天前的日志（输入0清除所有日志）', '清除日志', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^\d+$/,
    inputErrorMessage: '请输入数字'
  }).then(async ({ value }) => {
    try {
      await axios.delete('/api/system/logs', { params: { days: value } })
      ElMessage.success('清除成功')
      loadStatistics()
    } catch (error) {
      ElMessage.error('清除失败')
    }
  })
}

onMounted(() => {
  loadStatistics()
})
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.statistics-cards {
  margin-bottom: 30px;
}

.stat-card {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.charts-section {
  margin-bottom: 30px;
}

.chart-container {
  background-color: #ffffff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart-container h3 {
  margin-bottom: 20px;
}

.actions-section {
  margin-top: 20px;
}

.actions-section h3 {
  margin-bottom: 20px;
}
</style>
