<template>
  <div class="video-library">
    <div class="page-header">
      <h2>视频库</h2>
      <div>
        <el-upload
          class="upload-btn"
          action="#"
          :auto-upload="false"
          :on-change="handleUpload"
          multiple>
          <el-button type="primary">
            <i class="el-icon-upload2"></i> 上传视频
          </el-button>
        </el-upload>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索视频标题"
        prefix-icon="el-icon-search"
        style="width: 300px; margin-right: 20px;">
      </el-input>

      <el-select v-model="filterPlatform" placeholder="平台筛选" clearable>
        <el-option label="抖音" value="douyin"></el-option>
        <el-option label="快手" value="kuaishou"></el-option>
        <el-option label="视频号" value="shipinhao"></el-option>
      </el-select>

      <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="margin-left: 10px;">
        <el-option label="已发布" value="published"></el-option>
        <el-option label="草稿" value="draft"></el-option>
        <el-option label="定时中" value="scheduled"></el-option>
      </el-select>
    </div>

    <!-- 视频网格 -->
    <el-row :gutter="20" class="video-grid">
      <el-col :span="6" v-for="video in filteredVideos" :key="video.id" class="video-item">
        <el-card shadow="hover" class="video-card">
          <div class="video-thumbnail">
            <img :src="video.thumbnail" :alt="video.title">
            <div class="video-duration">{{ video.duration }}</div>
            <div class="video-actions">
              <el-button size="mini" type="primary" @click="playVideo(video)">
                <i class="el-icon-video-play"></i>
              </el-button>
              <el-button size="mini" type="success" @click="editVideo(video)">
                <i class="el-icon-edit"></i>
              </el-button>
              <el-button size="mini" type="danger" @click="deleteVideo(video)">
                <i class="el-icon-delete"></i>
              </el-button>
            </div>
          </div>
          
          <div class="video-info">
            <h4 class="video-title">{{ video.title }}</h4>
            <div class="video-meta">
              <el-tag size="mini">{{ getPlatformName(video.platform) }}</el-tag>
              <span class="video-views">{{ formatNumber(video.views) }} 播放</span>
            </div>
            <div class="video-time">{{ video.createTime }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 空状态 -->
    <div v-if="filteredVideos.length === 0" class="empty-state">
      <i class="el-icon-video-camera"></i>
      <p>暂无视频，点击上方按钮上传</p>
    </div>

    <!-- 分页 -->
    <el-pagination
      style="margin-top: 20px; text-align: center;"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[12, 24, 48, 96]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalVideos">
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: 'VideoLibrary',
  data() {
    return {
      searchKeyword: '',
      filterPlatform: '',
      filterStatus: '',
      currentPage: 1,
      pageSize: 12,
      totalVideos: 50,
      videos: [
        {
          id: 1,
          title: '产品介绍视频',
          platform: 'douyin',
          status: 'published',
          thumbnail: 'https://via.placeholder.com/320x180',
          duration: '01:30',
          views: 125800,
          createTime: '2026-06-18 10:30:00'
        },
        {
          id: 2,
          title: '品牌宣传片',
          platform: 'kuaishou',
          status: 'published',
          thumbnail: 'https://via.placeholder.com/320x180',
          duration: '02:15',
          views: 89600,
          createTime: '2026-06-17 15:20:00'
        },
        {
          id: 3,
          title: '用户案例分享',
          platform: 'shipinhao',
          status: 'draft',
          thumbnail: 'https://via.placeholder.com/320x180',
          duration: '01:45',
          views: 0,
          createTime: '2026-06-16 09:15:00'
        },
        {
          id: 4,
          title: '新品发布预告',
          platform: 'douyin',
          status: 'scheduled',
          thumbnail: 'https://via.placeholder.com/320x180',
          duration: '00:45',
          views: 0,
          createTime: '2026-06-20 14:00:00'
        }
      ]
    }
  },
  computed: {
    filteredVideos() {
      let result = this.videos

      if (this.searchKeyword) {
        result = result.filter(v => v.title.includes(this.searchKeyword))
      }

      if (this.filterPlatform) {
        result = result.filter(v => v.platform === this.filterPlatform)
      }

      if (this.filterStatus) {
        result = result.filter(v => v.status === this.filterStatus)
      }

      return result
    }
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
    handleUpload(file) {
      this.$message.success(`视频 ${file.name} 上传成功`)
      // 这里应该调用后端API上传视频
    },
    playVideo(video) {
      this.$message.info(`播放视频：${video.title}`)
      // 这里应该打开视频播放器
    },
    editVideo(video) {
      this.$router.push({ name: 'VideoEdit', params: { id: video.id } })
    },
    deleteVideo(video) {
      this.$confirm('确定要删除该视频吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.videos = this.videos.filter(v => v.id !== video.id)
        this.$message.success('视频已删除')
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.loadVideos()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadVideos()
    },
    loadVideos() {
      // 调用后端API加载视频列表
      this.$http.get('/api/shortvideo/videos', {
        params: {
          page: this.currentPage,
          pageSize: this.pageSize,
          keyword: this.searchKeyword,
          platform: this.filterPlatform,
          status: this.filterStatus
        }
      }).then(res => {
        if (res.data.success) {
          this.videos = res.data.data.videos
          this.totalVideos = res.data.data.total
        }
      }).catch(err => {
        this.$message.error('加载视频列表失败')
      })
    }
  },
  mounted() {
    this.loadVideos()
  }
}
</script>

<style scoped>
.video-library {
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

.filter-section {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.video-grid {
  margin-top: 20px;
}

.video-item {
  margin-bottom: 20px;
}

.video-card {
  transition: all 0.3s;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.video-thumbnail {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  overflow: hidden;
  border-radius: 4px;
}

.video-thumbnail img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-duration {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
}

.video-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: none;
  gap: 5px;
}

.video-thumbnail:hover .video-actions {
  display: flex;
}

.video-info {
  padding: 10px 0;
}

.video-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.video-views {
  font-size: 12px;
  color: #999;
}

.video-time {
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
