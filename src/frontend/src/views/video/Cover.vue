<template>
  <div class="video-cover">
    <div class="page-header">
      <h2>封面生成</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <i class="el-icon-picture-outline"></i> 生成封面
      </el-button>
    </div>

    <!-- 封面模板 -->
    <div class="section-title">封面模板</div>
    <el-row :gutter="20" class="template-grid">
      <el-col :span="6" v-for="template in templates" :key="template.id" class="template-item">
        <el-card shadow="hover" class="template-card" :class="{ 'active': selectedTemplate === template.id }" @click.native="selectTemplate(template)">
          <img :src="template.thumbnail" :alt="template.name" class="template-thumbnail">
          <div class="template-name">{{ template.name }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 我的封面 -->
    <div class="section-title" style="margin-top: 40px;">我的封面</div>
    <el-row :gutter="20" class="cover-grid">
      <el-col :span="6" v-for="cover in covers" :key="cover.id" class="cover-item">
        <el-card shadow="hover" class="cover-card">
          <div class="cover-preview">
            <img :src="cover.url" :alt="cover.title">
            <div class="cover-actions">
              <el-button size="mini" type="primary" @click="editCover(cover)">
                <i class="el-icon-edit"></i>
              </el-button>
              <el-button size="mini" type="success" @click="downloadCover(cover)">
                <i class="el-icon-download"></i>
              </el-button>
              <el-button size="mini" type="danger" @click="deleteCover(cover)">
                <i class="el-icon-delete"></i>
              </el-button>
            </div>
          </div>
          
          <div class="cover-info">
            <div class="cover-title">{{ cover.title }}</div>
            <div class="cover-time">{{ cover.createTime }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 空状态 -->
    <div v-if="covers.length === 0" class="empty-state">
      <i class="el-icon-picture-outline"></i>
      <p>暂无封面，点击上方按钮生成</p>
    </div>

    <!-- 生成封面对话框 -->
    <el-dialog title="生成封面" :visible.sync="showCreateDialog" width="800px">
      <el-form label-width="120px">
        <el-form-item label="选择模板">
          <el-select v-model="newCover.templateId" placeholder="请选择模板" style="width: 100%;">
            <el-option
              v-for="template in templates"
              :key="template.id"
              :label="template.name"
              :value="template.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="背景图片">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleImageUpload">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">支持jpg、png格式，建议尺寸1080x1920</div>
          </el-upload>
        </el-form-item>

        <el-form-item label="标题文字">
          <el-input v-model="newCover.title" placeholder="请输入标题文字"></el-input>
        </el-form-item>

        <el-form-item label="标题样式">
          <el-color-picker v-model="newCover.titleColor"></el-color-picker>
          <el-slider 
            v-model="newCover.titleSize" 
            :min="20" 
            :max="100"
            style="width: 200px; margin-left: 20px; display: inline-block;">
          </el-slider>
        </el-form-item>

        <el-form-item label="添加二维码">
          <el-switch v-model="newCover.addQrcode"></el-switch>
          <span style="margin-left: 10px; color: #999;">在封面右下角添加二维码</span>
        </el-form-item>

        <el-form-item label="生成数量">
          <el-input-number v-model="newCover.count" :min="1" :max="10"></el-input-number>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="generateCover">开始生成</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'CoverGenerate',
  data() {
    return {
      showCreateDialog: false,
      selectedTemplate: null,
      newCover: {
        templateId: '',
        image: null,
        title: '',
        titleColor: '#FFFFFF',
        titleSize: 40,
        addQrcode: false,
        count: 1
      },
      templates: [
        {
          id: 1,
          name: '简约风格',
          thumbnail: 'https://via.placeholder.com/320x180'
        },
        {
          id: 2,
          name: '华丽风格',
          thumbnail: 'https://via.placeholder.com/320x180'
        },
        {
          id: 3,
          name: '商务风格',
          thumbnail: 'https://via.placeholder.com/320x180'
        },
        {
          id: 4,
          name: '科技风格',
          thumbnail: 'https://via.placeholder.com/320x180'
        }
      ],
      covers: [
        {
          id: 1,
          title: '产品介绍封面',
          url: 'https://via.placeholder.com/320x180',
          createTime: '2026-06-18 10:30:00'
        },
        {
          id: 2,
          title: '品牌宣传封面',
          url: 'https://via.placeholder.com/320x180',
          createTime: '2026-06-17 15:20:00'
        }
      ]
    }
  },
  methods: {
    selectTemplate(template) {
      this.selectedTemplate = template.id
      this.newCover.templateId = template.id
    },
    handleImageUpload(file) {
      this.newCover.image = file.raw
    },
    editCover(cover) {
      this.$message.info(`编辑封面：${cover.title}`)
      // 这里应该打开编辑对话框
    },
    downloadCover(cover) {
      this.$message.success('开始下载封面...')
      // 调用后端API下载封面
    },
    deleteCover(cover) {
      this.$confirm('确定要删除该封面吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.covers = this.covers.filter(c => c.id !== cover.id)
        this.$message.success('封面已删除')
      })
    },
    generateCover() {
      if (!this.newCover.templateId) {
        this.$message.error('请选择模板')
        return
      }

      if (!this.newCover.image) {
        this.$message.error('请上传背景图片')
        return
      }

      this.$message.success('封面生成任务已创建，正在处理中...')
      this.showCreateDialog = false
      
      // 重置表单
      this.newCover = {
        templateId: '',
        image: null,
        title: '',
        titleColor: '#FFFFFF',
        titleSize: 40,
        addQrcode: false,
        count: 1
      }
    }
  }
}
</script>

<style scoped>
.video-cover {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133;
}

.template-grid {
  margin-top: 20px;
}

.template-item {
  margin-bottom: 20px;
}

.template-card {
  cursor: pointer;
  transition: all 0.3s;
}

.template-card:hover,
.template-card.active {
  border-color: #409EFF;
  transform: translateY(-5px);
}

.template-thumbnail {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 4px;
}

.template-name {
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
}

.cover-grid {
  margin-top: 20px;
}

.cover-item {
  margin-bottom: 20px;
}

.cover-card {
  transition: all 0.3s;
}

.cover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.cover-preview {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  overflow: hidden;
  border-radius: 4px;
}

.cover-preview img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: none;
  gap: 5px;
}

.cover-preview:hover .cover-actions {
  display: flex;
}

.cover-info {
  padding: 10px 0;
}

.cover-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cover-time {
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

.upload-demo {
  width: 100%;
}
</style>
