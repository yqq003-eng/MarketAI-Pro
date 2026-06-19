<template>
  <div class="video-tasks">
    <div class="page-header">
      <h2>混剪任务管理</h2>
      <el-button type="primary" @click="$router.push('/video-matrix/edit')">
        <i class="el-icon-video-camera"></i> 新建混剪任务
      </el-button>
    </div>

    <!-- 任务列表 -->
    <el-table
      :data="tasks"
      style="width: 100%"
      v-loading="loading">
      <el-table-column prop="name" label="任务名称" width="200"></el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="videoCount" label="视频数量" width="100"></el-table-column>
      <el-table-column prop="progress" label="进度" width="150">
        <template slot-scope="scope">
          <el-progress 
            :percentage="scope.row.progress" 
            :status="scope.row.progress === 100 ? 'success' : ''">
          </el-progress>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button size="mini" @click="viewTask(scope.row)">查看</el-button>
          <el-button 
            size="mini" 
            type="primary" 
            @click="downloadVideos(scope.row)"
            :disabled="scope.row.progress !== 100">
            下载
          </el-button>
          <el-button 
            size="mini" 
            type="danger" 
            @click="deleteTask(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      style="margin-top: 20px; text-align: center;"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: 'VideoTasks',
  data() {
    return {
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      tasks: [
        {
          id: 1,
          name: '产品推广视频混剪',
          status: 'completed',
          videoCount: 20,
          progress: 100,
          createTime: '2026-06-18 10:30:00'
        },
        {
          id: 2,
          name: '品牌宣传视频制作',
          status: 'processing',
          videoCount: 50,
          progress: 65,
          createTime: '2026-06-19 14:20:00'
        },
        {
          id: 3,
          name: '新品发布视频',
          status: 'pending',
          videoCount: 30,
          progress: 0,
          createTime: '2026-06-20 09:15:00'
        }
      ]
    }
  },
  mounted() {
    this.loadTasks()
  },
  methods: {
    getStatusType(status) {
      const types = {
        'pending': 'info',
        'processing': '',
        'completed': 'success',
        'failed': 'danger'
      }
      return types[status] || ''
    },
    getStatusText(status) {
      const texts = {
        'pending': '等待中',
        'processing': '处理中',
        'completed': '已完成',
        'failed': '失败'
      }
      return texts[status] || status
    },
    loadTasks() {
      this.loading = true
      this.$http.get('/api/shortvideo/mix-tasks')
        .then(res => {
          if (res.data.success) {
            this.tasks = res.data.data
            this.total = res.data.data.length
          }
        })
        .catch(err => {
          this.$message.error('加载任务列表失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    viewTask(task) {
      this.$message.info(`查看任务：${task.name}`)
      // 可以跳转到任务详情页
    },
    downloadVideos(task) {
      this.$message.success('开始下载视频...')
      // 调用后端API下载视频
    },
    deleteTask(task) {
      this.$confirm('确定要删除该混剪任务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/api/shortvideo/mix-tasks/${task.id}`)
          .then(() => {
            this.tasks = this.tasks.filter(t => t.id !== task.id)
            this.$message.success('任务已删除')
          })
          .catch(err => {
            this.$message.error('删除任务失败')
          })
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.loadTasks()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadTasks()
    }
  }
}
</script>

<style scoped>
.video-tasks {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
