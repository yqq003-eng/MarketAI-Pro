<template>
  <div class="log-container">
    <div class="page-header">
      <h2>操作日志</h2>
      <div>
        <el-button type="danger" @click="clearLogs">清除日志</el-button>
      </div>
    </div>

    <div class="filter-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索操作动作"
        style="width: 300px"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="moduleFilter" placeholder="操作模块" style="width: 150px" @change="handleSearch">
        <el-option label="全部" value=""></el-option>
        <el-option label="用户管理" value="user"></el-option>
        <el-option label="角色管理" value="role"></el-option>
        <el-option label="系统配置" value="config"></el-option>
        <el-option label="知识库" value="knowledge"></el-option>
      </el-select>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="handleSearch"
      ></el-date-picker>
    </div>

    <el-table :data="logList" style="width: 100%" v-loading="loading">
      <el-table-column prop="userId" label="操作用户" width="120"></el-table-column>
      <el-table-column prop="module" label="操作模块" width="120"></el-table-column>
      <el-table-column prop="action" label="操作动作" width="150"></el-table-column>
      <el-table-column prop="resource" label="操作资源" min-width="150"></el-table-column>
      <el-table-column prop="resourceId" label="资源ID" width="100"></el-table-column>
      <el-table-column prop="details" label="操作详情" min-width="250">
        <template #default="scope">
          <el-popover
            placement="top-start"
            title="操作详情"
            :width="300"
            trigger="hover"
          >
            <template #reference>
              <span class="details-preview">{{ JSON.stringify(scope.row.details) }}</span>
            </template>
            <pre>{{ JSON.stringify(scope.row.details, null, 2) }}</pre>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="ip" label="IP地址" width="150"></el-table-column>
      <el-table-column prop="createdAt" label="操作时间" width="180"></el-table-column>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const logList = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const moduleFilter = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const loadLogList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      module: moduleFilter.value
    }

    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }

    const response = await axios.get('/api/system/logs', { params })
    logList.value = response.data.data || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('加载日志列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadLogList()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadLogList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadLogList()
}

const clearLogs = () => {
  ElMessageBox.prompt('请输入要清除多少天前的日志（输入0清除所有日志）', '清除日志', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^\d+$/,
    inputErrorMessage: '请输入数字'
  }).then(async ({ value }) => {
    try {
      await axios.delete('/api/system/logs', { params: { days: value } })
      ElMessage.success('清除成功')
      loadLogList()
    } catch (error) {
      ElMessage.error('清除失败')
    }
  })
}

onMounted(() => {
  loadLogList()
})
</script>

<style scoped>
.log-container {
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

.details-preview {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}
</style>
