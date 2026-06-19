<template>
  <div class="video-schedule">
    <div class="page-header">
      <h2>定时发布</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <i class="el-icon-time"></i> 新建定时任务
      </el-button>
    </div>

    <!-- 日历视图 -->
    <el-calendar v-model="currentDate">
      <template slot="dateCell" slot-scope="{date, data}">
        <div class="calendar-cell">
          <div class="calendar-date">{{ data.day.split('-').slice(2).join('-') }}</div>
          <div v-if="getTasksByDate(data.day).length > 0" class="calendar-tasks">
            <div 
              v-for="task in getTasksByDate(data.day)" 
              :key="task.id"
              class="calendar-task"
              :style="{ backgroundColor: getPlatformColor(task.platform) }">
              {{ task.title }}
            </div>
          </div>
        </div>
      </template>
    </el-calendar>

    <!-- 定时任务列表 -->
    <el-card shadow="hover" style="margin-top: 20px;">
      <div slot="header">
        <span>即将执行的任务</span>
      </div>

      <el-table :data="upcomingTasks" style="width: 100%">
        <el-table-column prop="title" label="视频标题" width="250"></el-table-column>
        <el-table-column prop="platform" label="平台" width="100">
          <template slot-scope="scope">
            <el-tag size="small">{{ getPlatformName(scope.row.platform) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="account" label="发布账号" width="150"></el-table-column>
        <el-table-column prop="scheduleTime" label="定时时间" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button size="mini" @click="editTask(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="cancelTask(scope.row)">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建定时任务对话框 -->
    <el-dialog title="新建定时任务" :visible.sync="showCreateDialog" width="700px">
      <el-form label-width="100px">
        <el-form-item label="选择视频">
          <el-select v-model="newTask.videoId" placeholder="请选择视频" style="width: 100%;">
            <el-option
              v-for="video in videoList"
              :key="video.id"
              :label="video.title"
              :value="video.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="发布账号">
          <el-checkbox-group v-model="newTask.accounts">
            <el-checkbox 
              v-for="account in accounts" 
              :label="account.id" 
              :key="account.id">
              {{ account.nickname }} ({{ getPlatformName(account.platform) }})
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="定时时间">
          <el-date-picker
            v-model="newTask.scheduleTime"
            type="datetime"
            placeholder="选择发布时间"
            style="width: 100%;">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="视频标题">
          <el-input
            type="textarea"
            v-model="newTask.title"
            placeholder="请输入视频标题"
            :rows="3">
          </el-input>
        </el-form-item>

        <el-form-item label="添加话题">
          <el-tag
            :key="tag"
            v-for="tag in newTask.tags"
            closable
            @close="removeTag(tag)">
            #{{ tag }}
          </el-tag>
          <el-input
            v-if="tagInputVisible"
            v-model="tagInputValue"
            size="small"
            @keyup.enter.native="addTag"
            @blur="addTag"
            style="width: 100px; margin-left: 10px;">
          </el-input>
          <el-button 
            v-else 
            size="small" 
            @click="tagInputVisible = true"
            style="margin-left: 10px;">
            + 添加话题
          </el-button>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createSchedule">确认创建</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'VideoSchedule',
  data() {
    return {
      currentDate: new Date(),
      showCreateDialog: false,
      tagInputVisible: false,
      tagInputValue: '',
      newTask: {
        videoId: '',
        accounts: [],
        scheduleTime: '',
        title: '',
        tags: []
      },
      scheduledTasks: [
        {
          id: 1,
          title: '产品介绍视频',
          platform: 'douyin',
          account: '测试账号-抖音',
          scheduleTime: '2026-06-20 15:00:00',
          status: 'pending'
        },
        {
          id: 2,
          title: '品牌宣传片',
          platform: 'kuaishou',
          account: '测试账号-快手',
          scheduleTime: '2026-06-21 10:00:00',
          status: 'pending'
        }
      ],
      upcomingTasks: [
        {
          id: 1,
          title: '产品介绍视频',
          platform: 'douyin',
          account: '测试账号-抖音',
          scheduleTime: '2026-06-20 15:00:00',
          status: 'pending'
        },
        {
          id: 2,
          title: '品牌宣传片',
          platform: 'kuaishou',
          account: '测试账号-快手',
          scheduleTime: '2026-06-21 10:00:00',
          status: 'pending'
        }
      ],
      videoList: [
        { id: 1, title: '产品介绍视频' },
        { id: 2, title: '品牌宣传片' },
        { id: 3, title: '用户案例分享' }
      ],
      accounts: [
        { id: 1, nickname: '测试账号-抖音', platform: 'douyin' },
        { id: 2, nickname: '测试账号-快手', platform: 'kuaishou' },
        { id: 3, nickname: '测试账号-视频号', platform: 'shipinhao' }
      ]
    }
  },
  methods: {
    getPlatformName(platform) {
      const names = {
        douyin: '抖音',
        kuaishou: '快手',
        shipinhao: '视频号',
        xiaohongshu: '小红书'
      }
      return names[platform] || platform
    },
    getPlatformColor(platform) {
      const colors = {
        douyin: '#409EFF',
        kuaishou: '#E6A23C',
        shipinhao: '#67C23A',
        xiaohongshu: '#F56C6C'
      }
      return colors[platform] || '#909399'
    },
    getStatusType(status) {
      const types = {
        'pending': 'warning',
        'processing': '',
        'completed': 'success',
        'failed': 'danger'
      }
      return types[status] || ''
    },
    getStatusText(status) {
      const texts = {
        'pending': '等待中',
        'processing': '发布中',

'completed': '已完成',
        'failed': '失败'
      }
      return texts[status] || status
    },
    getTasksByDate(date) {
      // 这里应该根据日期筛选出对应的任务
      return this.scheduledTasks.filter(task => 
        task.scheduleTime.startsWith(date)
      )
    },
    removeTag(tag) {
      this.newTask.tags.splice(this.newTask.tags.indexOf(tag), 1)
    },
    addTag() {
      if (this.tagInputValue) {
        this.newTask.tags.push(this.tagInputValue)
      }
      this.tagInputVisible = false
      this.tagInputValue = ''
    },
    editTask(task) {
      this.$message.info(`编辑任务：${task.title}`)
      // 这里应该打开编辑对话框
    },
    cancelTask(task) {
      this.$confirm('确定要取消定时发布吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.upcomingTasks = this.upcomingTasks.filter(t => t.id !== task.id)
        this.scheduledTasks = this.scheduledTasks.filter(t => t.id !== task.id)
        this.$message.success('已取消定时发布')
      })
    },
    createSchedule() {
      if (!this.newTask.videoId) {
        this.$message.error('请选择视频')
        return
      }

      if (this.newTask.accounts.length === 0) {
        this.$message.error('请选择发布账号')
        return
      }

      if (!this.newTask.scheduleTime) {
        this.$message.error('请选择定时时间')
        return
      }

      this.$message.success('定时任务创建成功')
      this.showCreateDialog = false

      // 重置表单
      this.newTask = {
        videoId: '',
        accounts: [],
        scheduleTime: '',
        title: '',
        tags: []
      }
    }
  }
}
</script>

<style scoped>
.video-schedule {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-cell {
  min-height: 80px;
}

.calendar-date {
  font-weight: bold;
  margin-bottom: 5px;
}

.calendar-tasks {
  max-height: 60px;
  overflow-y: auto;
}

.calendar-task {
  font-size: 10px;
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
