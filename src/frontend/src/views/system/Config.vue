<template>
  <div class="config-container">
    <div class="page-header">
      <h2>系统配置</h2>
      <el-button type="primary" @click="showAddDialog">新增配置</el-button>
    </div>

    <div class="filter-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索配置键"
        style="width: 300px"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="groupFilter" placeholder="配置分组" style="width: 150px" @change="handleSearch">
        <el-option label="全部" value=""></el-option>
        <el-option label="基本配置" value="basic"></el-option>
        <el-option label="安全配置" value="security"></el-option>
        <el-option label="邮件配置" value="email"></el-option>
        <el-option label="存储配置" value="storage"></el-option>
      </el-select>
      <el-checkbox v-model="showPublicOnly" @change="handleSearch">仅显示公开配置</el-checkbox>
    </div>

    <el-table :data="configList" style="width: 100%" v-loading="loading">
      <el-table-column prop="key" label="配置键" min-width="200"></el-table-column>
      <el-table-column prop="value" label="配置值" min-width="250">
        <template #default="scope">
          <el-tag v-if="scope.row.type === 'boolean'" :type="scope.row.value === 'true' ? 'success' : 'info'">
            {{ scope.row.value === 'true' ? '是' : '否' }}
          </el-tag>
          <span v-else>{{ scope.row.value }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="group" label="分组" width="120"></el-table-column>
      <el-table-column prop="type" label="类型" width="100"></el-table-column>
      <el-table-column prop="isPublic" label="是否公开" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.isPublic ? 'success' : 'info'">
            {{ scope.row.isPublic ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="editConfig(scope.row)">编辑</el-button>
          <el-button type="danger" link @click="deleteConfig(scope.row)">删除</el-button>
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
      :title="dialogType === 'add' ? '新增配置' : '编辑配置'"
      width="500px"
    >
      <el-form :model="configForm" label-width="100px">
        <el-form-item label="配置键">
          <el-input v-model="configForm.key" placeholder="请输入配置键" :disabled="dialogType === 'edit'"></el-input>
        </el-form-item>
        <el-form-item label="配置值">
          <el-input
            v-if="configForm.type === 'string' || configForm.type === 'json' || configForm.type === 'array'"
            v-model="configForm.value"
            type="textarea"
            :rows="3"
            placeholder="请输入配置值"
          ></el-input>
          <el-input-number
            v-else-if="configForm.type === 'number'"
            v-model="configForm.value"
            :min="0"
          ></el-input-number>
          <el-switch
            v-else-if="configForm.type === 'boolean'"
            v-model="configForm.value"
          ></el-switch>
        </el-form-item>
        <el-form-item label="配置分组">
          <el-select v-model="configForm.group" placeholder="请选择配置分组">
            <el-option label="基本配置" value="basic"></el-option>
            <el-option label="安全配置" value="security"></el-option>
            <el-option label="邮件配置" value="email"></el-option>
            <el-option label="存储配置" value="storage"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="配置类型">
          <el-select v-model="configForm.type" placeholder="请选择配置类型">
            <el-option label="字符串" value="string"></el-option>
            <el-option label="数字" value="number"></el-option>
            <el-option label="布尔值" value="boolean"></el-option>
            <el-option label="JSON" value="json"></el-option>
            <el-option label="数组" value="array"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="configForm.description"
            type="textarea"
            :rows="2"
            placeholder="请输入配置描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="是否公开">
          <el-switch v-model="configForm.isPublic"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveConfig">确定</el-button>
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

const configList = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const groupFilter = ref('')
const showPublicOnly = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const dialogType = ref('add')
const configForm = ref({
  key: '',
  value: '',
  group: 'basic',
  type: 'string',
  description: '',
  isPublic: false
})

const loadConfigList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      group: groupFilter.value,
      isPublic: showPublicOnly.value || undefined
    }
    const response = await axios.get('/api/system/configs', { params })
    configList.value = response.data.data || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('加载配置列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadConfigList()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadConfigList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadConfigList()
}

const showAddDialog = () => {
  dialogType.value = 'add'
  configForm.value = {
    key: '',
    value: '',
    group: 'basic',
    type: 'string',
    description: '',
    isPublic: false
  }
  dialogVisible.value = true
}

const editConfig = (row) => {
  dialogType.value = 'edit'
  configForm.value = { ...row }
  dialogVisible.value = true
}

const saveConfig = async () => {
  try {
    await axios.post('/api/system/configs', configForm.value)
    ElMessage.success(dialogType.value === 'add' ? '新增配置成功' : '更新配置成功')
    dialogVisible.value = false
    loadConfigList()
  } catch (error) {
    ElMessage.error('保存配置失败')
  }
}

const deleteConfig = (row) => {
  ElMessageBox.confirm('确定要删除该配置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await axios.delete(`/api/system/configs/${row.key}`)
      ElMessage.success('删除成功')
      loadConfigList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  loadConfigList()
})
</script>

<style scoped>
.config-container {
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
  align-items: center;
}

.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
