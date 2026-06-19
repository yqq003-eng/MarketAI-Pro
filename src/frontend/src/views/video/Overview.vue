<template>
  <div class="video-overview">
    <div class="page-header">
      <h2>数据总览</h2>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="loadData">
      </el-date-picker>
    </div>

    <!-- 概览统计 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :span="6" v-for="stat in overviewStats" :key="stat.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" :style="{ backgroundColor: stat.color }">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(stat.value) }}</div>
            <div class="stat-title">{{ stat.title }}</div>
            <div class="stat-trend" :class="stat.trend >= 0 ? 'up' : 'down'">
              <i :class="stat.trend >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
              {{ Math.abs(stat.trend) }}%
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <el-card shadow="hover">
          <div slot="header">
            <span>播放量趋势</span>
          </div>
          <div id="playChart" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header">
            <span>平台分布</span>
          </div>
          <div id="platformChart" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近发布的视频 -->
    <el-card shadow="hover" style="margin-top: 20px;">
      <div slot="header">
        <span>最近发布</span>
        <el-button 
          style="float: right; padding: 3px 0" 
          type="text"
          @click="$router.push('/video-matrix/accounts')">
          查看全部
        </el-button>
      </div>

      <el-table :data="recentVideos" style="width: 100%">
        <el-table-column prop="title" label="视频标题" width="250"></el-table-column>
        <el-table-column prop="platform" label="平台" width="100">
          <template slot-scope="scope">
            <el-tag size="small">{{ getPlatformName(scope.row.platform) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="180"></el-table-column>
        <el-table-column prop="views" label="播放量" width="100" sortable>
          <template slot-scope="scope">
            {{ formatNumber(scope.row.views) }}
          </template>
        </el-table-column>
        <el-table-column prop="likes" label="点赞" width="80" sortable></el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button size="mini" @click="viewVideoDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'VideoOverview',
  data() {
    return {
      dateRange: '',
      overviewStats: [
        { title: '总播放量', value: 1256000, trend: 12.5, icon: 'el-icon-video-camera', color: '#409EFF' },
        { title: '总点赞数', value: 89600, trend: 8.3, icon: 'el-icon-thumb', color: '#67C23A' },
        { title: '总评论数', value: 12580, trend: -2.1, icon: 'el-icon-chat-dot-round', color: '#E6A23C' },
        { title: '总分享数', value: 5600, trend: 15.7, icon: 'el-icon-share', color: '#F56C6C' }
      ],
      recentVideos: [
        {
          id: 1,
          title: '产品介绍视频',
          platform: 'douyin',
          publishTime: '2026-06-18 10:30:00',
          views: 125800,
          likes: 8960,
          comments: 1258,
          shares: 560
        },
        {
          id: 2,
          title: '品牌宣传片',
          platform: 'kuaishou',
          publishTime: '2026-06-17 15:20:00',
          views: 89600,
          likes: 6280,
          comments: 896,
          shares: 320
        },
        {
          id: 3,
          title: '用户案例分享',
          platform: 'shipinhao',
          publishTime: '2026-06-16 09:15:00',
          views: 56700,
          likes: 4120,
          comments: 654,
          shares: 280
        }
      ]
    }
  },
  mounted() {
    this.initCharts()
  },
  methods: {
    formatNumber(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w'
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
      }
      return num.toString()
    },
    getPlatformName(platform) {
      const names = {
        douyin: '抖音',
        kuaishou: '快手',
        shipinhao: '视频号',
        xiaohongshu: '小红书'
      }
      return names[platform] || platform
    },
    loadData() {
      this.$message.info('正在加载数据...')
      // 调用后端API获取数据
      this.$http.get('/api/shortvideo/analytics', {
        params: {
          startDate: this.dateRange ? this.dateRange[0] : '',
          endDate: this.dateRange ? this.dateRange[1] : ''
        }
      }).then(res => {
        if (res.data.success) {
          // 更新数据
          console.log('Analytics data:', res.data.data)
        }
      }).catch(err => {
        this.$message.error('加载数据失败')
      })
    },
    viewVideoDetail(video) {
      this.$router.push({ 
        name: 'VideoDetail', 
        params: { id: video.id } 
      })
    },
    initCharts() {
      // 播播放量趋势图
      const playChart = this.$echarts.init(document.getElementById('playChart'))
      const playOption = {
        title: { text: '' },
        tooltip: { trigger: 'axis' },
        legend: { data: ['抖音', '快手', '视频号'] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
        yAxis: { type: 'value' },
        series: [
          { name: '抖音', type: 'line', data: [12000, 19000, 15000, 21000, 23000, 32000, 28000] },
          { name: '快手', type: 'line', data: [8000, 12000, 10000, 15000, 18000, 22000, 19000] },
          { name: '视频号', type: 'line', data: [5000, 8000, 7000, 10000, 12000, 15000, 13000] }
        ]
      }
      playChart.setOption(playOption)

      // 平台分布饼图
      const platformChart = this.$echarts.init(document.getElementById('platformChart'))
      const platformOption = {
        title: { text: '平台分布', left: 'center' },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
          {
            type: 'pie',
            radius: '50%',
            data: [
              { value: 45, name: '抖音' },
              { value: 30, name: '快手' },
              { value: 15, name: '视频号' },
              { value: 10, name: '小红书' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      platformChart.setOption(platformOption)

      // 监听窗口大小变化，重绘图表
      window.addEventListener('resize', () => {
        playChart.resize()
        platformChart.resize()
      })
    }
  }
}
</script>

<style scoped>
.video-overview {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-overview {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.stat-icon i {
  font-size: 24px;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.stat-trend {
  font-size: 12px;
  margin-top: 5px;
}

.stat-trend.up {
  color: #67C23A;
}

.stat-trend.down {
  color: #F56C6C;
}
</style>
