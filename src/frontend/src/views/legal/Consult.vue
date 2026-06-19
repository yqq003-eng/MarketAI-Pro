<template>
  <div class="consult-container">
    <div class="page-header">
      <h2>法律咨询</h2>
      <el-button type="primary" @click="showAddDialog">新增咨询</el-button>
    </div>

    <div class="filter-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索咨询标题"
        style="width: 300px"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 150px" @change="handleSearch">
        <el-option label="全部" value=""></el-option>
        <el-option label="待处理" value="pending"></el-option>
        <el-option label="处理中" value="processing"></el-option>
        <el-option label="已回复" value="replied"></el-option>
        <el-option label="已关闭" value="closed"></el-option>
      </el-select>
    </div>

    <el-table :data="consultList" style="width: 100%" v-loading="loading">
      <el-table-column prop="title" label="咨询标题" min-width="200"></el-table-column>
      <el-table-column prop="category" label="咨询类别" width="120"></el-table-column>
      <el-table-column prop="consultant" label="咨询人" width="120"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级" width="100">
        <template #default="scope">
          <el-tag :type="getPriorityType(scope.row.priority)">
            {{ getPriorityText(scope.row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="viewConsult(scope.row)">查看</el-button>
          <el-button type="primary" link @click="editConsult(scope.row)">编辑</el-button>
          <el-button type="danger" link @click="deleteConsult(scope.row)">删除</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增咨询' : '编辑咨询'"
      width="600px"
    >
      <el-form :model="consultForm" label-width="100px">
        <el-form-item label="咨询标题">
          <el-input v-model="consultForm.title" placeholder="请输入咨询标题"></el-input>
        </el-form-item>
        <el-form-item label="咨询类别">
          <el-select v-model="consultForm.category" placeholder="请选择咨询类别">
            <el-option label="劳动法" value="labor"></el-option>
            <el-option label="合同法" value="contract"></el-option>
            <el-option label="知识产权" value="intellectual"></el-option>
            <el-option label="公司法" value="corporate"></el-option>
            <el-option label="税法" value="tax"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="咨询人">
          <el-input v-model="consultForm.consultant" placeholder="请输入咨询人"></el-input>
        </el-form-item>
        <el-form-item label="咨询内容">
          <el-input
            v-model="consultForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入咨询内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="consultForm.priority" placeholder="请选择优先级">
            <el-option label="低" value="low"></el-option>
            <el-option label="中" value="medium"></el-option>
            <el-option label="高" value="high"></el-option>
            <el-option label="紧急" value="urgent"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveConsult">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const consultList = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const dialogType = ref('add')
const consultForm = ref({
  title: '',
  category: '',
  consultant: '',
  content: '',
  priority: 'medium'
})

const getStatusType = (status) => {
  const map = {
    'pending': 'warning',
    'processing': 'primary',
    'replied': 'success',
    'closed': 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    'pending': '待处理',
    'processing': '处理中',
    'replied': '已回复',
    'closed': '已关闭'
  }
  return map[status] || status
}

const getPriorityType = (priority) => {
  const map = {
    'low': 'info',
    'medium': 'warning',
    'high': 'danger',
    'urgent': 'danger'
  }
  return map[priority] || 'info'
}

const getPriorityText = (priority) => {
  const map = {
    'low': '低',
    'medium': '中',
    'high': '高',
    'urgent': '紧急'
  }
  return map[priority] || priority
}

const loadConsultList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      status: statusFilter.value
    }
    const response = await axios.get('/api/legal/consults', { params })
    consultList.value = response.data.data || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('加载咨询列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadConsultList()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadConsultList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadConsultList()
}

const showAddDialog = () => {
  dialogType.value = 'add'
  consultForm.value = {
    title: '',
    category: '',
    consultant: '',
    content: '',
    priority: 'medium'
  }
  dialogVisible.value = true
}

const editConsult = (row) => {
  dialogType.value = 'edit'
  consultForm.value = { ...row }
  dialogVisible.value = true
}

const viewConsult = (row) => {
  // 查看详情逻辑
  ElMessage.info('查看咨询详情功能开发中')
}

const saveConsult = async () => {
  try {
    if (dialogType.value === 'add') {
      await axios.post('/api/legal/consults', consultForm.value)
      ElMessage.success('新增咨询成功')
    } else {
      await axios.put(`/api/legal/consults/${consultForm.value.id}`, consultForm.value)
      ElMessage.success('更新咨询成功')
    }
    dialogVisible.value = false
    loadConsultList()
  } catch (error) {
    ElMessage.error('保存咨询失败')
  }
}

const deleteConsult = (row) => {
  ElMessageBox.confirm('确定要删除该咨询吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await axios.delete(`/api/legal/consults/${row.id}`)
      ElMessage.success('删除成功')
      loadConsultList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  loadConsultList()
})
</script>

<style scoped>
.consult-container {
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
}

.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
