<template>
  <div class="search-container">
    <div class="page-header">
      <h2>知识搜索</h2>
    </div>

    <div class="search-section">
      <el-input
        v-model="searchKeyword"
        placeholder="输入关键词搜索知识库"
        style="width: 600px"
        size="large"
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
    </div>

    <div class="quick-search">
      <span class="label">热门搜索：</span>
      <el-tag
        v-for="tag in hotTags"
        :key="tag"
        class="hot-tag"
        @click="quickSearch(tag)"
      >
        {{ tag }}
      </el-tag>
    </div>

    <div class="search-results" v-if="hasSearched">
      <div class="result-summary">
        找到 {{ totalResults }} 条结果（{{ searchTime }} 毫秒）
      </div>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="文档" name="documents">
          <div v-if="documentResults.length === 0" class="no-results">
            没有找到相关文档
          </div>
          <div v-else>
            <div
              v-for="doc in documentResults"
              :key="doc.id"
              class="result-item"
              @click="viewDocument(doc)"
            >
              <h3>{{ doc.title }}</h3>
              <p class="result-meta">
                <span>分类：{{ doc.category }}</span>
                <span>作者：{{ doc.author }}</span>
                <span>查看次数：{{ doc.viewCount }}</span>
                <span>更新时间：{{ doc.updatedAt }}</span>
              </p>
              <p class="result-content">{{ doc.content }}</p>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="问答" name="qa">
          <div v-if="qaResults.length === 0" class="no-results">
            没有找到相关问答
          </div>
          <div v-else>
            <div
              v-for="qa in qaResults"
              :key="qa.id"
              class="result-item"
              @click="viewQA(qa)"
            >
              <h3>Q: {{ qa.question }}</h3>
              <p class="result-meta">
                <span>类别：{{ qa.category }}</span>
                <span>提问人：{{ qa.askedBy }}</span>
                <span>状态：{{ getStatusText(qa.status) }}</span>
                <span>查看次数：{{ qa.viewCount }}</span>
              </p>
              <p class="result-content" v-if="qa.answer">A: {{ qa.answer }}</p>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div class="pagination-section" v-if="totalResults > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalResults"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <div class="search-history" v-if="!hasSearched && searchHistory.length > 0">
      <h3>最近搜索</h3>
      <div class="history-list">
        <div
          v-for="item in searchHistory"
          :key="item.id"
          class="history-item"
          @click="quickSearch(item.keyword)"
        >
          <el-icon><Clock /></el-icon>
          <span>{{ item.keyword }}</span>
          <span class="search-time">{{ item.createdAt }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, Clock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const searchKeyword = ref('')
const hasSearched = ref(false)
const activeTab = ref('documents')
const searchTime = ref(0)
const totalResults = ref(0)

const documentResults = ref([])
const qaResults = ref([])

const currentPage = ref(1)
const pageSize = ref(10)

const hotTags = ref(['销售技巧', '产品介绍', '合同模板', '常见问题', '技术培训'])

const searchHistory = ref([])

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  hasSearched.value = true
  const startTime = Date.now()

  try {
    const params = {
      keyword: searchKeyword.value,
      page: currentPage.value,
      pageSize: pageSize.value
    }

    const response = await axios.get('/api/knowledge/search', { params })

    documentResults.value = response.data.data.documents || []
    qaResults.value = response.data.data.qa || []
    totalResults.value = (response.data.data.totalDocuments || 0) + (response.data.data.totalQA || 0)
    searchTime.value = Date.now() - startTime
  } catch (error) {
    ElMessage.error('搜索失败')
  }
}

const quickSearch = (keyword) => {
  searchKeyword.value = keyword
  handleSearch()
}

const handleTabChange = (tab) => {
  activeTab.value = tab
}

const handleSizeChange = (val) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  handleSearch()
}

const viewDocument = (doc) => {
  window.open(`/api/knowledge/documents/${doc.id}`, '_blank')
}

const viewQA = async (qa) => {
  try {
    const response = await axios.get(`/api/knowledge/qa/${qa.id}`)
    // 显示问答详情
    ElMessage.info('查看问答详情功能开发中')
  } catch (error) {
    ElMessage.error('获取问答详情失败')
  }
}

const getStatusText = (status) => {
  const map = {
    'pending': '待回答',
    'answered': '已回答',
    'closed': '已关闭'
  }
  return map[status] || status
}

const loadSearchHistory = async () => {
  try {
    const response = await axios.get('/api/knowledge/search/history')
    searchHistory.value = response.data.data || []
  } catch (error) {
    console.error('加载搜索历史失败')
  }
}

onMounted(() => {
  loadSearchHistory()
})
</script>

<style scoped>
.search-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.search-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.quick-search {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
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

.search-results {
  margin-top: 30px;
}

.result-summary {
  color: #909399;
  margin-bottom: 20px;
}

.result-item {
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
  cursor: pointer;
}

.result-item:hover {
  background-color: #f5f7fa;
}

.result-item h3 {
  color: #303133;
  margin-bottom: 10px;
}

.result-meta {
  color: #909399;
  font-size: 14px;
  margin-bottom: 10px;
}

.result-meta span {
  margin-right: 15px;
}

.result-content {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.no-results {
  text-align: center;
  color: #909399;
  padding: 50px 0;
}

.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.search-history {
  margin-top: 50px;
}

.search-history h3 {
  margin-bottom: 20px;
}

.history-list {
  /* 样式 */
}

.history-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
}

.history-item:hover {
  background-color: #f5f7fa;
}

.history-item span {
  margin-left: 10px;
}

.history-item .search-time {
  margin-left: auto;
  color: #909399;
  font-size: 14px;
}
</style>
