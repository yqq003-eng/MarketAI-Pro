<template>
  <div class="video-edit">
    <div class="page-header">
      <h2>多场景剪辑</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <i class="el-icon-plus"></i> 新建剪辑任务
      </el-button>
    </div>

    <!-- 剪辑任务列表 -->
    <el-table :data="editTasks" style="width: 100%">
      <el-table-column prop="name" label="任务名称" width="200"></el-table-column>
      <el-table-column prop="type" label="剪辑类型" width="120">
        <template slot-scope="scope">
          <el-tag>{{ getTypeName(scope.row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sceneCount" label="场景数" width="100"></el-table-column>
      <el-table-column prop="progress" label="进度" width="150">
        <template slot-scope="scope">
          <el-progress :percentage="scope.row.progress"></el-progress>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button size="mini" @click="previewTask(scope.row)">预览</el-button>
          <el-button 
            size="mini" 
            type="primary" 
            @click="downloadTask(scope.row)"
            :disabled="scope.row.status !== 'completed'">
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

    <!-- 新建剪辑任务对话框 -->
    <el-dialog title="新建剪辑任务" :visible.sync="showCreateDialog" width="800px">
      <el-form label-width="120px">
        <el-form-item label="任务名称">
          <el-input v-model="newTask.name" placeholder="请输入任务名称"></el-input>
        </el-form-item>

        <el-form-item label="剪辑类型">
          <el-radio-group v-model="newTask.type">
            <el-radio label="scene">场景替换</el-radio>
            <el-radio label="multi">多版本生成</el-radio>
            <el-radio label="batch">批量剪辑</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="原始视频">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleVideoUpload">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">支持mp4、mov格式</div>
          </el-upload>
        </el-form-item>

        <el-form-item label="场景素材" v-if="newTask.type === 'scene'">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleSceneUpload"
            multiple>
            <el-button size="small" type="primary">上传场景素材</el-button>
            <div slot="tip" class="el-upload__tip">支持图片、视频格式</div>
          </el-upload>
        </el-form-item>

        <el-form-item label="生成数量" v-if="newTask.type === 'multi'">
          <el-input-number v-model="newTask.count" :min="1" :max="100"></el-input-number>
        </el-form-item>

        <el-form-item label="添加字幕">
          <el-switch v-model="newTask.addSubtitle"></el-switch>
        </el-form-item>

        <el-form-item label="背景音乐" v-if="newTask.addSubtitle">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleMusicUpload">
            <el-button size="small" type="primary">上传BGM</el-button>
          </el-upload>
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
  name: 'VideoEdit',
  data() {
    return {
      showCreateDialog: false,
      editTasks: [
        {
          id: 1,
          name: '产品场景替换',
          type: 'scene',
          status: 'completed',
          sceneCount: 5,
          progress: 100,
          createTime: '2026-06-18 10:30:00'
        },
        {
          id: 2,
          name: '多版本生成',
          type: 'multi',
          status: 'processing',
          sceneCount: 10,
          progress: 60,
          createTime: '2026-06-19 14:20:00'
        }
      ],
      newTask: {
        name: '',
        type: 'scene',
        video: null,
        scenes: [],
        count: 1,
        addSubtitle: false,
        bgm: null
      }
    }
  },
  methods: {
    getTypeName(type) {
      const names = {
        'scene': '场景替换',
        'multi': '多版本生成',
        'batch': '批量剪辑'
      }
      return names[type] || type
    },
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
    handleVideoUpload(file) {
      this.newTask.video = file.raw
    },
    handleSceneUpload(file) {
      this.newTask.scenes.push(file.raw)
    },
    handleMusicUpload(file) {
      this.newTask.bgm = file.raw
    },
    previewTask(task) {
      this.$message.info(`预览任务：${task.name}`)
    },
    downloadTask(task) {
      this.$message.success('开始下载...')
    },
    deleteTask(task) {
      this.$confirm('确定要删除该任务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.editTasks = this.editTasks.filter(t => t.id !== task.id)
        this.$message.success('任务已删除')
      })
    },
    createTask() {
      if (!this.newTask.name) {
        this.$message.error('请输入任务名称')
        return
      }

      if (!this.newTask.video) {
        this.$message.error('请上传原始视频')
        return
      }

      this.$message.success('剪辑任务创建成功，正在处理中...')
      this.showCreateDialog = false
      
      // 重置表单
      this.newTask = {
        name: '',
        type: 'scene',
        video: null,
        scenes: [],
        count: 1,
        addSubtitle: false,
        bgm: null
      }
    }
  }
}
</script>

<style scoped>
.video-edit {
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
