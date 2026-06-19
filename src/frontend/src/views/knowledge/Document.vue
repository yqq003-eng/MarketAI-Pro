<template>
  <div class="document-container">
    <div class="page-header">
      <h2>知识文档</h2>
      <el-button type="primary" @click="showAddDialog">新增文档</el-button>
    </div>

    <div class="filter-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索文档标题"
        style="width: 300px"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="categoryFilter" placeholder="文档分类" style="width: 150px" @change="handleSearch">
        <el-option label="全部" value=""></el-option>
        <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.name"></el-option>
      </el-select>
      <el-select v-model="statusFilter" placeholder="文档状态" style="width: 150px" @change="handleSearch">
        <el-option label="全部" value=""></el-option>
        <el-option label="草稿" value="draft"></el-option>
        <el-option label="已发布" value="published"></el-option>
        <el-option label="已归档" value="archived"></el-option>
      </el-select>
    </div>

    <el-table :data="documentList" style="width: 100%" v-loading="loading">
      <el-table-column prop="title" label="文档标题" min-width="250"></el-table-column>
      <el-table-column prop="category" label="分类" width="120"></el-table-column>
      <el-table-column prop="author" label="作者" width="120"></el-table-column>
      <el-table-column prop="department" label="部门" width="150"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="viewCount" label="查看次数" width="100"></el-table-column>
      <el-table-column prop="downloadCount" label="下载次数" width="100"></el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="viewDocument(scope.row)">查看</el-button>
          <el-button type="primary" link @click="editDocument(scope.row)">编辑</el-button>
          <el-button type="primary" link @click="downloadDocument(scope.row)">下载</el-button>
          <el-button type="danger" link @click="deleteDocument(scope.row)">删除</el-button>
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
      :title="dialogType === 'add' ? '新增文档' : '编辑文档'"
      width="700px"
    >
      <el-form :model="documentForm" label-width="100px">
        <el-form-item label="文档标题">
          <el-input v-model="documentForm.title" placeholder="请输入文档标题"></el-input>
        </el-form-item>
        <el-form-item label="文档分类">
          <el-select v-model="documentForm.category" placeholder="请选择分类">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文档内容">
          <el-input
            v-model="documentForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入文档内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="documentForm.author" placeholder="请输入作者"></el-input>
        </el-form-item>
        <el-form-item label="所属部门">
          <el-input v-model="documentForm.department" placeholder="请输入所属部门"></el-input>
        </el-form-item>
        <el-form-item label="标签">
          <el-tag
            v-for="tag in documentForm.tags"
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
        <el-form-item label="附件上传">
          <el-upload
            class="upload-demo"
            action="/api/knowledge/documents/upload"
            :on-success="handleUploadSuccess"
          >
            <el-button type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持 pdf, doc, docx, xls, xlsx, ppt, pptx 格式文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="文档状态">
          <el-select v-model="documentForm.status">
            <el-option label="草稿" value="draft"></el-option>
            <el-option label="发布" value="published"></el-option>
            <el-option label="归档" value="archived"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否公开">
          <el-switch v-model="documentForm.isPublic"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveDocument">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const documentList = ref([])
const categories = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const dialogType = ref('add')
const documentForm = ref({
  title: '',
  category: '',
  content: '',
  author: '',
  department: '',
  tags: [],
  fileUrl: '',
  status: 'draft',
  isPublic: false
})

const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref(null)

const getStatusType = (status) => {
  const map = {
    'draft': 'info',
    'published': 'success',
    'archived': 'warning'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    'draft': '草稿',
    'published': '已发布',
    'archived': '已归档'
  }
  return map[status] || status
}

const loadDocumentList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      category: categoryFilter.value,
      status: statusFilter.value
    }
    const response = await axios.get('/api/knowledge/documents', { params })
    documentList.value = response.data.data || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('加载文档列表失败')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await axios.get('/api/knowledge/categories')
    categories.value = response.data.data || []
  } catch (error) {
    ElMessage.error('加载分类失败')
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadDocumentList()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadDocumentList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadDocumentList()
}

const showAddDialog = () => {
  dialogType.value = 'add'
  documentForm.value = {
    title: '',
    category: '',
    content: '',
    author: '',
    department: '',
    tags: [],
    fileUrl: '',
    status: 'draft',
    isPublic: false
  }
  dialogVisible.value = true
}

const editDocument = (row) => {
  dialogType.value = 'edit'
  documentForm.value = { ...row }
  dialogVisible.value = true
}

const viewDocument = (row) => {
  // 查看文档详情
  window.open(`/api/knowledge/documents/${row.id}`, '_blank')
}

const downloadDocument = async (row) => {
  try {
    const response = await axios.post(`/api/knowledge/documents/${row.id}/download`)
    window.open(response.data.data.fileUrl, '_blank')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

const saveDocument = async () => {
  try {
    if (dialogType.value === 'add') {
      await axios.post('/api/knowledge/documents', documentForm.value)
      ElMessage.success('新增文档成功')
    } else {
      await axios.put(`/api/knowledge/documents/${documentForm.value.id}`, documentForm.value)
      ElMessage.success('更新文档成功')
    }
    dialogVisible.value = false
    loadDocumentList()
  } catch (error) {
    ElMessage.error('保存文档失败')
  }
}

const deleteDocument = (row) => {
  ElMessageBox.confirm('确定要删除该文档吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await axios.delete(`/api/knowledge/documents/${row.id}`)
      ElMessage.success('删除成功')
      loadDocumentList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const removeTag = (tag) => {
  documentForm.value.tags = documentForm.value.tags.filter(t => t !== tag)
}

const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.input?.focus()
  })
}

const addTag = () => {
  if (tagInputValue.value) {
    documentForm.value.tags.push(tagInputValue.value)
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

const handleUploadSuccess = (response) => {
  documentForm.value.fileUrl = response.url
  ElMessage.success('上传成功')
}

onMounted(() => {
  loadDocumentList()
  loadCategories()
})
</script>

<style scoped>
.document-container {
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
