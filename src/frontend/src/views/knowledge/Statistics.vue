<template>
  <div class="statistics-container">
    <div class="page-header">
      <h2>知识库统计</h2>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="handleDateChange"
      />
    </div>

    <div class="statistics-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ statistics.documentCount || 0 }}</div>
            <div class="stat-label">文档总数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ statistics.categoryCount || 0 }}</div>
            <div class="stat-label">分类总数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ statistics.qaCount || 0 }}</div>
            <div class="stat-label">问答总数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ statistics.pendingQACount || 0 }}</div>
            <div class="stat-label">待回答问题</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-container">
            <h3>文档发布趋势</h3>
            <div ref="documentChartRef" style="width: 100%; height: 300px"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-container">
            <h3>问答分类统计</h3>
            <div ref="qaCategoryChartRef" style="width: 100%; height: 300px"></div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="12">
          <div class="chart-container">
            <h3>热门文档 TOP 10</h3>
            <div ref="topDocumentsChartRef" style="width: 100%; height: 300px"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-container">
            <h3>热门搜索关键词</h3>
            <div ref="hotSearchesChartRef" style="width: 100%; height: 300px"></div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="tables-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="table-container">
            <h3>热门文档</h3>
            <el-table :data="statistics.topDocuments || []" style="width: 100%">
              <el-table-column prop="title" label="文档标题" min-width="200"></el-table-column>
              <el-table-column prop="viewCount" label="查看次数" width="100"></el-table-column>
              <el-table-column prop="downloadCount" label="下载次数" width="100"></el-table-column>
            </el-table>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="table-container">
            <h3>最近搜索</h3>
            <el-table :data="statistics.topSearches || []" style="width: 100%">
              <el-table-column prop="keyword" label="搜索关键词" min-width="200"></el-table-column>
              <el-table-column prop="resultCount" label="结果数量" width="100"></el-table-column>
              <el-table-column prop="createdAt" label="搜索时间" width="180"></el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const dateRange = ref([])
const statistics = ref({})

const documentChartRef = ref(null)
const qaCategoryChartRef = ref(null)
const topDocumentsChartRef = ref(null)
const hotSearchesChartRef = ref(null)

let documentChart = null
let qaCategoryChart = null
let topDocumentsChart = null
let hotSearchesChart = null

const loadStatistics = async () => {
  try {
    const params = {}
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }

    const response = await axios.get('/api/knowledge/statistics', { params })
    statistics.value = response.data.data || {}

    renderCharts()
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  }
}

const renderCharts = () => {
  // 文档发布趋势图
  if (documentChartRef.value) {
    if (!documentChart) {
      documentChart = echarts.init(documentChartRef.value)
    }

    const documentTrend = statistics.value.documentTrend || []
    const dates = documentTrend.map(item => item.date)
    const counts = documentTrend.map(item => item.count)

    documentChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: dates
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '发布数量',
          type: 'line',
          data: counts,
          smooth: true
        }
      ]
    })
  }

  // 问答分类统计图
  if (qaCategoryChartRef.value) {
    if (!qaCategoryChart) {
      qaCategoryChart = echarts.init(qaCategoryChartRef.value)
    }

    const qaCategories = statistics.value.qaCategories || []
    const categories = qaCategories.map(item => item.category)
    const counts = qaCategories.map(item => item.count)

    qaCategoryChart.setOption({
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '问答分类',
          type: 'pie',
          radius: '50%',
          data: categories.map((category, index) => ({
            name: category,
            value: counts[index]
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    })
  }

  // 热门文档 TOP 10 图
  if (topDocumentsChartRef.value) {
    if (!topDocumentsChart) {
      topDocumentsChart = echarts.init(topDocumentsChartRef.value)
    }

    const topDocuments = statistics.value.topDocuments || []
    const titles = topDocuments.map(item => item.title)
    const viewCounts = topDocuments.map(item => item.viewCount)

    topDocumentsChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: titles.reverse()
      },
      series: [
        {
          name: '查看次数',
          type: 'bar',
          data: viewCounts.reverse()
        }
      ]
    })
  }

  // 热门搜索关键词图
  if (hotSearchesChartRef.value) {
    if (!hotSearchesChart) {
      hotSearchesChart = echarts.init(hotSearchesChartRef.value)
    }

    const hotSearches = statistics.value.hotSearches || []
    const keywords = hotSearches.map(item => item.keyword)
    const counts = hotSearches.map(item => item.count)

    hotSearchesChart.setOption({
      tooltip: {
        trigger: 'wordCloud'
      },
      series: [
        {
          type: 'wordCloud',
          sizeRange: [12, 60],
          rotationRange: [0, 0],
          rotationStep: 45,
          gridSize: 8,
          drawOutOfBound: false,
          layoutAnimation: true,
          textStyle: {
            fontFamily: 'sans-serif',
            fontWeight: 'bold',
            color: function () {
              return 'rgb(' + [
                Math.round(Math.random() * 160),
                Math.round(Math.random() * 160),
                Math.round(Math.random() * 160)
              ].join(',') + ')'
            }
          },
          data: keywords.map((keyword, index) => ({
            name: keyword,
            value: counts[index]
          }))
        }
      ]
    })
  }
}

const handleDateChange = () => {
  loadStatistics()
}

const handleResize = () => {
  if (documentChart) documentChart.resize()
  if (qaCategoryChart) qaCategoryChart.resize()
  if (topDocumentsChart) topDocumentsChart.resize()
  if (hotSearchesChart) hotSearchesChart.resize()
}

onMounted(() => {
  loadStatistics()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

  if (documentChart) {
    documentChart.dispose()
  }
  if (qaCategoryChart) {
    qaCategoryChart.dispose()
  }
  if (topDocumentsChart) {
    topDocumentsChart.dispose()
  }
  if (hotSearchesChart) {
    hotSearchesChart.dispose()
  }
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

.tables-section {
  margin-top: 20px;
}

.table-container {
  background-color: #ffffff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.table-container h3 {
  margin-bottom: 20px;
}
</style>
