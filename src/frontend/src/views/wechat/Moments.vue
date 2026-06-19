<template>
  <div class="moments-task">
    <div class="page-header">
      <h2>朋友圈任务</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <i class="el-icon-plus"></i> 新建朋友圈任务
      </el-button>
    </div>

    <!-- 任务列表 -->
    <el-table :data="tasks" style="width: 100%;" v-loading="loading">
      <el-table-column prop="name" label="任务名称" width="200"></el-table-column>
      <el-table-column prop="content" label="内容预览" width="300">
        <template slot-scope="scope">
          <div class="content-preview">{{ scope.row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="scheduleTime" label="发布时间" width="180">
        <template slot-scope="scope">
          {{ scope.row.scheduleTime || '立即发布' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="images" label="图片" width="100">
        <template slot-scope="scope">
          <el-tag size="mini">{{ scope.row.images ? scope.row.images.length : 0 }}张</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button size="mini" @click="previewTask(scope.row)">预览</el-button>
          <el-button 
            size="mini" 
            type="primary" 
            @click="editTask(scope.row)"
            :disabled="scope.row.status === 'published'">
            编辑
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

    <!-- 新建/编辑朋友圈任务对话框 -->
    <el-dialog :title="editMode ? '编辑朋友圈任务' : '新建朋友圈任务'" :visible.sync="showCreateDialog" width="700px">
      <el-form label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="newTask.name" placeholder="请输入任务名称"></el-input>
        </el-form-item>

        <el-form-item label="朋友圈内容">
          <el-input
            type="textarea"
            v-model="newTask.content"
            placeholder="请输入朋友圈内容"
            :rows="4">
          </el-input>
          <div style="font-size: 12px; color: #999; margin-top: 5px;">
            支持变量：{name} 客户姓名, {product} 产品名称
          </div>
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

          <div v-if="newTask.images.length > 0" class="image-preview">
            <div v-for="(img, index) in newTask.images" :key="index" class="image-item">
              <img :src="img.url" :alt="'图片' + (index + 1)">
              <el-button 
                size="mini" 
                type="danger" 
                icon="el-icon-delete" 
                circle
                @click="removeImage(index)"
                style="position: absolute; top: 5px; right: 5px;"></el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="发布方式">
          <el-radio-group v-model="newTask.publishMode">
            <el-radio label="immediate">立即发布</el-radio>
            <el-radio label="schedule">定时发布</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="newTask.publishMode === 'schedule'" label="定时时间">
          <el-date-picker
            v-model="newTask.scheduleTime"
            type="datetime"
            placeholder="选择发布时间"
            style="width: 100%;">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="可见范围">
          <el-radio-group v-model="newTask.visibility">
            <el-radio label="all">全部好友</el-radio>
            <el-radio label="part">部分好友</el-radio>
            <el-radio label="except">不给谁看</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="newTask.visibility !== 'all'" label="选择好友">
          <el-select v-model="newTask.visibilityFriends" multiple placeholder="请选择好友" style="width: 100%;">
            <el-option
              v-for="friend in friends"
              :key="friend.id"
              :label="friend.nickname"
              :value="friend.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="添加位置">
          <el-switch v-model="newTask.addLocation"></el-switch>
          <el-input 
            v-if="newTask.addLocation"
            v-model="newTask.location"
            placeholder="请输入位置信息"
            style="margin-top: 10px;"
            clearable>
          </el-input>
        </el-form-item>

        <el-form-item label="谁可以看">
          <el-checkbox v-model="newTask.allowComment">允许评论</el-checkbox>
          <el-checkbox v-model="newTask.allowLike">允许点赞</el-checkbox>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveTask">保存</el-button>
      </div>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog title="朋友圈预览" :visible.sync="showPreviewDialog" width="400px">
      <div v-if="previewTask" class="moments-preview">
        <div class="preview-header">
          <img :src="userAvatar" alt="我的头像" class="preview-avatar">
          <div class="preview-info">
            <div class="preview-name">{{ userName }}</div>
            <div class="preview-time">{{ formatTime(previewTask.scheduleTime) }}</div>
          </div>
        </div>

        <div class="preview-content">{{ previewTask.content }}</div>

        <div v-if="previewTask.images && previewTask.images.length > 0" class="preview-images">
          <div 
            v-for="(img, index) in previewTask.images" 
            :key="index"
            class="preview-image-item"
            :class="{ 'single': previewTask.images.length === 1, 'multiple': previewTask.images.length > 1 }">
            <img :src="img.url" :alt="'图片' + (index + 1)">
          </div>
        </div>

        <div class="preview-footer">
          <el-button size="mini" icon="el-icon-chat-dot-round">{{ previewTask.commentCount || 0 }} 评论</el-button>
          <el-button size="mini" icon="el-icon-star-off">{{ previewTask.likeCount || 0 }} 赞</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MomentsTask',
  data() {
    return {
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      showCreateDialog: false,
      showPreviewDialog: false,
      editMode: false,
      editId: null,
      newTask: {
        name: '',
        content: '',
        images: [],
        publishMode: 'immediate',
        scheduleTime: '',
        visibility: 'all',
        visibilityFriends: [],
        addLocation: false,
        location: '',
        allowComment: true,
        allowLike: true
      },
      previewTask: null,
      tasks: [
        {
          id: 1,
          name: '产品宣传朋友圈',
          content: '今天给大家推荐一款超好用的产品...',
          images: [
            { url: 'https://via.placeholder.com/300' },
            { url: 'https://via.placeholder.com/300' }
          ],
          scheduleTime: '',
          status: 'published',
          commentCount: 12,
          likeCount: 45
        },
        {
          id: 2,
          name: '活动推广朋友圈',
          content: '限时优惠活动开始了，快来参与吧...',
          images: [
            { url: 'https://via.placeholder.com/300' }
          ],
          scheduleTime: '2026-06-20 09:00:00',
          status: 'scheduled',
          commentCount: 0,
          likeCount: 0
        }
      ],
      friends: [
        { id: 1, nickname: '张三' },
        { id: 2, nickname: '李四' },
        { id: 3, nickname: '王五' }
      ],
      userAvatar: 'https://via.placeholder.com/60',
      userName: '我的昵称'
    }
  },
  mounted() {
    this.loadTasks()
  },
  methods: {
    formatTime(timeStr) {
      if (!timeStr) return '刚刚'
      const now = new Date()
      const time = new Date(timeStr)
      const diff = now - time

      if (diff < 60000) { // 1分钟内
        return '刚刚'
      } else if (diff < 3600000) { // 1小时内
        return Math.floor(diff / 60000) + '分钟前'
      } else if (diff < 86400000) { // 1天内
        return Math.floor(diff / 3600000) + '小时前'
      } else {
        return time.toLocaleDateString('zh-CN')
      }
    },
    getStatusType(status) {
      const types = {
        'pending': 'info',
        'scheduled': 'warning',
        'published': 'success',
        'failed': 'danger'
      }
      return types[status] || ''
    },
    getStatusText(status) {
      const texts = {
        'pending': '等待中',
        'scheduled': '定时中',
        'published': '已发布',
        'failed': '失败'
      }
      return texts[status] || status
    },
    loadTasks() {
      this.loading = true
      this.$http.get('/api/wechat/moments')
        .then(res => {
          if (res.data.success) {
            this.tasks = res.data.data
            this.total = res.data.data.length
          }
        })
        .catch(err => {
          this.$message.error('加载朋友圈任务失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleImageUpload(file) {
      const newImage = {
        url: URL.createObjectURL(file.raw),
        name: file.name
      }
      this.newTask.images.push(newImage)
    },
    removeImage(index) {
      this.newTask.images.splice(index, 1)
    },
    previewTask(task) {
      this.previewTask = task
      this.showPreviewDialog = true
    },
    editTask(task) {
      this.editMode = true
      this.editId = task.id
      this.newTask = {
        name: task.name,
        content: task.content,
        images: task.images || [],
        publishMode: task.scheduleTime ? 'schedule' : 'immediate',
        scheduleTime: task.scheduleTime,
        visibility: 'all',
        visibilityFriends: [],
        addLocation: !!task.location,
        location: task.location || '',
        allowComment: true,
        allowLike: true
      }
      this.showCreateDialog = true
    },
    deleteTask(task) {
      this.$confirm(`确定要删除朋友圈任务 "${task.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/api/wechat/moments/${task.id}`)
          .then(() => {
            this.tasks = this.tasks.filter(t => t.id !== task.id)
            this.$message.success('任务已删除')
          })
          .catch(err => {
            this.$message.error('删除任务失败')
          })
      })
    },
    saveTask() {
      if (!this.newTask.name) {
        this.$message.error('请输入任务名称')
        return
      }

      if (!this.newTask.content) {
        this.$message.error('请输入朋友圈内容')
        return
      }

      if (this.newTask.publishMode === 'schedule' && !this.newTask.scheduleTime) {
        this.$message.error('请选择定时发布时间')
        return
      }

      if (this.editMode) {
        // 更新任务
        this.$http.post('/api/wechat/moments', this.newTask)
          .then(() => {
            this.$message.success('任务更新成功')
            this.showCreateDialog = false
            this.loadTasks()
          })
          .catch(err => {
            this.$message.error('更新任务失败')
          })
      } else {
        // 创建任务
        this.$http.post('/api/wechat/moments', this.newTask)
          .then(() => {
            this.$message.success('朋友圈任务创建成功')
            this.showCreateDialog = false
            this.loadTasks()
            
            // 重置表单
            this.newTask = {
              name: '',
              content: '',
              images: [],
              publishMode: 'immediate',
              scheduleTime: '',
              visibility: 'all',
              visibilityFriends: [],
              addLocation: false,
              location: '',
              allowComment: true,
              allowLike: true
            }
          })
          .catch(err => {
            this.$message.error('创建任务失败')
          })
      }
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
.moments-task {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.content-preview {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 250px;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.moments-preview {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.preview-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.preview-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.preview-info {
  flex: 1;
}

.preview-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.preview-time {
  font-size: 12px;
  color: #999;
}

.preview-content {
  margin-bottom: 15px;
  line-height: 1.5;
}

.preview-images {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 15px;
}

.preview-image-item {
  overflow: hidden;
  border-radius: 4px;
}

.preview-image-item.single {
  width: 100%;
  max-height: 300px;
}

.preview-image-item.single img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-image-item.multiple {
  width: calc(33.33% - 5px);
  padding-top: calc(33.33% - 5px);
  position: relative;
}

.preview-image-item.multiple img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-footer {
  display: flex;
  justify-content: space-between;
}
</style>
