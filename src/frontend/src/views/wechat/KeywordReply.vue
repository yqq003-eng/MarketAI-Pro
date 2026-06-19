<template>
  <div class="keyword-reply">
    <div class="page-header">
      <h2>关键词回复</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <i class="el-icon-plus"></i> 添加关键词
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索关键词"
        prefix-icon="el-icon-search"
        style="width: 300px; margin-right: 20px;">
      </el-input>

      <el-select v-model="filterStatus" placeholder="状态筛选" clearable>
        <el-option label="启用" :value="true"></el-option>
        <el-option label="禁用" :value="false"></el-option>
      </el-select>

      <el-select v-model="filterMatchType" placeholder="匹配方式" clearable style="margin-left: 10px;">
        <el-option label="精确匹配" value="exact"></el-option>
        <el-option label="模糊匹配" value="fuzzy"></el-option>
      </el-select>
    </div>

    <!-- 关键词列表 -->
    <el-table :data="filteredReplies" style="width: 100%" v-loading="loading">
      <el-table-column prop="keyword" label="关键词" width="150"></el-table-column>
      <el-table-column prop="reply" label="回复内容" width="350">
        <template slot-scope="scope">
          <div class="reply-preview">{{ scope.row.reply }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="matchType" label="匹配方式" width="120">
        <template slot-scope="scope">
          <el-tag size="small">
            {{ scope.row.matchType === 'exact' ? '精确匹配' : '模糊匹配' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.status" @change="toggleStatus(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="useCount" label="使用次数" width="100" sortable></el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <el-button size="mini" @click="editReply(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="deleteReply(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <div v-if="filteredReplies.length === 0 && !loading" class="empty-state">
      <i class="el-icon-chat-line"></i>
      <p>暂无关键词，点击上方按钮添加</p>
    </div>

    <!-- 分页 -->
    <el-pagination
      style="margin-top: 20px; text-align: center;"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalReplies">
    </el-pagination>

    <!-- 新建/编辑关键词对话框 -->
    <el-dialog :title="editMode ? '编辑关键词' : '添加关键词'" :visible.sync="showCreateDialog" width="600px">
      <el-form label-width="100px">
        <el-form-item label="关键词">
          <el-input v-model="newReply.keyword" placeholder="请输入关键词"></el-input>
        </el-form-item>

        <el-form-item label="匹配方式">
          <el-radio-group v-model="newReply.matchType">
            <el-radio label="exact">精确匹配</el-radio>
            <el-radio label="fuzzy">模糊匹配</el-radio>
          </el-radio-group>
          <div style="font-size: 12px; color: #999; margin-top: 5px;">
            精确匹配：必须完全一致才触发<br>
            模糊匹配：包含关键词即触发
          </div>
        </el-form-item>

        <el-form-item label="回复内容">
          <el-input
            type="textarea"
            v-model="newReply.reply"
            placeholder="请输入回复内容"
            :rows="4">
          </el-input>
        </el-form-item>

        <el-form-item label="回复类型">
          <el-checkbox-group v-model="newReply.replyTypes">
            <el-checkbox label="text">文本</el-checkbox>
            <el-checkbox label="image">图片</el-checkbox>
            <el-checkbox label="voice">语音</el-checkbox>
            <el-checkbox label="video">视频</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item v-if="newReply.replyTypes.includes('image')" label="回复图片">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleImageUpload">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">支持jpg、png格式</div>
          </el-upload>
        </el-form-item>

        <el-form-item label="延迟回复">
          <el-switch v-model="newReply.delayReply"></el-switch>
          <span style="margin-left: 10px; color: #999;">开启后，收到消息后延迟回复，更真实</span>
        </el-form-item>

        <el-form-item v-if="newReply.delayReply" label="延迟时间">
          <el-slider
            v-model="newReply.delayTime"
            :min="1"
            :max="60"
            show-input>
          </el-slider>
          <div style="font-size: 12px; color: #999;">单位：秒</div>
        </el-form-item>

        <el-form-item label="启用状态">
          <el-switch v-model="newReply.status"></el-switch>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveReply">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'KeywordReply',
  data() {
    return {
      loading: false,
      searchKeyword: '',
      filterStatus: '',
      filterMatchType: '',
      currentPage: 1,
      pageSize: 10,
      totalReplies: 0,
      showCreateDialog: false,
      editMode: false,
      editId: null,
      newReply: {
        keyword: '',
        matchType: 'exact',
        reply: '',
        replyTypes: ['text'],
        delayReply: false,
        delayTime: 5,
        status: true
      },
      replies: [
        {
          id: 1,
          keyword: '价格',
          reply: '我们的产品价格非常优惠，具体可以加我微信详细沟通哦~',
          matchType: 'exact',
          status: true,
          useCount: 45
        },
        {
          id: 2,
          keyword: '怎么用',
          reply: '您好！产品使用很简单，我发您一个教程视频，一看就懂~',
          matchType: 'fuzzy',
          status: true,
          useCount: 32
        },
        {
          id: 3,
          keyword: '好不好用',
          reply: '产品非常好用，很多客户都反馈效果很不错，您可以试试看~',
          matchType: 'fuzzy',
          status: true,
          useCount: 28
        }
      ]
    }
  },
  computed: {
    filteredReplies() {
      let result = this.replies

      if (this.searchKeyword) {
        result = result.filter(r => r.keyword.includes(this.searchKeyword))
      }

      if (this.filterStatus !== '') {
        result = result.filter(r => r.status === this.filterStatus)
      }

      if (this.filterMatchType) {
        result = result.filter(r => r.matchType === this.filterMatchType)
      }

      return result
    }
  },
  mounted() {
    this.loadReplies()
  },
  methods: {
    loadReplies() {
      this.loading = true
      this.$http.get('/api/wechat/keyword-replies')
        .then(res => {
          if (res.data.success) {
            this.replies = res.data.data
            this.totalReplies = res.data.data.length
          }
        })
        .catch(err => {
          this.$message.error('加载关键词回复失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    toggleStatus(reply) {
      this.$message.success(`关键词 "${reply.keyword}" 已${reply.status ? '启用' : '禁用'}`)
      // 这里应该调用后端API更新状态
    },
    editReply(reply) {
      this.editMode = true
      this.editId = reply.id
      this.newReply = { ...reply }
      this.showCreateDialog = true
    },
    deleteReply(reply) {
      this.$confirm(`确定要删除关键词 "${reply.keyword}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/api/wechat/keyword-replies/${reply.id}`)
          .then(() => {
            this.replies = this.replies.filter(r => r.id !== reply.id)
            this.$message.success('关键词已删除')
          })
          .catch(err => {
            this.$message.error('删除关键词失败')
          })
      })
    },
    saveReply() {
      if (!this.newReply.keyword) {
        this.$message.error('请输入关键词')
        return
      }

      if (!this.newReply.reply) {
        this.$message.error('请输入回复内容')
        return
      }

      if (this.editMode) {
        // 更新关键词回复
        this.$http.post('/api/wechat/keyword-replies', this.newReply)
          .then(() => {
            this.$message.success('关键词更新成功')
            this.showCreateDialog = false
            this.loadReplies()
            
            // 重置表单
            this.editMode = false
            this.editId = null
            this.newReply = {
              keyword: '',
              matchType: 'exact',
              reply: '',
              replyTypes: ['text'],
              delayReply: false,
              delayTime: 5,
              status: true
            }
          })
          .catch(err => {
            this.$message.error('更新关键词失败')
          })
      } else {
        // 创建关键词回复
        this.$http.post('/api/wechat/keyword-replies', this.newReply)
          .then(() => {
            this.$message.success('关键词创建成功')
            this.showCreateDialog = false
            this.loadReplies()
            
            // 重置表单
            this.newReply = {
              keyword: '',
              matchType: 'exact',
              reply: '',
              replyTypes: ['text'],
              delayReply: false,
              delayTime: 5,
              status: true
            }
          })
          .catch(err => {
            this.$message.error('创建关键词失败')
          })
      }
    },
    handleImageUpload(file) {
      this.$message.success(`图片 ${file.name} 上传成功`)
      // 这里应该调用后端API上传图片
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.loadReplies()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadReplies()
    }
  }
}
</script>

<style scoped>
.keyword-reply {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-section {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.reply-preview {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
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
