<template>
  <div class="qa-container">
    <div class="page-header">
      <h2>知识问答</h2>
      <el-button type="primary" @click="showAddDialog">提问</el-button>
    </div>

    <div class="filter-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索问题"
        style="width: 300px"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="statusFilter" placeholder="状态" style="width: 150px" @change="handleSearch">
        <el-option label="全部" value=""></el-option>
        <el-option label="待回答" value="pending"></el-option>
        <el-option label="已回答" value="answered"></el-option>
        <el-option label="已关闭" value="closed"></el-option>
      </el-select>
      <el-select v-model="categoryFilter" placeholder="问题类别" style="width: 150px" @change="handleSearch">
        <el-option label="全部" value=""></el-option>
        <el-option label="技术" value="technical"></el-option>
        <el-option label="业务" value="business"></el-option>
        <el-option label="流程" value="process"></el-option>
        <el-option label="其他" value="other"></el-option>
      </el-select>
    </div>

    <el-table :data="qaList" style="width: 100%" v-loading="loading">
      <el-table-column prop="question" label="问题" min-width="300"></el-table-column>
      <el-table-column prop="category" label="类别" width="120"></el-table-column>
      <el-table-column prop="askedBy" label="提问人" width="120"></el-table-column>
      <el-table-column prop="answeredBy" label="回答人" width="120"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="viewCount" label="查看次数" width="100"></el-table-column>
      <el-table-column prop="helpfulCount" label="有帮助" width="100"></el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="viewQA(scope.row)">查看</el-button>
          <el-button type="primary" link @click="answerQA(scope.row)" v-if="scope.row.status === 'pending'">回答</el-button>
          <el-button type="danger" link @click="deleteQA(scope.row)">删除</el-button>
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

    <!-- 提问对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="提问"
      width="600px"
    >
      <el-form :model="qaForm" label-width="100px">
        <el-form-item label="问题">
          <el-input
            v-model="qaForm.question"
            type="textarea"
            :rows="4"
            placeholder="请输入您的问题"
          ></el-input>
        </el-form-item>
        <el-form-item label="问题类别">
          <el-select v-model="qaForm.category" placeholder="请选择问题类别">
            <el-option label="技术" value="technical"></el-option>
            <el-option label="业务" value="business"></el-option>
            <el-option label="流程" value="process"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-tag
            v-for="tag in qaForm.tags"
            :key="tag"
            closable
            @close="removeTag(tag)"
            style="margin-right: 10px"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="tagInputVisible"
            ref="tagInputRef"
            v-model="tagInputValue"
            size="small"
            style="width: 100px"
            @keyup.enter="addTag"
            @blur="addTag"
          />
          <el-button v-else size="small" @click="showTagInput">+ 添加标签</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveQA">提交问题</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 回答对话框 -->
    <el-dialog
      v-model="answerVisible"
      title="回答问题"
      width="700px"
    >
      <div v-if="currentQA" class="qa-detail">
        <div class="question-section">
          <h4>问题：</h4>
          <p>{{ currentQA.question }}</p>
          <p class="meta">提问人：{{ currentQA.askedBy }} | 时间：{{ currentQA.createdAt }}</p>
        </div>
        <el-form :model="answerForm" label-width="100px">
          <el-form-item label="回答">
            <el-input
              v-model="answerForm.answer"
              type="textarea"
              :rows="6"
              placeholder="请输入您的回答"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="answerVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAnswer">提交回答</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看问答详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="问答详情"
      width="700px"
    >
      <div v-if="currentQA" class="qa-detail">
        <div class="question-section">
          <h4>问题：</h4>
          <p>{{ currentQA.question }}</p>
          <p class="meta">提问人：{{ currentQA.askedBy }} | 时间：{{ currentQA.createdAt }}</p>
        </div>
        <div class="answer-section" v-if="currentQA.answer">
          <h4>回答：</h4>
          <p>{{ currentQA.answer }}</p>
          <p class="meta">回答人：{{ currentQA.answeredBy }} | 时间：{{ currentQA.updatedAt }}</p>
        </div>
        <div class="action-section">
          <el-button type="primary" @click="markHelpful(currentQA)" :disabled="currentQA.status !== 'answered'">
            标记为有帮助 ({{ currentQA.helpfulCount }})
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const qaList = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const answerVisible = ref(false)
const detailVisible = ref(false)

const qaForm = ref({
  question: '',
  category: '',
  tags: []
})

const answerForm = ref({
  answer: '',
  answeredBy: ''
})

const currentQA = ref(null)

const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref(null)

const getStatusType = (status) => {
  const map = {
    'pending': 'warning',
    'answered': 'success',
    'closed': 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    'pending': '待回答',
    'answered': '已回答',
    'closed': '已关闭'
  }
  return map[status] || status
}

const loadQAList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      status: statusFilter.value,
      category: categoryFilter.value
    }
    const response = await axios.get('/api/knowledge/qa', { params })
    qaList.value = response.data.data || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('加载问答列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadQAList()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadQAList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadQAList()
}

const showAddDialog = () => {
  qaForm.value = {
    question: '',
    category: '',
    tags: []
  }
  dialogVisible.value = true
}

const saveQA = async () => {
  try {
    await axios.post('/api/knowledge/qa', qaForm.value)
    ElMessage.success('提问成功')
    dialogVisible.value = false
    loadQAList()
  } catch (error) {
    ElMessage.error('提问失败')
  }
}

const viewQA = async (row) => {
  try {
    const response = await axios.get(`/api/knowledge/qa/${row.id}`)
    currentQA.value = response.data.data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error('获取问答详情失败')
  }
}

const answerQA = async (row) => {
  try {
    const response = await axios.get(`/api/knowledge/qa/${row.id}`)
    currentQA.value = response.data.data
    answerForm.value = {
      answer: '',
      answeredBy: ''
    }
    answerVisible.value = true
  } catch (error) {
    ElMessage.error('获取问答详情失败')
  }
}

const submitAnswer = async () => {
  try {
    await axios.post(`/api/knowledge/qa/${currentQA.value.id}/answer`, answerForm.value)
    ElMessage.success('回答成功')
    answerVisible.value = false
    loadQAList()
  } catch (error) {
    ElMessage.error('回答失败')
  }
}

const markHelpful = async (row) => {
  try {
    await axios.post(`/api/knowledge/qa/${row.id}/helpful`)
    ElMessage.success('标记成功')
    loadQAList()
  } catch (error) {
    ElMessage.error('标记失败')
  }
}

const deleteQA = (row) => {
  ElMessageBox.confirm('确定要删除该问答吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await axios.delete(`/api/knowledge/qa/${row.id}`)
      ElMessage.success('删除成功')
      loadQAList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const removeTag = (tag) => {
  qaForm.value.tags = qaForm.value.tags.filter(t => t !== tag)
}

const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.input?.focus()
  })
}

const addTag = () => {
  if (tagInputValue.value) {
    qaForm.value.tags.push(tagInputValue.value)
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

onMounted(() => {
  loadQAList()
})
</script>

<style scoped>
.qa-container {
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

.qa-detail {
  margin-bottom: 20px;
}

.question-section, .answer-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.meta {
  color: #909399;
  font-size: 14px;
  margin-top: 10px;
}

.action-section {
  margin-top: 20px;
}
</style>
