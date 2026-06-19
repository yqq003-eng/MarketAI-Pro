<template>
  <div class="map-customers">
    <div class="page-header">
      <h2>地图获客</h2>
      <div>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索客户"
          prefix-icon="el-icon-search"
          style="width: 200px; margin-right: 10px;">
        </el-input>
        <el-button type="primary" @click="refreshLocation">
          <i class="el-icon-refresh"></i> 刷新位置
        </el-button>
      </div>
    </div>

    <!-- 地图和列表布局 -->
    <el-row :gutter="20">
      <!-- 地图区域 -->
      <el-col :span="16">
        <el-card shadow="hover" class="map-card">
          <div id="mapContainer" style="width: 100%; height: 600px;"></div>
        </el-card>
      </el-col>

      <!-- 客户列表 -->
      <el-col :span="8">
        <el-card shadow="hover" class="customer-list-card">
          <div slot="header">
            <span>附近客户 ({{ customers.length }})</span>
            <el-select 
              v-model="filterDistance" 
              size="small" 
              style="float: right; width: 120px;">
              <el-option label="500米内" :value="500"></el-option>
              <el-option label="1公里内" :value="1000"></el-option>
              <el-option label="3公里内" :value="3000"></el-option>
              <el-option label="5公里内" :value="5000"></el-option>
            </el-select>
          </div>

          <el-scroll-bar style="height: 520px;">
            <div 
              v-for="customer in filteredCustomers" 
              :key="customer.id"
              class="customer-item"
              :class="{ 'active': selectedCustomer && selectedCustomer.id === customer.id }"
              @click="selectCustomer(customer)">
              <img :src="customer.avatar" :alt="customer.nickname" class="customer-avatar">
              <div class="customer-info">
                <div class="customer-name">{{ customer.nickname }}</div>
                <div class="customer-meta">
                  <span class="distance">{{ customer.distance }}米</span>
                  <span class="location">{{ customer.location }}</span>
                </div>
                <div class="customer-tags">
                  <el-tag 
                    v-for="tag in customer.tags" 
                    :key="tag"
                    size="mini"
                    style="margin-right: 5px;">
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
              <el-button 
                size="mini" 
                type="primary" 
                @click.stop="addFriend(customer)">
                加好友
              </el-button>
            </div>
          </el-scroll-bar>
        </el-card>
      </el-col>
    </el-row>

    <!-- 客户详情对话框 -->
    <el-dialog 
      title="客户详情" 
      :visible.sync="showDetailDialog" 
      width="600px">
      <div v-if="selectedCustomer" class="customer-detail">
        <div class="detail-header">
          <img :src="selectedCustomer.avatar" :alt="selectedCustomer.nickname" class="detail-avatar">
          <div class="detail-info">
            <h3>{{ selectedCustomer.nickname }}</h3>
            <p>微信号：{{ selectedCustomer.wechatId }}</p>
            <p>手机：{{ selectedCustomer.phone }}</p>
            <p>距离：{{ selectedCustomer.distance }}米</p>
          </div>
        </div>

        <el-divider></el-divider>

        <div class="detail-tags">
          <span>标签：</span>
          <el-tag 
            v-for="tag in selectedCustomer.tags" 
            :key="tag"
            style="margin-right: 5px;">
            {{ tag }}
          </el-tag>
          <el-button size="mini" @click="showAddTagDialog = true">+ 添加标签</el-button>
        </div>

        <el-divider></el-divider>

        <div class="detail-notes">
          <p><strong>备注：</strong></p>
          <p>{{ selectedCustomer.notes || '暂无备注' }}</p>
        </div>
      </div>

      <div slot="footer">
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button type="primary" @click="startChat(selectedCustomer)">发消息</el-button>
      </div>
    </el-dialog>

    <!-- 添加标签对话框 -->
    <el-dialog 
      title="添加标签" 
      :visible.sync="showAddTagDialog" 
      width="400px">
      <el-form>
        <el-form-item label="选择标签">
          <el-checkbox-group v-model="selectedTags">
            <el-checkbox 
              v-for="tag in availableTags" 
              :label="tag.name" 
              :key="tag.id">
              {{ tag.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="新建标签">
          <el-input 
            v-model="newTagName" 
            placeholder="请输入标签名称"
            style="width: 200px; margin-right: 10px;"></el-input>
          <el-button size="small" type="primary" @click="createTag">创建</el-button>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="showAddTagDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddTag">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MapCustomers',
  data() {
    return {
      searchKeyword: '',
      filterDistance: 5000,
      customers: [
        {
          id: 1,
          nickname: '张三',
          avatar: 'https://via.placeholder.com/60',
          distance: 500,
          location: '北京市朝阳区',
          wechatId: 'zhangsan123',
          phone: '13800138000',
          tags: ['潜在客户', '兴趣度高'],
          notes: '对产品很感兴趣，可以重点跟进',
          lastActive: '2026-06-19 15:30:00'
        },
        {
          id: 2,
          nickname: '李四',
          avatar: 'https://via.placeholder.com/60',
          distance: 800,
          location: '北京市海淀区',
          wechatId: 'lisi456',
          phone: '13900139000',
          tags: ['已联系'],
          notes: '已经通过电话，等待回复',
          lastActive: '2026-06-18 10:20:00'
        },
        {
          id: 3,
          nickname: '王五',
          avatar: 'https://via.placeholder.com/60',
          distance: 1200,
          location: '北京市丰台区',
          wechatId: 'wangwu789',
          phone: '13700137000',
          tags: ['意向度高'],
          notes: '',
          lastActive: '2026-06-20 09:15:00'
        }
      ],
      selectedCustomer: null,
      showDetailDialog: false,
      showAddTagDialog: false,
      selectedTags: [],
      newTagName: '',
      availableTags: [
        { id: 1, name: '潜在客户' },
        { id: 2, name: '已联系' },
        { id: 3, name: '意向度高' },
        { id: 4, name: '已成交' }
      ]
    }
  },
  computed: {
    filteredCustomers() {
      let result = this.customers

      if (this.searchKeyword) {
        result = result.filter(c => 
          c.nickname.includes(this.searchKeyword) || 
          c.wechatId.includes(this.searchKeyword) ||
          c.phone.includes(this.searchKeyword)
        )
      }

      if (this.filterDistance) {
        result = result.filter(c => c.distance <= this.filterDistance)
      }

      return result
    }
  },
  mounted() {
    this.initMap()
  },
  methods: {
    initMap() {
      // 这里应该初始化地图（百度地图、高德地图等）
      console.log('初始化地图')
      this.$message.info('地图加载中...')
    },
    refreshLocation() {
      this.$message.info('正在刷新位置...')
      // 这里应该调用后端API获取附近客户
      this.$http.get('/api/wechat/map-customers')
        .then(res => {
          if (res.data.success) {
            this.customers = res.data.data.customers
            this.$message.success('位置已刷新')
          }
        })
        .catch(err => {
          this.$message.error('刷新位置失败')
        })
    },
    selectCustomer(customer) {
      this.selectedCustomer = customer
      this.showDetailDialog = true
    },
    addFriend(customer) {
      this.$confirm(`确定要添加 ${customer.nickname} 为好友吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.$message.success(`已向 ${customer.nickname} 发送好友申请`)
        // 这里应该调用后端API发送好友申请
      })
    },
    startChat(customer) {
      this.$router.push({ 
        name: 'AggregateChat', 
        query: { customerId: customer.id } 
      })
    },
    createTag() {
      if (!this.newTagName) {
        this.$message.error('请输入标签名称')
        return
      }

      this.$message.success(`标签 ${this.newTagName} 创建成功`)
      this.availableTags.push({
        id: Date.now(),
        name: this.newTagName
      })
      this.newTagName = ''
    },
    confirmAddTag() {
      if (this.selectedTags.length === 0) {
        this.$message.error('请选择至少一个标签')
        return
      }

      this.$message.success('标签添加成功')
      this.showAddTagDialog = false
      this.selectedTags = []
    }
  }
}
</script>

<style scoped>
.map-customers {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.map-card {
  height: 100%;
}

.customer-list-card {
  height: 100%;
}

.customer-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: all 0.3s;
}

.customer-item:hover,
.customer-item.active {
  background-color: #f5f7fa;
}

.customer-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
}

.customer-info {
  flex: 1;
}

.customer-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.customer-meta {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.customer-meta .distance {
  margin-right: 10px;
}

.customer-tags {
  margin-top: 5px;
}

.customer-detail {
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
.detail-notes {
  margin-top: 15px;
}
</style>
