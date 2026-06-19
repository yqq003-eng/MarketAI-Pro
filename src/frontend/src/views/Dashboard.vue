<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="stat in statistics" :key="stat.title">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" :style="{ backgroundColor: stat.color }">
              <el-icon :size="24"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ stat.value }}</div>
              <div class="stats-title">{{ stat.title }}</div>
              <div class="stats-trend" :class="stat.trend > 0 ? 'up' : 'down'">
                <el-icon v-if="stat.trend > 0"><Top /></el-icon>
                <el-icon v-else><Bottom /></el-icon>
                {{ Math.abs(stat.trend) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>营销数据趋势</span>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">全年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="lineChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <span>平台分布</span>
          </template>
          <div ref="pieChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近任务和快速操作 -->
    <el-row :gutter="20" class="bottom-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近任务</span>
              <el-button type="primary" link @click="$router.push('/video-matrix/tasks')">
                查看全部
              </el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="task in recentTasks"
              :key="task.id"
              :timestamp="task.time"
              placement="top"
            >
              <el-card shadow="never">
                <h4>{{ task.title }}</h4>
                <p>{{ task.description }}</p>
                <el-tag :type="task.status === 'completed' ? 'success' : 'warning'">
                  {{ task.status === 'completed' ? '已完成' : '进行中' }}
                </el-tag>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>快速操作</span>
          </template>
          <div class="quick-actions">
            <el-button
              v-for="action in quickActions"
              :key="action.path"
              size="large"
              @click="$router.push(action.path)"
              :icon="action.icon"
            >
              {{ action.title }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  VideoCamera,
  User,
  ChatDotRound,
  DataBoard,
  VideoPlay,
  UserFilled,
  ChatLineRound,
  Setting
} from '@element-plus/icons-vue'

const router = useRouter()
const timeRange = ref('week')
const lineChartRef = ref(null)
const pieChartRef = ref(null)
let lineChart = null
let pieChart = null

// 统计数据
const statistics = ref([
  {
    title: '视频发布量',
    value: '1,234',
    icon: 'VideoPlay',
    color: '#6366f1',
    trend: 12.5
  },
  {
    title: '账号数量',
    value: '56',
    icon: 'User',
    color: '#0ea5e9',
    trend: 8.2
  },
  {
    title: '私信回复',
    value: '892',
    icon: 'ChatDotRound',
    color: '#10b981',
    trend: -3.1
  },
  {
    title: '转化率',
    value: '23.5%',
    icon: 'DataBoard',
    color: '#f59e0b',
    trend: 5.6
  }
])

// 最近任务
const recentTasks = ref([
  {
    id: 1,
    title: '抖音批量发布任务',
    description: '20个视频 scheduled 发布',
    time: '2026-06-20 10:30',
    status: 'completed'
  },
  {
    id: 2,
    title: '小红书笔记采集',
    description: '采集竞品笔记 500 条',
    time: '2026-06-20 09:15',
    status: 'in_progress'
  },
  {
    id: 3,
    title: '企业微信消息群发',
    description: '向 200 个客户发送消息',
    time: '2026-06-19 16:45',
    status: 'completed'
  }
])

// 快速操作
const quickActions = ref([
  { title: '创建视频', path: '/video-matrix/edit', icon: 'VideoPlay' },
  { title: '管理账号', path: '/video-matrix/accounts', icon: 'User' },
  { title: '聚合聊天', path: '/wechat-marketing/aggregate-chat', icon: 'ChatLineRound' },
  { title: '系统设置', path: '/system/profile', icon: 'Setting' }
])

// 初始化折线图
const initLineChart = () => {
  if (!lineChartRef.value) return
  
  lineChart = echarts.init(lineChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['视频发布', '互动量', '转化率']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '视频发布',
        type: 'line',
        data: [120, 132, 101, 134, 90, 230, 210],
        smooth: true,
        areaStyle: {
          opacity: 0.3
        }
      },
      {
        name: '互动量',
        type: 'line',
        data: [220, 182, 191, 234, 290, 330, 310],
        smooth: true
      },
      {
        name: '转化率',
        type: 'line',
        data: [15, 23, 20, 15, 19, 33, 41],
        smooth: true,
        yAxisIndex: 1
      }
    ]
  }
  
  lineChart.setOption(option)
}

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return
  
  pieChart = echarts.init(pieChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '平台分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 1048, name: '抖音' },
          { value: 735, name: '小红书' },
          { value: 580, name: '快手' },
          { value: 484, name: '视频号' }
        ]
      }
    ]
  }
  
  pieChart.setOption(option)
}

// 监听时间范围变化
watch(timeRange, () => {
  // 重新加载数据
  initLineChart()
})

// 监听窗口大小变化
const handleResize = () => {
  lineChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  nextTick(() => {
    initLineChart()
    initPieChart()
  })
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  lineChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  transition: transform 0.3s;
}

.stats-card:hover {
  transform: translateY(-5px);
}

.stats-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stats-info {
  flex: 1;
}

.stats-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stats-title {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.stats-trend {
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stats-trend.up {
  color: #67c23a;
}

.stats-trend.down {
  color: #f56c6c;
}

.charts-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 350px;
}

.bottom-row {
  margin-bottom: 20px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-actions .el-button {
  height: 80px;
  font-size: 16px;
}
</style>
