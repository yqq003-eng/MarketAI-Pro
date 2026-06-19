<template>
  <div class="recruitment-analytics">
    <div class="page-header">
      <h2>招聘数据</h2>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="loadAnalytics"
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
              <el-icon :size="30"><Briefcase /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ summary.total_jobs || 0 }}</div>
              <div class="summary-label">活跃职位</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-content">
            <div class="summary-icon" style="background: #67C23A;">
              <el-icon :size="30"><User /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ summary.total_candidates || 0 }}</div>
              <div class="summary-label">候选人总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-content">
            <div class="summary-icon" style="background: #E6A23C;">
              <el-icon :size="30"><ChatDotRound /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ summary.interviewing_count || 0 }}</div>
              <div class="summary-label">面试中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-content">
            <div class="summary-icon" style="background: #F56C6C;">
              <el-icon :size="30"><SuccessFilled /></el-icon>
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ summary.hired_count || 0 }}</div>
              <div class="summary-label">已录用</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 候选人状态分布 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>候选人状态分布</span>
            </div>
          </template>
          <div ref="statusChart" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 职位申请趋势 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>职位申请趋势</span>
            </div>
          </template>
          <div ref="trendChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>职位申请明细</span>
            </div>
          </template>
          <el-table :data="jobStats" border style="width: 100%">
            <el-table-column prop="title" label="职位名称" width="200"></el-table-column>
            <el-table-column prop="company" label="公司" width="150"></el-table-column>
            <el-table-column prop="location" label="地点" width="120"></el-table-column>
            <el-table-column prop="candidate_count" label="申请人数" width="120"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
                  {{ scope.row.status === 'active' ? '活跃' : '已关闭' }}
                </el-tag>
              </template>
            </el-table-column>
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
import { Briefcase, User, ChatDotRound, SuccessFilled } from '@element-plus/icons-vue'

export default {
  name: 'RecruitmentAnalytics',
  components: {
    Briefcase,
    User,
    ChatDotRound,
    SuccessFilled
  },
  setup() {
    const dateRange = ref([])
    const summary = ref({})
    const jobStats = ref([])
    
    const statusChart = ref(null)
    const trendChart = ref(null)
    
    let statusChartInstance = null
    let trendChartInstance = null
    
    const loadAnalytics = async () => {
      try {
        const startDate = dateRange.value ? dateRange.value[0] : getDefaultStartDate()
        const endDate = dateRange.value ? dateRange.value[1] : getDefaultEndDate()
        
        const response = await fetch(`/api/boss/analytics?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}`)
        const result = await response.json()
        if (result.code === 200) {
          summary.value = result.data.summary
          jobStats.value = result.data.job_stats
          
          nextTick(() => {
            initCharts(result.data.status distribution, result.data.application_trend)
          })
        }
      } catch (error) {
        ElMessage.error('加载统计数据失败')
      }
    }
    
    const initCharts = (statusDistribution, applicationTrend) => {
      // 候选人状态分布图
      if (statusChart.value) {
        if (statusChartInstance) {
          statusChartInstance.dispose()
        }
        statusChartInstance = echarts.init(statusChart.value)
        
        statusChartInstance.setOption({
          tooltip: { trigger: 'item' },
          legend: { orient: 'vertical', right: 10, top: 'center' },
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            data: statusDistribution
          }]
        })
      }
      
      // 职位申请趋势图
      if (trendChart.value) {
        if (trendChartInstance) {
          trendChartInstance.dispose()
        }
        trendChartInstance = echarts.init(trendChart.value)
        
        const dates = applicationTrend.map(item => item.date)
        const counts = applicationTrend.map(item => item.count)
        
        trendChartInstance.setOption({
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
    }
    
    const refreshData = () => {
      loadAnalytics()
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
    
    const handleResize = () => {
      if (statusChartInstance) statusChartInstance.resize()
      if (trendChartInstance) trendChartInstance.resize()
    }
    
    onMounted(() => {
      loadAnalytics()
      window.addEventListener('resize', handleResize)
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      if (statusChartInstance) statusChartInstance.dispose()
      if (trendChartInstance) trendChartInstance.dispose()
    })
    
    return {
      dateRange,
      summary,
      jobStats,
      statusChart,
      trendChart,
      loadAnalytics,
      refreshData
    }
  }
}
</script>

<style scoped>
.recruitment-analytics {
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