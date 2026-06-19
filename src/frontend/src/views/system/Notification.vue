<template>
  <div class="notification-container">
    <div class="page-header">
      <h2>系统通知</h2>
      <el-button type="primary" @click="showAddDialog">发送通知</el-button>
    </div>

    <div class="filter-section">
      <el-select v-model="typeFilter" placeholder="通知类型" style="width: 150px" @change="handleSearch">
        <el-option label="全部" value=""></el-option>
        <el-option label="信息" value="info"></el-option>
        <el-option label="警告" value="warning"></el-option>
        <el-option label="错误" value="error"></el-option>
        <el-option label="成功" value="success"></el-option>
      </el-select>
      <el-checkbox v-model="showUnreadOnly" @change="handleSearch">仅显示未读</el-checkbox>
      <el-checkbox v-model="showGlobalOnly" @change="handleSearch">仅显示全局通知</el-checkbox>
    </div>

    <el-table :data="notificationList" style="width: 100%" v-loading="loading">
      <el-table-column prop="title" label="通知标题" min-width="250"></el-table-column>
      <el-table-column prop="type" label="类型" width="100">
        <template #default="scope">
          <el-tag :type="getTypeType(scope.row.type)">
            {{ getTypeText(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="isRead" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.isRead ? 'info' : 'danger'">
            {{ scope.row.isRead ? '已读' : '未读' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="isGlobal" label="范围" width="100">
        <template #default="scope">
          {{ scope.row.isGlobal ? '全局' : '个人' }}
        </template>
      </el-table-column>
      <el-table-column prop="targetUser" label="目标用户" width="120">
        <template #default="scope">
          {{ scope.row.targetUser || '所有用户' }}
        </template>
      </el-table-column>
      <el-table-column prop="expireAt" label="过期时间" width="180"></el-table-column>
      <el-table-column prop="createdAt" label="发送时间" width="180"></el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="viewNotification(scope.row)">查看</el-button>
          <el-button type="primary" link @click="markRead(scope.row)" v-if="!scope.row.isRead">标为已读</el-button>
          <el-button type="danger" link @click="deleteNotification(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-section">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 发送通知对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="发送通知"
      width="600px"
    >
      <el-form :model="notificationForm" label-width="100px">
        <el-form-item label="通知标题">
          <el-input v-model="notificationForm.title" placeholder="请输入通知标题"></el-input>
        </el-form-item>
        <el-form-item label="通知内容">
          <el-input
            v-model="notificationForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入通知内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="通知类型">
          <el-select v-model="notificationForm.type" placeholder="请选择通知类型">
            <el-option label="信息" value="info"></el-option>
            <el-option label="警告" value="warning"></el-option>
            <el-option label="错误" value="error"></el-option>
            <el-option label="成功" value="success"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="通知范围">
          <el-switch
            v-model="notificationForm.isGlobal"
            active-text="全局通知"
            inactive-text="指定用户"
          ></el-switch>
        </el-form-item>
        <el-form-item label="目标用户" v-if="!notificationForm.isGlobal">
          <el-input v-model="notificationForm.targetUser" placeholder="请输入目标用户ID"></el-input>
        </el-form-item>
        <el-form-item label="过期时间">
          <el-date-picker
            v-model="notificationForm.expireAt"
            type="datetime"
            placeholder="选择过期时间"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="sendNotification">发送</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看通知详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="通知详情"
      width="600px"
    >
      <div v-if="currentNotification" class="notification-detail">
        <h3>{{ currentNotification.title }}</h3>
        <div class="notification-meta">
          <el-tag :type="getTypeType(currentNotification.type)">
            {{ getTypeText(currentNotification.type) }}
          </el-tag>
          <span>发送时间：{{ currentNotification.createdAt }}</span>
          <span v-if="currentNotification.expireAt">过期时间：{{ currentNotification.expireAt }}</span>
        </div>
        <div class="notification-content">
          {{ currentNotification.content }}
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button type="primary" @click="markRead(currentNotification)" v-if="!currentNotification.isRead">标为已读</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const notificationList = ref([])
const loading = ref(false)
const typeFilter = ref('')
const showUnreadOnly = ref(false)
const showGlobalOnly = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const detailVisible = ref(false)
const notificationForm = ref({
  title: '',
  content: '',
  type: 'info',
  isGlobal: false,
  targetUser: null,
  expireAt: null
})
const currentNotification = ref(null)

const getTypeType = (type) => {
  const map = {
    'info': 'info',
    'warning': 'warning',
    'error': 'danger',
    'success': 'success'
  }
  return map[type] || 'info'
}

const getTypeText = (type) => {
  const map = {
    'info': '信息',
    'warning': '警告',
    'error': '错误',
    'success': '成功'
  }
  return map[type] || type
}

const loadNotificationList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      type: typeFilter.value,
      isRead: showUnreadOnly.value ? 'false' : undefined,
      isGlobal: showGlobalOnly.value ? 'true' : undefined
    }
    const response = await axios.get('/api/system/notifications', { params })
    notificationList.value = response.data.data || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('加载通知列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadNotificationList()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadNotificationList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadNotificationList()
}

const showAddDialog = () => {
  notificationForm.value = {
    title: '',
    content: '',
    type: 'info',
    isGlobal: false,
    targetUser: null,
    expireAt: null
  }
  dialogVisible.value = true
}

const sendNotification = async () => {
  try {
    await axios.post('/api/system/notifications', notificationForm.value)
    ElMessage.success('发送通知成功')
    dialogVisible.value = false
    loadNotificationList()
  } catch (error) {
    ElMessage.error('发送通知失败')
  }
}

const viewNotification = async (row) => {
  try {
    const response = await axios.get(`/api/system/notifications/${row.id}`)
    currentNotification.value = response.data.data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error('获取通知详情失败')
  }
}

const markRead = async (row) => {
  try {
    await axios.post(`/api/system/notifications/${row.id}/read`)
    ElMessage.success('标记已读成功')
    if (detailVisible.value) {
      detailVisible.value = false
    }
    loadNotificationList()
  } catch (error) {
    ElMessage.error('标记已读失败')
  }
}

const deleteNotification = (row) => {
  ElMessageBox.confirm('确定要删除该通知吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await axios.delete(`/api/system/notifications/${row.id}`)
      ElMessage.success('删除成功')
      loadNotificationList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  loadNotificationList()
})
</script>

<style scoped>
.notification-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}

.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.notification-detail {
  padding: 20px;
}

.notification-detail h3 {
  margin-bottom: 15px;
}

.notification-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}

.notification-content {
  line-height: 1.8;
  color: #606266;
}
</style>
