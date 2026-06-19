<template>
  <div class="group-management">
    <div class="page-header">
      <h2>群管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog">创建群</el-button>
        <el-button @click="syncGroups">同步群数据</el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="群名称">
          <el-input v-model="filterForm.keyword" placeholder="请输入群名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="活跃" value="active"></el-option>
            <el-option label="沉寂" value="inactive"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadGroups">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 群列表 -->
    <el-table :data="groups" border style="width: 100%">
      <el-table-column prop="name" label="群名称" width="200"></el-table-column>
      <el-table-column prop="owner" label="群主" width="120"></el-table-column>
      <el-table-column prop="member_count" label="成员数" width="100"></el-table-column>
      <el-table-column prop="message_count" label="消息数" width="100"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
            {{ scope.row.status === 'active' ? '活跃' : '沉寂' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="viewGroup(scope.row)">查看</el-button>
          <el-button size="small" @click="editGroup(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteGroup(scope.row.id)">删除</el-button>
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
        @size-change="loadGroups"
        @current-change="loadGroups"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="groupForm" label-width="80px">
        <el-form-item label="群名称">
          <el-input v-model="groupForm.name"></el-input>
        </el-form-item>
        <el-form-item label="群主">
          <el-input v-model="groupForm.owner"></el-input>
        </el-form-item>
        <el-form-item label="成员数">
          <el-input-number v-model="groupForm.member_count" :min="1" :max="500"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="groupForm.status" placeholder="选择状态">
            <el-option label="活跃" value="active"></el-option>
            <el-option label="沉寂" value="inactive"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveGroup">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看群详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="群详情" width="600px">
      <div v-if="selectedGroup" class="group-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="群名称">{{ selectedGroup.name }}</el-descriptions-item>
          <el-descriptions-item label="群主">{{ selectedGroup.owner }}</el-descriptions-item>
          <el-descriptions-item label="成员数">{{ selectedGroup.member_count }}</el-descriptions-item>
          <el-descriptions-item label="消息数">{{ selectedGroup.message_count }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedGroup.status === 'active' ? 'success' : 'info'">
              {{ selectedGroup.status === 'active' ? '活跃' : '沉寂' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ selectedGroup.created_at }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'GroupManagement',
  setup() {
    const groups = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    const dialogVisible = ref(false)
    const viewDialogVisible = ref(false)
    const dialogTitle = ref('创建群')
    const isEdit = ref(false)
    const selectedGroup = ref(null)
    
    const filterForm = ref({
      keyword: '',
      status: ''
    })
    
    const groupForm = ref({
      id: null,
      name: '',
      owner: '',
      member_count: 1,
      status: 'active'
    })
    
    const loadGroups = async () => {
      try {
        const response = await fetch(`/api/wecom/groups?page=${currentPage.value}&limit=${pageSize.value}&keyword=${filterForm.value.keyword}&status=${filterForm.value.status}`)
        const result = await response.json()
        if (result.code === 200) {
          groups.value = result.data.list
          total.value = result.data.total
        }
      } catch (error) {
        ElMessage.error('加载群数据失败')
      }
    }
    
    const showAddDialog = () => {
      dialogTitle.value = '创建群'
      isEdit.value = false
      groupForm.value = {
        id: null,
        name: '',
        owner: '',
        member_count: 1,
        status: 'active'
      }
      dialogVisible.value = true
    }
    
    const editGroup = (row) => {
      dialogTitle.value = '编辑群'
      isEdit.value = true
      groupForm.value = {
        id: row.id,
        name: row.name,
        owner: row.owner,
        member_count: row.member_count,
        status: row.status
      }
      dialogVisible.value = true
    }
    
    const viewGroup = (row) => {
      selectedGroup.value = row
      viewDialogVisible.value = true
    }
    
    const saveGroup = async () => {
      try {
        const url = isEdit.value ? `/api/wecom/groups/${groupForm.value.id}` : '/api/wecom/groups'
        const method = isEdit.value ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(groupForm.value)
        })
        
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
          dialogVisible.value = false
          loadGroups()
        }
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }
    
    const deleteGroup = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个群吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`/api/wecom/groups/${id}`, { method: 'DELETE' })
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success('删除成功')
          loadGroups()
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }
    
    const syncGroups = () => {
      ElMessage.success('同步功能开发中...')
    }
    
    const resetFilter = () => {
      filterForm.value = {
        keyword: '',
        status: ''
      }
      loadGroups()
    }
    
    onMounted(() => {
      loadGroups()
    })
    
    return {
      groups,
      currentPage,
      pageSize,
      total,
      filterForm,
      groupForm,
      selectedGroup,
      dialogVisible,
      viewDialogVisible,
      dialogTitle,
      loadGroups,
      showAddDialog,
      editGroup,
      viewGroup,
      saveGroup,
      deleteGroup,
      syncGroups,
      resetFilter
    }
  }
}
</script>

<style scoped>
.group-management {
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

.group-detail {
  padding: 20px;
}
</style>
