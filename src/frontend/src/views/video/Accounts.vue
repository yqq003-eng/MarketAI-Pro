<template>
  <div class="video-accounts">
    <div class="page-header">
      <h2>账号管理</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <i class="el-icon-plus"></i> 添加账号
      </el-button>
    </div>

    <!-- 平台筛选 -->
    <div class="filter-section">
      <el-radio-group v-model="selectedPlatform" @change="filterAccounts">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="douyin">抖音</el-radio-button>
        <el-radio-button label="kuaishou">快手</el-radio-button>
        <el-radio-button label="shipinhao">视频号</el-radio-button>
        <el-radio-button label="xiaohongshu">小红书</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 账号列表 -->
    <el-row :gutter="20" class="account-list">
      <el-col :span="8" v-for="account in filteredAccounts" :key="account.id" class="account-item">
        <el-card shadow="hover" class="account-card">
          <div class="account-header">
            <img :src="account.avatar" :alt="account.nickname" class="account-avatar">
            <div class="account-info">
              <h3>{{ account.nickname }}</h3>
              <el-tag size="small" :type="getPlatformType(account.platform)">
                {{ getPlatformName(account.platform) }}
              </el-tag>
            </div>
            <el-switch
              v-model="account.status"
              active-color="#13ce66"
              @change="toggleAccountStatus(account)">
            </el-switch>
          </div>
          
          <div class="account-stats">
            <div class="stat-item">
              <span class="stat-value">{{ account.fans_count || 0 }}</span>
              <span class="stat-label">粉丝</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ account.video_count || 0 }}</span>
              <span class="stat-label">作品</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ account.total_play || 0 }}</span>
              <span class="stat-label">总播放</span>
            </div>
          </div>

          <div class="account-actions">
            <el-button size="small" @click="viewAccountDetail(account)">详情</el-button>
            <el-button size="small" type="primary" @click="syncAccountData(account)">同步数据</el-button>
            <el-button size="small" type="danger" @click="removeAccount(account)">移除</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加账号对话框 -->
    <el-dialog title="添加账号" :visible.sync="showAddDialog" width="500px">
      <el-form :model="newAccount" label-width="100px">
        <el-form-item label="平台">
          <el-select v-model="newAccount.platform" placeholder="请选择平台">
            <el-option label="抖音" value="douyin"></el-option>
            <el-option label="快手" value="kuaishou"></el-option>
            <el-option label="视频号" value="shipinhao"></el-option>
            <el-option label="小红书" value="xiaohongshu"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="授权方式">
          <el-radio-group v-model="newAccount.authType">
            <el-radio label="qrcode">扫码授权</el-radio>
            <el-radio label="cookie">Cookie授权</el-radio>
          </el-radio-group>
        </el-form-item>

        <div v-if="newAccount.authType === 'qrcode'" class="qrcode-section">
          <div class="qrcode-placeholder">
            <i class="el-icon-full-screen"></i>
            <p>请使用App扫码授权</p>
          </div>
        </div>

        <div v-if="newAccount.authType === 'cookie'">
          <el-form-item label="Cookie">
            <el-input
              type="textarea"
              v-model="newAccount.cookie"
              placeholder="请输入Cookie信息"
              :rows="4">
            </el-input>
          </el-form-item>
        </div>
      </el-form>

      <div slot="footer">
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addAccount">确认添加</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'VideoAccounts',
  data() {
    return {
      selectedPlatform: 'all',
      showAddDialog: false,
      accounts: [
        {
          id: 1,
          nickname: '测试账号-抖音',
          platform: 'douyin',
          avatar: 'https://via.placeholder.com/60',
          status: true,
          fans_count: 12580,
          video_count: 45,
          total_play: 1256000
        },
        {
          id: 2,
          nickname: '测试账号-快手',
          platform: 'kuaishou',
          avatar: 'https://via.placeholder.com/60',
          status: true,
          fans_count: 8960,
          video_count: 32,
          total_play: 890000
        }
      ],
      newAccount: {
        platform: '',
        authType: 'qrcode',
        cookie: ''
      }
    }
  },
  computed: {
    filteredAccounts() {
      if (this.selectedPlatform === 'all') {
        return this.accounts
      }
      return this.accounts.filter(acc => acc.platform === this.selectedPlatform)
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
    getPlatformType(platform) {
      const types = {
        douyin: '',
        kuaishou: 'warning',
        shipinhao: 'success',
        xiaohongshu: 'danger'
      }
      return types[platform] || ''
    },
    filterAccounts() {
      // 触发重新计算
    },
    toggleAccountStatus(account) {
      this.$message.success(`账号 ${account.nickname} 已${account.status ? '启用' : '禁用'}`)
    },
    viewAccountDetail(account) {
      this.$router.push({ name: 'VideoDetail', params: { id: account.id } })
    },
    syncAccountData(account) {
      this.$message.info(`正在同步 ${account.nickname} 的数据...`)
      // 调用后端API
      this.$http.post(`/api/shortvideo/accounts/${account.id}/sync`)
        .then(() => {
          this.$message.success('数据同步成功')
        })
        .catch(err => {
          this.$message.error('数据同步失败')
        })
    },
    removeAccount(account) {
      this.$confirm('确定要移除该账号吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/api/shortvideo/accounts/${account.id}`)
          .then(() => {
            this.accounts = this.accounts.filter(acc => acc.id !== account.id)
            this.$message.success('账号已移除')
          })
          .catch(err => {
            this.$message.error('移除账号失败')
          })
      })
    },
    addAccount() {
      if (!this.newAccount.platform) {
        this.$message.error('请选择平台')
        return
      }
      
      this.$http.post('/api/shortvideo/accounts', this.newAccount)
        .then(() => {
          this.$message.success('账号添加成功')
          this.showAddDialog = false
          this.loadAccounts()
          
          // 重置表单
          this.newAccount = {
            platform: '',
            authType: 'qrcode',
            cookie: ''
          }
        })
        .catch(err => {
          this.$message.error('账号添加失败')
        })
    },
    loadAccounts() {
      this.$http.get('/api/shortvideo/accounts', {
        params: { platform: this.selectedPlatform }
      }).then(res => {
        if (res.data.success) {
          this.accounts = res.data.data
        }
      })
    }
  },
  mounted() {
    this.loadAccounts()
  }
}
</script>

<style scoped>
.video-accounts {
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
}

.account-list {
  margin-top: 20px;
}

.account-item {
  margin-bottom: 20px;
}

.account-card {
  transition: all 0.3s;
}

.account-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.account-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.account-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 15px;
}

.account-info {
  flex: 1;
}

.account-info h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.account-stats {
  display: flex;
  justify-content: space-around;
  padding: 15px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.account-actions {
  display: flex;
  justify-content: space-between;
}

.qrcode-section {
  text-align: center;
  padding: 20px;
}

.qrcode-placeholder {
  width: 200px;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

.qrcode-placeholder i {
  font-size: 48px;
  color: #999;
  margin-bottom: 10px;
}
</style>
