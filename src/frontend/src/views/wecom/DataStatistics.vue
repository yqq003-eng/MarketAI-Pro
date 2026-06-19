<template>
  <div class="data-statistics">
    <div class="page-header">
      <h2>数据统计</h2>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="loadStatistics"
        ></el-date-picker>
        <el-button @click="refreshData">刷新数据</el-button>
      </div>
    </div>

    <!-- 汇总数据 -->
    <el-row :gutter="20" class="summary-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-content">
            <div class="summary-icon" style="background: #409EFF;">
              <el-icon :size="30"><User /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ summary.total_customers || 0 }}</div>
              <div class="summary-label">总客户数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-content">
            <div class="summary-icon" style="background: #67C23A;">
              <el-icon :size="30"><ChatDotRound /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ summary.total_groups || 0 }}</div>
              <div class="summary-label">总群数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-content">
            <div class="summary-icon" style="background: #E6A23C;">
              <el-icon :size="30"><Message /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ summary.active_employees || 0 }}</div>
              <div class="summary-label">活跃员工</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-content">
            <div class="summary-icon" style="background: #F56C6C;">
              <el-icon :size="30"><Promotion /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ summary.sent_messages || 0 }}</div>
              <div class="summary-label">已发消息</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 客户增长趋势 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>客户增长趋势</span>
            </div>
          </template>
          <div ref="customerTrendChart" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 群活跃度排行 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>群活跃度排行</span>
            </div>
          </template>
          <div ref="groupActivityChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 消息群发效果 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>消息群发效果</span>
            </div>
          </template>
          <div ref="massMessageChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>客户增长明细</span>
            </div>
          </template>
          <el-table :data="customerTrend" border style="width: 100%">
            <el-table-column prop="date" label="日期" width="150"></el-table-column>
            <el-table-column prop="count" label="新增客户数" width="150"></el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { User, ChatDotRound, Message, Promotion } from '@element-plus/icons-vue'

export default {
  name: 'DataStatistics',
  components: {
    User,
    ChatDotRound,
    Message,
    Promotion
  },
  setup() {
    const dateRange = ref([])
    const summary = ref({})
    const customerTrend = ref([])
    const groupActivity = ref([])
    const massMessageStats = ref([])
    
    const customerTrendChart = ref(null)
    const groupActivityChart = ref(null)
    const massMessageChart = ref(null)
    
    let customerChart = null
    let groupChart = null
    let massMessageChartInstance = null
    
    const loadStatistics = async () => {
      try {
        const startDate = dateRange.value ? dateRange.value[0] : getDefaultStartDate()
        const endDate = dateRange.value ? dateRange.value[1] : getDefaultEndDate()
        
        const response = await fetch(`/api/wecom/statistics?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}`)
        const result = await response.json()
        if (result.code === 200) {
          summary.value = result.data.summary
          customerTrend.value = result.data.customer_trend
          groupActivity.value = result.data.group_activity
          massMessageStats.value = result.data.mass_message_stats
          
          nextTick(() => {
            initCharts()
          })
        }
      } catch (error) {
        ElMessage.error('加载统计数据失败')
      }
    }
    
    const initCharts = () => {
      // 客户增长趋势图
      if (customerTrendChart.value) {
        if (customerChart) {
          customerChart.dispose()
        }
        customerChart = echarts.init(customerTrendChart.value)
        const dates = customerTrend.value.map(item => item.date)
        const counts = customerTrend.value.map(item => item.count)
        
        customerChart.setOption({
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: dates },
          yAxis: { type: 'value' },
          series: [{
            data: counts,
            type: 'line',
            smooth: true,
            areaStyle: {}
          }]
        })
      }
      
      // 群活跃度排行图
      if (groupActivityChart.value) {
        if (groupChart) {
          groupChart.dispose()
        }
        groupChart = echarts.init(groupActivityChart.value)
        const groups = groupActivity.value.map(item => item.name)
        const messages = groupActivity.value.map(item => item.message_count)
        
        groupChart.setOption({
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: groups },
          yAxis: { type: 'value' },
          series: [{
            data: messages,
            type: 'bar',
            itemStyle: { color: '#67C23A' }
          }]
        })
      }
      
      // 消息群发效果图
      if (massMessageChart.value) {
        if (massMessageChartInstance) {
          massMessageChartInstance.dispose()
        }
        massMessageChartInstance = echarts.init(massMessageChart.value)
        const statuses = massMessageStats.value.map(item => getStatusText(item.status))
        const counts = massMessageStats.value.map(item => item.count)
        
        massMessageChartInstance.setOption({
          tooltip: { trigger: 'item' },
          legend: { orient: 'vertical', right: 10, top: 'center' },
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            data: statuses.map((name, index) => ({ name, value: counts[index] }))
          }]
        })
      }
    }
    
    const refreshData = () => {
      loadStatistics()
    }
    
    const getDefaultStartDate = () => {
      const date = new Date()
      date.setDate(date.getDate() - 30)
      return date
    }
    
    const getDefaultEndDate = () => {
      return new Date()
    }
    
    const formatDate = (date) => {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    const getStatusText = (status) => {
      const texts = {
        'draft': '草稿',
        'pending': '待发送',
        'sent': '已发送',
        'cancelled': '已取消'
      }
      return texts[status] || '未知'
    }
    
    const handleResize = () => {
      if (customerChart) customerChart.resize()
      if (groupChart) groupChart.resize()
      if (massMessageChartInstance) massMessageChartInstance.resize()
    }
    
    onMounted(() => {
      loadStatistics()
      window.addEventListener('resize', handleResize)
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      if (customerChart) customerChart.dispose()
      if (groupChart) groupChart.dispose()
      if (massMessageChartInstance) massMessageChartInstance.dispose()
    })
    
    return {
      dateRange,
      summary,
      customerTrend,
      groupActivity,
      massMessageStats,
      customerTrendChart,
      groupActivityChart,
      massMessageChart,
      loadStatistics,
      refreshData
    }
  }
}
</script>

<style scoped>
.data-statistics {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.summary-cards {
  margin-bottom: 20px;
}

.summary-card {
  transition: all 0.3s;
}

.summary-card:hover {
  transform: translateY(-5px);
}

.summary-content {
  display: flex;
  align-items: center;
}

.summary-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 15px;
}

.summary-info {
  flex: 1;
}

.summary-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.summary-label {
  font-size: 14px;
  color: #999;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
