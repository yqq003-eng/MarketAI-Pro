<template>
  <div class="contract-container">
    <div class="page-header">
      <h2>合同审查</h2>
      <el-button type="primary" @click="showAddDialog">上传合同</el-button>
    </div>

    <div class="filter-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索合同名称"
        style="width: 300px"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="statusFilter" placeholder="审查状态" style="width: 150px" @change="handleSearch">
        <el-option label="全部" value=""></el-option>
        <el-option label="待审查" value="pending"></el-option>
        <el-option label="审查中" value="reviewing"></el-option>
        <el-option label="已通过" value="approved"></el-option>
        <el-option label="需修改" value="needs_revision"></el-option>
      </el-select>
      <el-select v-model="typeFilter" placeholder="合同类型" style="width: 150px" @change="handleSearch">
        <el-option label="全部" value=""></el-option>
        <el-option label="买卖合同" value="purchase"></el-option>
        <el-option label="租赁合同" value="lease"></el-option>
        <el-option label="服务合同" value="service"></el-option>
        <el-option label="劳动合同" value="labor"></el-option>
        <el-option label="保密协议" value="nda"></el-option>
        <el-option label="其他" value="other"></el-option>
      </el-select>
    </div>

    <el-table :data="contractList" style="width: 100%" v-loading="loading">
      <el-table-column prop="contractName" label="合同名称" min-width="200"></el-table-column>
      <el-table-column prop="contractType" label="合同类型" width="120"></el-table-column>
      <el-table-column prop="partyA" label="甲方" width="150"></el-table-column>
      <el-table-column prop="partyB" label="乙方" width="150"></el-table-column>
      <el-table-column prop="status" label="审查状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="riskLevel" label="风险等级" width="120">
        <template #default="scope">
          <el-tag :type="getRiskType(scope.row.riskLevel)">
            {{ getRiskText(scope.row.riskLevel) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="上传时间" width="180"></el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="viewContract(scope.row)">查看</el-button>
          <el-button type="primary" link @click="reviewContract(scope.row)">审查</el-button>
          <el-button type="primary" link @click="downloadContract(scope.row)">下载</el-button>
          <el-button type="danger" link @click="deleteContract(scope.row)">删除</el-button>
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

    <!-- 上传合同对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="上传合同"
      width="600px"
    >
      <el-form :model="contractForm" label-width="100px">
        <el-form-item label="合同名称">
          <el-input v-model="contractForm.contractName" placeholder="请输入合同名称"></el-input>
        </el-form-item>
        <el-form-item label="合同类型">
          <el-select v-model="contractForm.contractType" placeholder="请选择合同类型">
            <el-option label="买卖合同" value="purchase"></el-option>
            <el-option label="租赁合同" value="lease"></el-option>
            <el-option label="服务合同" value="service"></el-option>
            <el-option label="劳动合同" value="labor"></el-option>
            <el-option label="保密协议" value="nda"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="甲方">
          <el-input v-model="contractForm.partyA" placeholder="请输入甲方名称"></el-input>
        </el-form-item>
        <el-form-item label="乙方">
          <el-input v-model="contractForm.partyB" placeholder="请输入乙方名称"></el-input>
        </el-form-item>
        <el-form-item label="合同文件">
          <el-upload
            class="upload-demo"
            action="/api/legal/contracts/upload"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
          >
            <el-button type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持 pdf, doc, docx 格式文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="contractForm.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveContract">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 合同审查对话框 -->
    <el-dialog
      v-model="reviewVisible"
      title="合同审查"
      width="800px"
    >
      <div v-if="currentContract">
        <div class="contract-info">
          <h3>{{ currentContract.contractName }}</h3>
          <p>合同类型：{{ currentContract.contractType }}</p>
          <p>甲方：{{ currentContract.partyA }}</p>
          <p>乙方：{{ currentContract.partyB }}</p>
        </div>
        <div class="review-section">
          <h4>AI审查结果</h4>
          <div class="risk-items">
            <div v-for="risk in reviewResults" :key="risk.id" class="risk-item">
              <el-tag :type="getRiskType(risk.level)">{{ getRiskText(risk.level) }}</el-tag>
              <span class="risk-clause">条款 {{ risk.clause }}：</span>
              <span class="risk-desc">{{ risk.description }}</span>
              <p class="risk-suggestion">建议：{{ risk.suggestion }}</p>
            </div>
          </div>
        </div>
        <div class="review-form">
          <el-form-item label="审查意见">
            <el-input
              v-model="reviewForm.comments"
              type="textarea"
              :rows="4"
              placeholder="请输入审查意见"
            ></el-input>
          </el-form-item>
          <el-form-item label="审查状态">
            <el-select v-model="reviewForm.status">
              <el-option label="通过" value="approved"></el-option>
              <el-option label="需修改" value="needs_revision"></el-option>
            </el-select>
          </el-form-item>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reviewVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReview">提交审查</el-button>
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

const contractList = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const reviewVisible = ref(false)
const contractForm = ref({
  contractName: '',
  contractType: '',
  partyA: '',
  partyB: '',
  fileUrl: '',
  remarks: ''
})
const reviewForm = ref({
  comments: '',
  status: 'approved'
})
const currentContract = ref(null)
const reviewResults = ref([])

const getStatusType = (status) => {
  const map = {
    'pending': 'warning',
    'reviewing': 'primary',
    'approved': 'success',
    'needs_revision': 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    'pending': '待审查',
    'reviewing': '审查中',
    'approved': '已通过',
    'needs_revision': '需修改'
  }
  return map[status] || status
}

const getRiskType = (level) => {
  const map = {
    'low': 'success',
    'medium': 'warning',
    'high': 'danger',
    'critical': 'danger'
  }
  return map[level] || 'info'
}

const getRiskText = (level) => {
  const map = {
    'low': '低风险',
    'medium': '中风险',
    'high': '高风险',
    'critical': '严重风险'
  }
  return map[level] || level
}

const loadContractList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      status: statusFilter.value,
      type: typeFilter.value
    }
    const response = await axios.get('/api/legal/contracts', { params })
    contractList.value = response.data.data || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('加载合同列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadContractList()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadContractList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadContractList()
}

const showAddDialog = () => {
  contractForm.value = {
    contractName: '',
    contractType: '',
    partyA: '',
    partyB: '',
    fileUrl: '',
    remarks: ''
  }
  dialogVisible.value = true
}

const handleUploadSuccess = (response) => {
  contractForm.value.fileUrl = response.url
  ElMessage.success('上传成功')
}

const beforeUpload = (file) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('只支持 PDF、DOC、DOCX 格式文件')
    return false
  }
  return true
}

