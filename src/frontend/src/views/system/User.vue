<template>
  <div class="user-container">
    <div class="page-header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="showAddDialog">新增用户</el-button>
    </div>

    <div class="filter-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索用户名、姓名、邮箱"
        style="width: 300px"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="roleFilter" placeholder="角色" style="width: 150px" @change="handleSearch">
        <el-option label="全部" value=""></el-option>
        <el-option label="管理员" value="admin"></el-option>
        <el-option label="普通用户" value="user"></el-option>
        <el-option label="访客" value="guest"></el-option>
      </el-select>
      <el-select v-model="statusFilter" placeholder="状态" style="width: 150px" @change="handleSearch">
        <el-option label="全部" value=""></el-option>
        <el-option label="激活" value="active"></el-option>
        <el-option label="未激活" value="inactive"></el-option>
        <el-option label="锁定" value="locked"></el-option>
      </el-select>
    </div>

    <el-table :data="userList" style="width: 100%" v-loading="loading">
      <el-table-column prop="username" label="用户名" width="150"></el-table-column>
      <el-table-column prop="name" label="姓名" width="120"></el-table-column>
      <el-table-column prop="email" label="邮箱" min-width="200"></el-table-column>
      <el-table-column prop="department" label="部门" width="150"></el-table-column>
      <el-table-column prop="position" label="职位" width="150"></el-table-column>
      <el-table-column prop="role" label="角色" width="120"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginAt" label="最后登录" width="180"></el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="editUser(scope.row)">编辑</el-button>
          <el-button type="primary" link @click="resetPassword(scope.row)">重置密码</el-button>
          <el-button type="danger" link @click="deleteUser(scope.row)">删除</el-button>
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
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="600px"
    >
      <el-form :model="userForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="dialogType === 'edit'"></el-input>
        </el-form-item>
        <el-form-item label="密码" v-if="dialogType === 'add'">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="userForm.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="userForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="userForm.department" placeholder="请输入部门"></el-input>
        </el-form-item>
        <el-form-item label="职位">
          <el-input v-model="userForm.position" placeholder="请输入职位"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="普通用户" value="user"></el-option>
            <el-option label="访客" value="guest"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="userForm.status">
            <el-option label="激活" value="active"></el-option>
            <el-option label="未激活" value="inactive"></el-option>
            <el-option label="锁定" value="locked"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveUser">确定</el-button>
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

const userList = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const dialogType = ref('add')
const userForm = ref({
  username: '',
  password: '',
  name: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  role: 'user',
  status: 'active'
})

const getStatusType = (status) => {
  const map = {
    'active': 'success',
    'inactive': 'warning',
    'locked': 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    'active': '激活',
    'inactive': '未激活',
    'locked': '锁定'
  }
  return map[status] || status
}

const loadUserList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      role: roleFilter.value,
      status: statusFilter.value
    }
    const response = await axios.get('/api/system/users', { params })
    userList.value = response.data.data || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadUserList()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadUserList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadUserList()
}

const showAddDialog = () => {
  dialogType.value = 'add'
  userForm.value = {
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    role: 'user',
    status: 'active'
  }
  dialogVisible.value = true
}

const editUser = (row) => {
  dialogType.value = 'edit'
  userForm.value = { ...row, password: '' }
  dialogVisible.value = true
}

const saveUser = async () => {
  try {
    if (dialogType.value === 'add') {
      await axios.post('/api/system/users', userForm.value)
      ElMessage.success('新增用户成功')
    } else {
      const updateData = { ...userForm.value }
      if (!updateData.password) {
        delete updateData.password
      }
      await axios.put(`/api/system/users/${userForm.value.id}`, updateData)
      ElMessage.success('更新用户成功')
    }
    dialogVisible.value = false
    loadUserList()
  } catch (error) {
    ElMessage.error('保存用户失败')
  }
}

const resetPassword = (row) => {
  ElMessageBox.prompt('请输入新密码', '重置密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'password'
  }).then(async ({ value }) => {
    try {
      await axios.put(`/api/system/users/${row.id}`, { password: value })
      ElMessage.success('密码重置成功')
    } catch (error) {
      ElMessage.error('密码重置失败')
    }
  })
}

const deleteUser = (row) => {
  ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await axios.delete(`/api/system/users/${row.id}`)
      ElMessage.success('删除成功')
      loadUserList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.user-container {
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
