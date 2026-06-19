<template>
  <div class="candidate-recommendation">
    <div class="page-header">
      <h2>牛人推荐</h2>
      <div class="header-actions">
        <el-button type="primary" @click="refreshCandidates">刷新推荐</el-button>
        <el-button @click="exportCandidates">导出数据</el-button>
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

    <!-- 候选人列表 -->
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
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'CandidateRecommendation',
  setup() {
    const candidates = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    
    const filterForm = ref({
      keyword: '',
      status: ''
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
    
    const refreshCandidates = () => {
      loadCandidates()
    }
    
    const exportCandidates = () => {
      ElMessage.success('导出功能开发中...')
    }
    
    const viewResume = (row) => {
      ElMessage.info('查看简历功能开发中...')
    }
    
    const editCandidate = (row) => {
      ElMessage.info('编辑功能开发中...')
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
      loadCandidates,
      refreshCandidates,
      exportCandidates,
      viewResume,
      editCandidate,
      deleteCandidate,
      resetFilter,
      getStatusType,
      getStatusText
    }
  }
}
</script>

<style scoped>
.candidate-recommendation {
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
</style>