const saveContract = async () => {
  try {
    await axios.post('/api/legal/contracts', contractForm.value)
    ElMessage.success('上传合同成功')
    dialogVisible.value = false
    loadContractList()
  } catch (error) {
    ElMessage.error('上传合同失败')
  }
}

const viewContract = (row) => {
  // 查看合同详情
  ElMessage.info('查看合同功能开发中')
}

const reviewContract = async (row) => {
  currentContract.value = row
  try {
    const response = await axios.get(`/api/legal/contracts/${row.id}/review`)
    reviewResults.value = response.data.risks || []
    reviewVisible.value = true
  } catch (error) {
    ElMessage.error('获取审查结果失败')
  }
}

const submitReview = async () => {
  try {
    await axios.post(`/api/legal/contracts/${currentContract.value.id}/review`, reviewForm.value)
    ElMessage.success('提交审查成功')
    reviewVisible.value = false
    loadContractList()
  } catch (error) {
    ElMessage.error('提交审查失败')
  }
}

const downloadContract = (row) => {
  window.open(row.fileUrl, '_blank')
}

const deleteContract = (row) => {
  ElMessageBox.confirm('确定要删除该合同吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await axios.delete(`/api/legal/contracts/${row.id}`)
      ElMessage.success('删除成功')
      loadContractList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  loadContractList()
})
</script>

<style scoped>
.contract-container {
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

.contract-info {
  margin-bottom: 20px;
}

.review-section {
  margin: 20px 0;
}

.risk-items {
  margin-top: 15px;
}

.risk-item {
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 10px;
}

.risk-clause {
  font-weight: bold;
  margin-left: 10px;
}

.risk-desc {
  margin-left: 10px;
}

.risk-suggestion {
  margin-top: 10px;
  color: #909399;
  font-size: 14px;
}

.review-form {
  margin-top: 20px;
}
</style>
