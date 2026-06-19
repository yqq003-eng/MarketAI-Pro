<template>
  <div class="friend-list">
    <div class="page-header">
      <h2>好友列表</h2>
      <div>
        <el-button type="success" @click="exportFriends">
          <i class="el-icon-download"></i> 导出好友
        </el-button>
        <el-button type="primary" @click="showAddDialog = true">
          <i class="el-icon-plus"></i> 添加好友
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索好友"
        prefix-icon="el-icon-search"
        style="width: 300px; margin-right: 20px;">
      </el-input>

      <el-select v-model="filterTag" placeholder="标签筛选" clearable>
        <el-option
          v-for="tag in tags"
          :key="tag.id"
          :label="tag.name"
          :value="tag.id">
        </el-option>
      </el-select>

      <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="margin-left: 10px;">
        <el-option label="活跃" value="active"></el-option>
        <el-option label="离线" value="offline"></el-option>
        <el-option label="已回复" value="replied"></el-option>
      </el-select>
    </div>

    <!-- 好友列表 -->
    <el-table :data="filteredFriends" style="width: 100%" v-loading="loading">
      <el-table-column prop="avatar" label="头像" width="80">
        <template slot-scope="scope">
          <img :src="scope.row.avatar" :alt="scope.row.nickname" class="friend-avatar">
        </template>
      </el-table-column>
      <el-table-column prop="nickname" label="昵称" width="150"></el-table-column>
      <el-table-column prop="wechatId" label="微信号" width="150"></el-table-column>
      <el-table-column prop="phone" label="手机" width="150"></el-table-column>
      <el-table-column prop="tags" label="标签" width="200">
        <template slot-scope="scope">
          <el-tag 
            v-for="tag in scope.row.tags" 
            :key="tag"
            size="mini"
            style="margin-right: 5px;">
            {{ tag }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastChatTime" label="最后对话" width="180"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'" size="small">
            {{ scope.row.status === 'active' ? '活跃' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button size="mini" @click="chatWithFriend(scope.row)">聊天</el-button>
          <el-button size="mini" type="primary" @click="viewFriendDetail(scope.row)">详情</el-button>
          <el-button size="mini" type="danger" @click="deleteFriend(scope.row)">删除</el-button>
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
      :total="totalFriends">
    </el-pagination>

    <!-- 添加好友对话框 -->
    <el-dialog title="添加好友" :visible.sync="showAddDialog" width="500px">
      <el-form label-width="100px">
        <el-form-item label="微信号/手机号">
          <el-input v-model="newFriend.wechatId" placeholder="请输入微信号或手机号"></el-input>
        </el-form-item>

        <el-form-item label="验证信息">
          <el-input
            type="textarea"
            v-model="newFriend.verifyMsg"
            placeholder="请输入验证信息"
            :rows="3">
          </el-input>
        </el-form-item>

        <el-form-item label="备注名">
          <el-input v-model="newFriend.remark" placeholder="设置备注名（可选）"></el-input>
        </el-form-item>

        <el-form-item label="打标签">
          <el-checkbox-group v-model="newFriend.tags">
            <el-checkbox 
              v-for="tag in tags" 
              :label="tag.id" 
              :key="tag.id">
              {{ tag.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addFriend">发送好友申请</el-button>
      </div>
    </el-dialog>

    <!-- 好友详情对话框 -->
    <el-dialog title="好友详情" :visible.sync="showDetailDialog" width="600px">
      <div v-if="selectedFriend" class="friend-detail">
        <div class="detail-header">
          <img :src="selectedFriend.avatar" :alt="selectedFriend.nickname" class="detail-avatar">
          <div class="detail-info">
            <h3>{{ selectedFriend.nickname }}</h3>
            <p>微信号：{{ selectedFriend.wechatId }}</p>
            <p>手机：{{ selectedFriend.phone }}</p>
            <p>来源：{{ selectedFriend.source || '通过搜索' }}</p>
          </div>
        </div>

        <el-divider></el-divider>

        <div class="detail-tags">
          <span>标签：</span>
          <el-tag 
            v-for="tag in selectedFriend.tags" 
            :key="tag"
            style="margin-right: 5px;">
            {{ tag }}
          </el-tag>
          <el-button size="mini" @click="showEditTagDialog = true">编辑标签</el-button>
        </div>

        <el-divider></el-divider>

        <div class="detail-chat-history">
          <p><strong>最近聊天：</strong></p>
          <div class="chat-preview">
            <div v-for="msg in chatHistory" :key="msg.id" class="chat-msg-item">
              <div class="msg-time">{{ msg.time }}</div>
              <div class="msg-content">{{ msg.content }}</div>
            </div>
          </div>
        </div>

        <div slot="footer">
          <el-button @click="showDetailDialog = false">关闭</el-button>
          <el-button type="primary" @click="chatWithFriend(selectedFriend)">发消息</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'FriendList',
  data() {
    return {
      loading: false,
      searchKeyword: '',
      filterTag: '',
      filterStatus: '',
      currentPage: 1,
      pageSize: 10,
      totalFriends: 0,
      showAddDialog: false,
      showDetailDialog: false,
      showEditTagDialog: false,
      selectedFriend: null,
      newFriend: {
        wechatId: '',
        verifyMsg: '您好，我是...',
        remark: '',
        tags: []
      },
      friends: [
        {
          id: 1,
          nickname: '张三',
          avatar: 'https://via.placeholder.com/60',
          wechatId: 'zhangsan123',
          phone: '13800138000',
          tags: ['潜在客户', '意向度高'],
          lastChatTime: '2026-06-19 15:30:00',
          status: 'active',
          source: '通过搜索'
        },
        {
          id: 2,
          nickname: '李四',
          avatar: 'https://via.placeholder.com/60',
          wechatId: 'lisi456',
          phone: '13900139000',
          tags: ['已联系'],
          lastChatTime: '2026-06-18 10:20:00',
          status: 'replied',
          source: '通过群聊'
        },
        {
          id: 3,
          nickname: '王五',
          avatar: 'https://via.placeholder.com/60',
          wechatId: 'wangwu789',
          phone: '13700137000',
          tags: ['意向度高'],
          lastChatTime: '2026-06-20 09:15:00',
          status: 'active',
          source: '通过名片分享'
        }
      ],
      tags: [
        { id: 1, name: '潜在客户' },
        { id: 2, name: '已联系' },
        { id: 3, name: '意向度高' },
        { id: 4, name: '已成交' }
      ],
      chatHistory: [
        {
          id: 1,
          time: '2026-06-19 15:30:00',
          content: '您好，我想了解一下产品'
        },
        {
          id: 2,
          time: '2026-06-19 15:32:00',
          content: '好的，我发您详细资料'
        }
      ]
    }
  },
  computed: {
    filteredFriends() {
      let result = this.friends

      if (this.searchKeyword) {
        result = result.filter(f => 
          f.nickname.includes(this.searchKeyword) || 
          f.wechatId.includes(this.searchKeyword) ||
          f.phone.includes(this.searchKeyword)
        )
      }

      if (this.filterTag) {
        const tagName = this.tags.find(t => t.id === this.filterTag)?.name
        if (tagName) {
          result = result.filter(f => f.tags.includes(tagName))
        }
      }

      if (this.filterStatus) {
        result = result.filter(f => f.status === this.filterStatus)
      }

      return result
    }
  },
  mounted() {
    this.loadFriends()
  },
  methods: {
    loadFriends() {
      this.loading = true
      this.$http.get('/api/wechat/friends', {
        params: {
          page: this.currentPage,
          pageSize: this.pageSize,
          keyword: this.searchKeyword,
          tag: this.filterTag,
          status: this.filterStatus
        }
      }).then(res => {
        if (res.data.success) {
          this.friends = res.data.data.friends
          this.totalFriends = res.data.data.total
        }
      }).catch(err => {
        this.$message.error('加载好友列表失败')
      }).finally(() => {
        this.loading = false
      })
    },
    exportFriends() {
      this.$message.success('正在导出好友列表...')
      // 调用后端API导出好友
    },
    chatWithFriend(friend) {
      this.$router.push({ 
        name: 'AggregateChat', 
        query: { friendId: friend.id } 
      })
    },
    viewFriendDetail(friend) {
      this.selectedFriend = friend
      this.showDetailDialog = true

      // 加载聊天记录
      this.$http.get(`/api/wechat/chat/${friend.id}/messages`)
        .then(res => {
          if (res.data.success) {
            this.chatHistory = res.data.data
          }
        })
        .catch(err => {
          this.$message.error('加载聊天记录失败')
        })
    },
    deleteFriend(friend) {
      this.$confirm(`确定要删除好友 "${friend.nickname}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/api/wechat/friends/${friend.id}`)
          .then(() => {
            this.friends = this.friends.filter(f => f.id !== friend.id)
            this.$message.success('好友已删除')
          })
          .catch(err => {
            this.$message.error('删除好友失败')
          })
      })
    },
    addFriend() {
      if (!this.newFriend.wechatId) {
        this.$message.error('请输入微信号或手机号')
        return
      }

      this.$message.success('好友申请已发送')
      this.showAddDialog = false

      // 调用后端API添加好友
      this.$http.post('/api/wechat/friends', this.newFriend)
        .then(() => {
          this.loadFriends()
          
          // 重置表单
          this.newFriend = {
            wechatId: '',
            verifyMsg: '您好，我是...',
            remark: '',
            tags: []
          }
        })
        .catch(err => {
          this.$message.error('添加好友失败')
        })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.loadFriends()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadFriends()
    }
  }
}
</script>

<style scoped>
.friend-list {
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

.friend-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.friend-detail {
  padding: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
}

.detail-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-right: 20px;
}

.detail-info h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
}

.detail-info p {
  margin: 5px 0;
  color: #666;
}

.detail-tags,
.detail-chat-history {
  margin-top: 15px;
}

.chat-preview {
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.chat-msg-item {
  margin-bottom: 10px;
}

.msg-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.msg-content {
  font-size: 14px;
  line-height: 1.5;
}
</style>
