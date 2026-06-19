<template>
  <div class="resume-management">
    <div class="page-header">
      <h2>简历管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog">上传简历</el-button>
        <el-button @click="refreshList">刷新</el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="姓名/职位" clearable></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="待处理" value="pending"></el-option>
            <el-option label="面试中" value="interviewing"></el-option>
            <el-option label="已录用" value="hired"></el-option>
            <el-option label="已拒绝" value="rejected"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadCandidates">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 简历列表 -->
    <el-table :data="candidates" border style="width: 100%">
      <el-table-column prop="name" label="姓名" width="120"></el-table-column>
      <el-table-column prop="phone" label="手机号" width="150"></el-table-column>
      <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
      <el-table-column prop="job_title" label="应聘职位" width="200"></el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="申请时间" width="180"></el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="viewResume(scope.row)">查看简历</el-button>
          <el-button size="small" @click="editCandidate(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteCandidate(scope.row.id)">删除</el-button>
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
        @size-change="loadCandidates"
        @current-change="loadCandidates"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="candidateForm" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="candidateForm.name"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="candidateForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="candidateForm.email"></el-input>
        </el-form-item>
        <el-form-item label="简历URL">
          <el-input v-model="candidateForm.resume_url"></el-input>
        </el-form-item>
        <el-form-item label="应聘职位">
          <el-input-number v-model="candidateForm.job_id" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="candidateForm.status" placeholder="选择状态">
            <el-option label="待处理" value="pending"></el-option>
            <el-option label="面试中" value="interviewing"></el-option>
            <el-option label="已录用" value="hired"></el-option>
            <el-option label="已拒绝" value="rejected"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCandidate">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看简历对话框 -->
    <el-dialog v-model="resumeDialogVisible" title="查看简历" width="600px">
      <div v-if="selectedCandidate" class="resume-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ selectedCandidate.name }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ selectedCandidate.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ selectedCandidate.email }}</el-descriptions-item>
          <el-descriptions-item label="应聘职位">{{ selectedCandidate.job_title }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedCandidate.status)">
              {{ getStatusText(selectedCandidate.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ selectedCandidate.created_at }}</el-descriptions-item>
          <el-descriptions-item label="简历" :span="2">
            <a :href="selectedCandidate.resume_url" target="_blank" v-if="selectedCandidate.resume_url">下载简历</a>
            <span v-else>暂无简历</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'ResumeManagement',
  setup() {
    const candidates = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    const dialogVisible = ref(false)
    const resumeDialogVisible = ref(false)
    const dialogTitle = ref('上传简历')
    const isEdit = ref(false)
    const selectedCandidate = ref(null)
    
    const filterForm = ref({
      keyword: '',
      status: ''
    })
    
    const candidateForm = ref({
      id: null,
      name: '',
      phone: '',
      email: '',
      resume_url: '',
      job_id: null,
      status: 'pending'
    })
    
    const loadCandidates = async () => {
      try {
        const response = await fetch(`/api/boss/candidates?page=${currentPage.value}&limit=${pageSize.value}&keyword=${filterForm.value.keyword}&status=${filterForm.value.status}`)
        const result = await response.json()
        if (result.code === 200) {
          candidates.value = result.data.list
          total.value = result.data.total
        }
      } catch (error) {
        ElMessage.error('加载候选人数据失败')
      }
    }
    
    const showAddDialog = () => {
      dialogTitle.value = '上传简历'
      isEdit.value = false
      candidateForm.value = {
        id: null,
        name: '',
        phone: '',
        email: '',
        resume_url: '',
        job_id: null,
        status: 'pending'
      }
      dialogVisible.value = true
    }
    
    const editCandidate = (row) => {
      dialogTitle.value = '编辑候选人'
      isEdit.value = true
      candidateForm.value = {
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        resume_url: row.resume_url,
        job_id: row.job_id,
        status: row.status
      }
      dialogVisible.value = true
    }
    
    const viewResume = (row) => {
      selectedCandidate.value = row
      resumeDialogVisible.value = true
    }
    
    const saveCandidate = async () => {
      try {
        const url = isEdit.value ? `/api/boss/candidates/${candidateForm.value.id}` : '/api/boss/candidates'
        const method = isEdit.value ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(candidateForm.value)
        })
        
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
          dialogVisible.value = false
          loadCandidates()
        }
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }
    
    const deleteCandidate = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个候选人吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`/api/boss/candidates/${id}`, { method: 'DELETE' })
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success('删除成功')
          loadCandidates()
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }
    
    const refreshList = () => {
      loadCandidates()
    }
    
    const resetFilter = () => {
      filterForm.value = {
        keyword: '',
        status: ''
      }
      loadCandidates()
    }
    
    const getStatusType = (status) => {
      const types = {
        'pending': 'info',
        'interviewing': 'warning',
        'hired': 'success',
        'rejected': 'danger'
      }
      return types[status] || 'info'
    }
    
    const getStatusText = (status) => {
      const texts = {
        'pending': '待处理',
        'interviewing': '面试中',
        'hired': '已录用',
        'rejected': '已拒绝'
      }
      return texts[status] || '未知'
    }
    
    onMounted(() => {
      loadCandidates()
    })
    
    return {
      candidates,
      currentPage,
      pageSize,
      total,
      filterForm,
      candidateForm,
      selectedCandidate,
      dialogVisible,
      resumeDialogVisible,
      dialogTitle,
      loadCandidates,
      showAddDialog,
      editCandidate,
      viewResume,
      saveCandidate,
      deleteCandidate,
      refreshList,
      resetFilter,
      getStatusType,
      getStatusText
    }
  }
}
</script>

<style scoped>
.resume-management {
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

.pagination {
  margin-top: 20px;
  text-align: right;
}

.resume-detail {
  padding: 20px;
}
</style>