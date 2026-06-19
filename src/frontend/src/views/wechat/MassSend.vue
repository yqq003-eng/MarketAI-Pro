<template>
  <div class="mass-send">
    <div class="page-header">
      <h2>精准群发</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <i class="el-icon-s-promotion"></i> 新建群发任务
      </el-button>
    </div>

    <!-- 群发任务列表 -->
    <el-table :data="tasks" style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="任务名称" width="200"></el-table-column>
      <el-table-column prop="targetCount" label="目标人数" width="120"></el-table-column>
      <el-table-column prop="sentCount" label="已发送" width="100"></el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="scheduleTime" label="定时时间" width="180">
        <template slot-scope="scope">
          {{ scope.row.scheduleTime || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button size="mini" @click="viewTask(scope.row)">详情</el-button>
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

    <!-- 新建群发任务对话框 -->
    <el-dialog title="新建群发任务" :visible.sync="showCreateDialog" width="700px">
      <el-form label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="newTask.name" placeholder="请输入任务名称"></el-input>
        </el-form-item>

        <el-form-item label="目标标签">
          <el-checkbox-group v-model="newTask.targetTags">
            <el-checkbox 
              v-for="tag in tags" 
              :label="tag.id" 
              :key="tag.id">
              {{ tag.name }} ({{ tag.count }})
            </el-checkbox>
          </el-checkbox-group>
          <div style="font-size: 12px; color: #999; margin-top: 5px;">
            将向选中标签下的所有好友发送消息
          </div>
        </el-form-item>

        <el-form-item label="消息内容">
          <el-input
            type="textarea"
            v-model="newTask.content"
            placeholder="请输入消息内容"
            :rows="4">
          </el-input>
        </el-form-item>

        <el-form-item label="添加图片">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleImageUpload"
            multiple
            :limit="9">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">支持jpg、png格式，最多9张</div>
          </el-upload>
        </el-form-item>

        <el-form-item label="发送方式">
          <el-radio-group v-model="newTask.sendMode">
            <el-radio label="immediate">立即发送</el-radio>
            <el-radio label="schedule">定时发送</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="newTask.sendMode === 'schedule'" label="定时时间">
          <el-date-picker
            v-model="newTask.scheduleTime"
            type="datetime"
            placeholder="选择发送时间"
            style="width: 100%;">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="智能间隔">
          <el-switch v-model="newTask.smartInterval"></el-switch>
          <span style="margin-left: 10px; color: #999;">开启后，系统会随机间隔发送，避免被封号</span>
        </el-form-item>

        <el-form-item v-if="newTask.smartInterval" label="间隔时间">
          <el-slider
            v-model="newTask.intervalTime"
            :min="30"
            :max="300"
            show-input>
          </el-slider>
          <div style="font-size: 12px; color: #999;">单位：秒</div>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createTask">创建任务</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MassSend',
  data() {
    return {
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      showCreateDialog: false,
      newTask: {
        name: '',
        targetTags: [],
        content: '',
        images: [],
        sendMode: 'immediate',
        scheduleTime: '',
        smartInterval: true,
        intervalTime: 60
      },
      tasks: [
        {
          id: 1,
          name: '新品推广群发',
          targetCount: 100,
          sentCount: 100,
          status: 'completed',
          scheduleTime: '',
          createTime: '2026-06-18 10:00:00'
        },
        {
          id: 2,
          name: '活动通知群发',
          targetCount: 50,
          sentCount: 32,
          status: 'processing',
          scheduleTime: '2026-06-20 09:00:00',
          createTime: '2026-06-19 14:00:00'
        },
        {
          id: 3,
          name: '节日祝福群发',
          targetCount: 200,
          sentCount: 0,
          status: 'pending',
          scheduleTime: '2026-06-22 08:00:00',
          createTime: '2026-06-20 11:30:00'
        }
      ],
      tags: [
        { id: 1, name: '潜在客户', count: 45 },
        { id: 2, name: '已联系', count: 32 },
        { id: 3, name: '意向度高', count: 18 },
        { id: 4, name: '已成交', count: 12 }
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
        'processing': '发送中',
        'completed': '已完成',
        'failed': '失败'
      }
      return texts[status] || status
    },
    loadTasks() {
      this.loading = true
      this.$http.get('/api/wechat/mass-send')
        .then(res => {
          if (res.data.success) {
            this.tasks = res.data.data
            this.total = res.data.data.length
          }
        })
        .catch(err => {
          this.$message.error('加载群发任务失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleImageUpload(file) {
      this.newTask.images.push(file.raw)
      this.$message.success(`图片 ${file.name} 上传成功`)
    },
    viewTask(task) {
      this.$message.info(`查看任务：${task.name}`)
      // 这里应该打开任务详情对话框
    },
    deleteTask(task) {
      this.$confirm(`确定要删除群发任务 "${task.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/api/wechat/mass-send/${task.id}`)
          .then(() => {
            this.tasks = this.tasks.filter(t => t.id !== task.id)
            this.$message.success('任务已删除')
          })
          .catch(err => {
            this.$message.error('删除任务失败')
          })
      })
    },
    createTask() {
      if (!this.newTask.name) {
        this.$message.error('请输入任务名称')
        return
      }

      if (this.newTask.targetTags.length === 0) {
        this.$message.error('请选择至少一个目标标签')
        return
      }

      if (!this.newTask.content && this.newTask.images.length === 0) {
        this.$message.error('请输入消息内容或上传图片')
        return
      }

      if (this.newTask.sendMode === 'schedule' && !this.newTask.scheduleTime) {
        this.$message.error('请选择定时发送时间')
        return
      }

      this.$message.success('群发任务创建成功')
      this.showCreateDialog = false

      // 调用后端API创建任务
      this.$http.post('/api/wechat/mass-send', this.newTask)
        .then(() => {
          this.loadTasks()
          
          // 重置表单
          this.newTask = {
            name: '',
            targetTags: [],
            content: '',
            images: [],
            sendMode: 'immediate',
            scheduleTime: '',
            smartInterval: true,
            intervalTime: 60
          }
        })
        .catch(err => {
          this.$message.error('创建任务失败')
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
.mass-send {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.upload-demo {
  width: 100%;
}
</style>
