<template>
  <div class="video-materials">
    <div class="page-header">
      <h2>素材库</h2>
      <el-upload
        class="upload-btn"
        action="#"
        :auto-upload="false"
        :on-change="handleUpload"
        multiple>
        <el-button type="primary">
          <i class="el-icon-upload2"></i> 上传素材
        </el-button>
      </el-upload>
    </div>

    <!-- 分类标签 -->
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="全部素材" name="all"></el-tab-pane>
      <el-tab-pane label="视频素材" name="video"></el-tab-pane>
      <el-tab-pane label="图片素材" name="image"></el-tab-pane>
      <el-tab-pane label="音频素材" name="audio"></el-tab-pane>
      <el-tab-pane label="字幕模板" name="subtitle"></el-tab-pane>
    </el-tabs>

    <!-- 素材网格 -->
    <el-row :gutter="20" class="material-grid">
      <el-col :span="4" v-for="material in filteredMaterials" :key="material.id" class="material-item">
        <el-card shadow="hover" class="material-card">
          <div class="material-preview">
            <img v-if="material.type === 'image'" :src="material.url" :alt="material.name">
            <video v-else-if="material.type === 'video'" :src="material.url" preload="metadata"></video>
            <div v-else-if="material.type === 'audio'" class="audio-icon">
              <i class="el-icon-headset"></i>
            </div>
            <div v-else class="file-icon">
              <i class="el-icon-document"></i>
            </div>
            
            <div class="material-actions">
              <el-button size="mini" type="primary" @click="previewMaterial(material)">
                <i class="el-icon-view"></i>
              </el-button>
              <el-button size="mini" type="success" @click="useMaterial(material)">
                <i class="el-icon-check"></i>
              </el-button>
              <el-button size="mini" type="danger" @click="deleteMaterial(material)">
                <i class="el-icon-delete"></i>
              </el-button>
            </div>
          </div>
          
          <div class="material-info">
            <div class="material-name">{{ material.name }}</div>
            <div class="material-meta">
              <span class="material-size">{{ formatSize(material.size) }}</span>
              <span class="material-time">{{ material.createTime }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 空状态 -->
    <div v-if="filteredMaterials.length === 0" class="empty-state">
      <i class="el-icon-picture-outline"></i>
      <p>暂无素材，点击上方按钮上传</p>
    </div>

    <!-- 分页 -->
    <el-pagination
      style="margin-top: 20px; text-align: center;"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[24, 48, 96]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalMaterials">
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: 'VideoMaterials',
  data() {
    return {
      activeTab: 'all',
      currentPage: 1,
      pageSize: 24,
      totalMaterials: 100,
      materials: [
        {
          id: 1,
          name: '产品展示视频.mp4',
          type: 'video',
          url: 'https://via.placeholder.com/320x180',
          size: 52428800, // 50MB
          createTime: '2026-06-18'
        },
        {
          id: 2,
          name: '背景图片1.jpg',
          type: 'image',
          url: 'https://via.placeholder.com/320x180',
          size: 2097152, // 2MB
          createTime: '2026-06-17'
        },
        {
          id: 3,
          name: '背景音乐.mp3',
          type: 'audio',
          url: '',
          size: 5242880, // 5MB
          createTime: '2026-06-16'
        },
        {
          id: 4,
          name: '字幕模板.srt',
          type: 'subtitle',
          url: '',
          size: 10240, // 10KB
          createTime: '2026-06-15'
        }
      ]
    }
  },
  computed: {
    filteredMaterials() {
      if (this.activeTab === 'all') {
        return this.materials
      }
      return this.materials.filter(m => m.type === this.activeTab)
    }
  },
  methods: {
    formatSize(bytes) {
      if (bytes >= 1048576) {
        return (bytes / 1048576).toFixed(1) + 'MB'
      }
      if (bytes >= 1024) {
        return (bytes / 1024).toFixed(1) + 'KB'
      }
      return bytes + 'B'
    },
    handleTabClick() {
      // 切换标签
    },
    handleUpload(file) {
      this.$message.success(`素材 ${file.name} 上传成功`)
      // 这里应该调用后端API上传素材
    },
    previewMaterial(material) {
      this.$message.info(`预览素材：${material.name}`)
      // 这里应该打开预览对话框
    },
    useMaterial(material) {
      this.$message.success(`已添加素材：${material.name}`)
      // 这里应该将素材添加到当前编辑的任务中
    },
    deleteMaterial(material) {
      this.$confirm('确定要删除该素材吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.materials = this.materials.filter(m => m.id !== material.id)
        this.$message.success('素材已删除')
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.loadMaterials()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadMaterials()
    },
    loadMaterials() {
      // 调用后端API加载素材列表
      this.$http.get('/api/shortvideo/materials', {
        params: {
          page: this.currentPage,
          pageSize: this.pageSize,
          type: this.activeTab === 'all' ? '' : this.activeTab
        }
      }).then(res => {
        if (res.data.success) {
          this.materials = res.data.data.materials
          this.totalMaterials = res.data.data.total
        }
      }).catch(err => {
        this.$message.error('加载素材列表失败')
      })
    }
  },
  mounted() {
    this.loadMaterials()
  }
}
</script>

<style scoped>
.video-materials {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.upload-btn {
  display: inline-block;
}

.material-grid {
  margin-top: 20px;
}

.material-item {
  margin-bottom: 20px;
}

.material-card {
  transition: all 0.3s;
}

.material-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.material-preview {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  border-radius: 4px;
}

.material-preview img,
.material-preview video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.audio-icon,
.file-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  color: #999;
}

.material-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: none;
  gap: 5px;
}

.material-preview:hover .material-actions {
  display: flex;
}

.material-info {
  padding: 10px 0;
}

.material-name {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 5px;
}

.material-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  display: block;
}
</style>
