<template>
  <div class="mass-message">
    <div class="page-header">
      <h2>消息群发</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog">创建群发任务</el-button>
        <el-button @click="refreshList">刷新</el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="草稿" value="draft"></el-option>
            <el-option label="待发送" value="pending"></el-option>
            <el-option label="已发送" value="sent"></el-option>
            <el-option label="已取消" value="cancelled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadMassMessages">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 群发任务列表 -->
    <el-table :data="massMessages" border style="width: 100%">
      <el-table-column prop="title" label="任务名称" width="200"></el-table-column>
      <el-table-column prop="content" label="消息内容" width="300">
        <template #default="scope">
          <div class="content-preview">{{ scope.row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="target_type" label="目标类型" width="120">
        <template #default="scope">
          <el-tag>
            {{ scope.row.target_type === 'all' ? '全部客户' : '按标签' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="target_tags" label="目标标签" width="150"></el-table-column>
      <el-table-column prop="send_time" label="发送时间" width="180"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="viewTask(scope.row)">查看</el-button>
          <el-button size="small" @click="editTask(scope.row)" :disabled="scope.row.status !== 'draft'">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteTask(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="loadMassMessages"
        @current-change="loadMassMessages"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="taskForm" label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="taskForm.title" placeholder="请输入任务名称"></el-input>
        </el-form-item>
        <el-form-item label="消息内容">
          <el-input v-model="taskForm.content" type="textarea" :rows="4" placeholder="请输入消息内容"></el-input>
        </el-form-item>
        <el-form-item label="目标类型">
          <el-radio-group v-model="taskForm.target_type">
            <el-radio label="all">全部客户</el-radio>
            <el-radio label="tags">按标签</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="目标标签" v-if="taskForm.target_type === 'tags'">
          <el-select v-model="taskForm.target_tags" multiple placeholder="选择标签" style="width: 100%;">
            <el-option label="潜在客户" value="潜在客户"></el-option>
            <el-option label="成交客户" value="成交客户"></el-option>
            <el-option label="VIP客户" value="VIP客户"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发送时间">
          <el-date-picker
            v-model="taskForm.send_time"
            type="datetime"
            placeholder="选择发送时间"
            style="width: 100%;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="taskForm.status" placeholder="选择状态">
            <el-option label="草稿" value="draft"></el-option>
            <el-option label="待发送" value="pending"></el-option>
            <el-option label="已发送" value="sent"></el-option>
            <el-option label="已取消" value="cancelled"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTask">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看任务详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="任务详情" width="600px">
      <div v-if="selectedTask" class="task-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务名称">{{ selectedTask.title }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedTask.status)">
              {{ getStatusText(selectedTask.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="消息内容" :span="2">{{ selectedTask.content }}</el-descriptions-item>
          <el-descriptions-item label="目标类型">
            {{ selectedTask.target_type === 'all' ? '全部客户' : '按标签' }}
          </el-descriptions-item>
          <el-descriptions-item label="目标标签">{{ selectedTask.target_tags }}</el-descriptions-item>
          <el-descriptions-item label="发送时间">{{ selectedTask.send_time }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ selectedTask.created_at }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'MassMessage',
  setup() {
    const massMessages = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    const dialogVisible = ref(false)
    const viewDialogVisible = ref(false)
    const dialogTitle = ref('创建群发任务')
    const isEdit = ref(false)
    const selectedTask = ref(null)
    
    const filterForm = ref({
      status: ''
    })
    
    const taskForm = ref({
      id: null,
      title: '',
      content: '',
      target_type: 'all',
      target_tags: [],
      send_time: '',
      status: 'draft'
    })
    
    const loadMassMessages = async () => {
      try {
        const response = await fetch(`/api/wecom/mass-messages?page=${currentPage.value}&limit=${pageSize.value}&status=${filterForm.value.status}`)
        const result = await response.json()
        if (result.code === 200) {
          massMessages.value = result.data.list
          total.value = result.data.total
        }
      } catch (error) {
        ElMessage.error('加载群发任务失败')
      }
    }
    
    const showAddDialog = () => {
      dialogTitle.value = '创建群发任务'
      isEdit.value = false
      taskForm.value = {
        id: null,
        title: '',
        content: '',
        target_type: 'all',
        target_tags: [],
        send_time: '',
        status: 'draft'
      }
      dialogVisible.value = true
    }
    
    const editTask = (row) => {
      dialogTitle.value = '编辑群发任务'
      isEdit.value = true
      taskForm.value = {
        id: row.id,
        title: row.title,
        content: row.content,
        target_type: row.target_type,
        target_tags: row.target_tags ? row.target_tags.split(',') : [],
        send_time: row.send_time,
        status: row.status
      }
      dialogVisible.value = true
    }
    
    const viewTask = (row) => {
      selectedTask.value = row
      viewDialogVisible.value = true
    }
    
    const saveTask = async () => {
      try {
        const url = isEdit.value ? `/api/wecom/mass-messages/${taskForm.value.id}` : '/api/wecom/mass-messages'
        const method = isEdit.value ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...taskForm.value,
            target_tags: Array.isArray(taskForm.value.target_tags) ? taskForm.value.target_tags.join(',') : taskForm.value.target_tags
          })
        })
        
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
          dialogVisible.value = false
          loadMassMessages()
        }
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }
    
    const deleteTask = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个群发任务吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`/api/wecom/mass-messages/${id}`, { method: 'DELETE' })
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success('删除成功')
          loadMassMessages()
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }
    
    const refreshList = () => {
      loadMassMessages()
    }
    
    const resetFilter = () => {
      filterForm.value = {
        status: ''
      }
      loadMassMessages()
    }
    
    const getStatusType = (status) => {
      const types = {
        'draft': 'info',
        'pending': 'warning',
        'sent': 'success',
        'cancelled': 'danger'
      }
      return types[status] || 'info'
    }
    
    const getStatusText = (status) => {
      const texts = {
        'draft': '草稿',
        'pending': '待发送',
        'sent': '已发送',
        'cancelled': '已取消'
      }
      return texts[status] || '未知'
    }
    
    onMounted(() => {
      loadMassMessages()
    })
    
    return {
      massMessages,
      currentPage,
      pageSize,
      total,
      filterForm,
      taskForm,
      selectedTask,
      dialogVisible,
      viewDialogVisible,
      dialogTitle,
      loadMassMessages,
      showAddDialog,
      editTask,
      viewTask,
      saveTask,
      deleteTask,
      refreshList,
      resetFilter,
      getStatusType,
      getStatusText
    }
  }
}
</script>

<style scoped>
.mass-message {
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
  padding: 20px;
  background: #f5f5f5;
  border-radius: 4px;
}

.content-preview {
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.task-detail {
  padding: 20px;
}
</style>
