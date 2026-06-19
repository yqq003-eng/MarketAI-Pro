<template>
  <div class="search-container">
    <div class="page-header">
      <h2>法律检索</h2>
      <el-button type="primary" @click="showAddDialog">新增检索</el-button>
    </div>

    <div class="search-section">
      <el-input
        v-model="searchKeyword"
        placeholder="输入关键词检索法律法规、案例"
        style="width: 500px"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
      <el-select v-model="categoryFilter" placeholder="法规类别" style="width: 150px; margin-left: 15px" @change="handleSearch">
        <el-option label="全部" value=""></el-option>
        <el-option label="法律法规" value="law"></el-option>
        <el-option label="司法解释" value="interpretation"></el-option>
        <el-option label="部门规章" value="regulation"></el-option>
        <el-option label="判例" value="case"></el-option>
      </el-select>
    </div>

    <div class="quick-search">
      <span class="label">热门检索：</span>
      <el-tag
        v-for="tag in hotTags"
        :key="tag"
        class="hot-tag"
        @click="quickSearch(tag)"
      >
        {{ tag }}
      </el-tag>
    </div>

    <el-table :data="searchList" style="width: 100%" v-loading="loading">
      <el-table-column prop="title" label="标题" min-width="300"></el-table-column>
      <el-table-column prop="category" label="类别" width="120"></el-table-column>
      <el-table-column prop="source" label="来源" width="150"></el-table-column>
      <el-table-column prop="effectiveDate" label="生效日期" width="150"></el-table-column>
      <el-table-column prop="createdAt" label="检索时间" width="180"></el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="viewDetail(scope.row)">查看</el-button>
          <el-button type="primary" link @click="collectDoc(scope.row)">收藏</el-button>
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

    <!-- 检索详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="检索详情"
      width="800px"
    >
      <div v-if="currentDoc">
        <h3>{{ currentDoc.title }}</h3>
        <div class="doc-meta">
          <span>来源：{{ currentDoc.source }}</span>
          <span>类别：{{ currentDoc.category }}</span>
          <span>生效日期：{{ currentDoc.effectiveDate }}</span>
        </div>
        <div class="doc-content" v-html="currentDoc.content"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const searchList = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const categoryFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const detailVisible = ref(false)
const currentDoc = ref(null)

const hotTags = ref(['劳动合同', '知识产权', '税务合规', '公司治理', '数据保护', '竞业禁止'])

const loadSearchList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      category: categoryFilter.value
    }
    const response = await axios.get('/api/legal/searches', { params })
    searchList.value = response.data.data || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('加载检索列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadSearchList()
}

const quickSearch = (tag) => {
  searchKeyword.value = tag
  handleSearch()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadSearchList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadSearchList()
}

const viewDetail = (row) => {
  currentDoc.value = row
  detailVisible.value = true
}

const collectDoc = async (row) => {
  try {
    await axios.post('/api/legal/searches/collect', { id: row.id })
    ElMessage.success('收藏成功')
  } catch (error) {
    ElMessage.error('收藏失败')
  }
}

const showAddDialog = () => {
  // 新增检索记录
  ElMessage.info('新增检索功能开发中')
}

onMounted(() => {
  loadSearchList()
})
</script>

<style scoped>
.search-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.quick-search {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.quick-search .label {
  margin-right: 10px;
  color: #606266;
}

.hot-tag {
  margin-right: 10px;
  cursor: pointer;
}

.hot-tag:hover {
  color: #409eff;
}

.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.doc-meta {
  display: flex;
  gap: 20px;
  margin: 15px 0;
  color: #909399;
  font-size: 14px;
}

.doc-content {
  margin-top: 20px;
  line-height: 1.8;
}
</style>
