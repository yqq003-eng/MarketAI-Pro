<template>
  <div class="customer-tags">
    <div class="page-header">
      <h2>标签管理</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <i class="el-icon-plus"></i> 新建标签
      </el-button>
    </div>

    <!-- 标签列表 -->
    <el-row :gutter="20" class="tags-grid">
      <el-col :span="6" v-for="tag in tags" :key="tag.id" class="tag-item">
        <el-card shadow="hover" class="tag-card">
          <div class="tag-header">
            <el-tag :color="tag.color" size="medium" effect="dark">{{ tag.name }}</el-tag>
            <el-dropdown trigger="click" @command="handleTagCommand($event, tag)">
              <el-button size="mini" icon="el-icon-more" circle></el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="edit">编辑</el-dropdown-item>
                <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          
          <div class="tag-stats">
            <div class="tag-count">{{ tag.count }} 人</div>
            <div class="tag-label">使用人数</div>
          </div>

          <div class="tag-actions">
            <el-button size="mini" type="text" @click="viewTagCustomers(tag)">
              查看成员
            </el-button>
            <el-button size="mini" type="text" @click="sendToTag(tag)">
              群发消息
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 空状态 -->
    <div v-if="tags.length === 0" class="empty-state">
      <i class="el-icon-collection-tag"></i>
      <p>暂无标签，点击上方按钮创建</p>
    </div>

    <!-- 新建/编辑标签对话框 -->
    <el-dialog :title="editMode ? '编辑标签' : '新建标签'" :visible.sync="showCreateDialog" width="500px">
      <el-form label-width="100px">
        <el-form-item label="标签名称">
          <el-input v-model="newTag.name" placeholder="请输入标签名称"></el-input>
        </el-form-item>

        <el-form-item label="标签颜色">
          <el-color-picker v-model="newTag.color"></el-color-picker>
        </el-form-item>

        <el-form-item label="适用人群">
          <el-checkbox-group v-model="newTag.applicableTo">
            <el-checkbox label="friends">好友</el-checkbox>
            <el-checkbox label="groups">群聊</el-checkbox>
            <el-checkbox label="strangers">陌生人</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="自动打标">
          <el-switch v-model="newTag.autoTag"></el-switch>
          <span style="margin-left: 10px; color: #999;">根据关键词自动给客户打标签</span>
        </el-form-item>

        <el-form-item v-if="newTag.autoTag" label="关键词">
          <el-tag
            :key="keyword"
            v-for="keyword in newTag.keywords"
            closable
            @close="removeKeyword(keyword)">
            {{ keyword }}
          </el-tag>
          <el-input
            v-if="keywordInputVisible"
            v-model="keywordInputValue"
            size="small"
            @keyup.enter.native="addKeyword"
            @blur="addKeyword"
            style="width: 100px; margin-left: 10px;">
          </el-input>
          <el-button 
            v-else 
            size="small" 
            @click="keywordInputVisible = true"
            style="margin-left: 10px;">
            + 添加关键词
          </el-button>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveTag">保存</el-button>
      </div>
    </el-dialog>

    <!-- 标签成员对话框 -->
    <el-dialog :title="`${activeTag ? activeTag.name : ''} - 成员列表`" :visible.sync="showMembersDialog" width="700px">
      <el-table :data="tagMembers" style="width: 100%">
        <el-table-column prop="nickname" label="昵称" width="150"></el-table-column>
        <el-table-column prop="wechatId" label="微信号" width="150"></el-table-column>
        <el-table-column prop="phone" label="手机号" width="150"></el-table-column>
        <el-table-column prop="lastChatTime" label="最后对话" width="180"></el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button size="mini" @click="chatWithCustomer(scope.row)">聊天</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div slot="footer">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalMembers">
        </el-pagination>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'CustomerTags',
  data() {
    return {
      showCreateDialog: false,
      showMembersDialog: false,
      editMode: false,
      keywordInputVisible: false,
      keywordInputValue: '',
      activeTag: null,
      currentPage: 1,
      pageSize: 10,
      totalMembers: 0,
      tags: [
        {
          id: 1,
          name: '潜在客户',
          color: '#409EFF',
          count: 45,
          applicableTo: ['friends'],
          autoTag: false,
          keywords: []
        },
        {
          id: 2,
          name: '已联系',
          color: '#67C23A',
          count: 32,
          applicableTo: ['friends'],
          autoTag: false,
          keywords: []
        },
        {
          id: 3,
          name: '意向度高',
          color: '#E6A23C',
          count: 18,
          applicableTo: ['friends'],
          autoTag: true,
          keywords: ['价格', '多少钱', '怎么买']
        },
        {
          id: 4,
          name: '已成交',
          color: '#F56C6C',
          count: 12,
          applicableTo: ['friends'],
          autoTag: false,
          keywords: []
        }
      ],
      newTag: {
        name: '',
        color: '#409EFF',
        applicableTo: [],
        autoTag: false,
        keywords: []
      },
      tagMembers: [
        {
          id: 1,
          nickname: '张三',
          wechatId: 'zhangsan123',
          phone: '13800138000',
          lastChatTime: '2026-06-19 15:30:00'
        },
        {
          id: 2,
          nickname: '李四',
          wechatId: 'lisi456',
          phone: '13900139000',
          lastChatTime: '2026-06-18 10:20:00'
        }
      ]
    }
  },
  mounted() {
    this.loadTags()
  },
  methods: {
    loadTags() {
      this.$http.get('/api/wechat/tags')
        .then(res => {
          if (res.data.success) {
            this.tags = res.data.data
          }
        })
        .catch(err => {
          this.$message.error('加载标签列表失败')
        })
    },
    handleTagCommand(command, tag) {
      if (command === 'edit') {
        this.editTag(tag)
      } else if (command === 'delete') {
        this.deleteTag(tag)
      }
    },
    editTag(tag) {
      this.editMode = true
      this.newTag = { ...tag }
      this.showCreateDialog = true
    },
    deleteTag(tag) {
      this.$confirm(`确定要删除标签 "${tag.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/api/wechat/tags/${tag.id}`)
          .then(() => {
            this.tags = this.tags.filter(t => t.id !== tag.id)
            this.$message.success('标签已删除')
          })
          .catch(err => {
            this.$message.error('删除标签失败')
          })
      })
    },
    saveTag() {
      if (!this.newTag.name) {
        this.$message.error('请输入标签名称')
        return
      }

      if (this.editMode) {
        // 更新标签
        this.$http.post('/api/wechat/tags', this.newTag)
          .then(() => {
            this.$message.success('标签更新成功')
            this.showCreateDialog = false
            this.loadTags()
          })
          .catch(err => {
            this.$message.error('更新标签失败')
          })
      } else {
        // 创建标签
        this.$http.post('/api/wechat/tags', this.newTag)
          .then(() => {
            this.$message.success('标签创建成功')
            this.showCreateDialog = false
            this.loadTags()
            
            // 重置表单
            this.newTag = {
              name: '',
              color: '#409EFF',
              applicableTo: [],
              autoTag: false,
              keywords: []
            }
          })
          .catch(err => {
            this.$message.error('创建标签失败')
          })
      }
    },
    viewTagCustomers(tag) {
      this.activeTag = tag
      this.showMembersDialog = true
      
      // 加载标签成员
      this.$http.get(`/api/wechat/tags/${tag.id}/members`)
        .then(res => {
          if (res.data.success) {
            this.tagMembers = res.data.data.members
            this.totalMembers = res.data.data.total
          }
        })
        .catch(err => {
          this.$message.error('加载成员列表失败')
        })
    },
    sendToTag(tag) {
      this.$router.push({ 
        name: 'MassSend', 
        query: { tagId: tag.id, tagName: tag.name } 
      })
    },
    chatWithCustomer(customer) {
      this.$router.push({ 
        name: 'AggregateChat', 
        query: { customerId: customer.id } 
      })
    },
    removeKeyword(keyword) {
      this.newTag.keywords.splice(this.newTag.keywords.indexOf(keyword), 1)
    },
    addKeyword() {
      if (this.keywordInputValue) {
        this.newTag.keywords.push(this.keywordInputValue)
      }
      this.keywordInputVisible = false
      this.keywordInputValue = ''
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.loadTagMembers()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadTagMembers()
    },
    loadTagMembers() {
      // 加载标签成员（分页）
      console.log('Load tag members:', this.currentPage, this.pageSize)
    }
  }
}
</script>

<style scoped>
.customer-tags {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tags-grid {
  margin-top: 20px;
}

.tag-item {
  margin-bottom: 20px;
}

.tag-card {
  transition: all 0.3s;
}

.tag-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.tag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.tag-stats {
  text-align: center;
  padding: 15px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
}

.tag-count {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.tag-label {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.tag-actions {
  display: flex;
  justify-content: space-between;
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
