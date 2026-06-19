<template>
  <div class="employee-management">
    <div class="page-header">
      <h2>员工管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog">添加员工</el-button>
        <el-button @click="exportEmployees">导出数据</el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="姓名/职位" clearable></el-input>
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="filterForm.department" placeholder="选择部门" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="销售部" value="销售部"></el-option>
            <el-option label="市场部" value="市场部"></el-option>
            <el-option label="客服部" value="客服部"></el-option>
            <el-option label="技术部" value="技术部"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadEmployees">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 员工列表 -->
    <el-table :data="employees" border style="width: 100%">
      <el-table-column prop="name" label="姓名" width="120"></el-table-column>
      <el-table-column prop="position" label="职位" width="150"></el-table-column>
      <el-table-column prop="department" label="部门" width="150"></el-table-column>
      <el-table-column prop="phone" label="手机号" width="150"></el-table-column>
      <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
            {{ scope.row.status === 'active' ? '在职' : '离职' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="添加时间" width="180"></el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="editEmployee(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteEmployee(scope.row.id)">删除</el-button>
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
        @size-change="loadEmployees"
        @current-change="loadEmployees"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="employeeForm" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="employeeForm.name"></el-input>
        </el-form-item>
        <el-form-item label="职位">
          <el-input v-model="employeeForm.position"></el-input>
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="employeeForm.department" placeholder="选择部门" style="width: 100%;">
            <el-option label="销售部" value="销售部"></el-option>
            <el-option label="市场部" value="市场部"></el-option>
            <el-option label="客服部" value="客服部"></el-option>
            <el-option label="技术部" value="技术部"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="employeeForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="employeeForm.email"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="employeeForm.status" placeholder="选择状态">
            <el-option label="在职" value="active"></el-option>
            <el-option label="离职" value="inactive"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEmployee">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'EmployeeManagement',
  setup() {
    const employees = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    const dialogVisible = ref(false)
    const dialogTitle = ref('添加员工')
    const isEdit = ref(false)
    
    const filterForm = ref({
      keyword: '',
      department: ''
    })
    
    const employeeForm = ref({
      id: null,
      name: '',
      position: '',
      department: '',
      phone: '',
      email: '',
      status: 'active'
    })
    
    const loadEmployees = async () => {
      try {
        const response = await fetch(`/api/wecom/employees?page=${currentPage.value}&limit=${pageSize.value}&department=${filterForm.value.department}&keyword=${filterForm.value.keyword}`)
        const result = await response.json()
        if (result.code === 200) {
          employees.value = result.data.list
          total.value = result.data.total
        }
      } catch (error) {
        ElMessage.error('加载员工数据失败')
      }
    }
    
    const showAddDialog = () => {
      dialogTitle.value = '添加员工'
      isEdit.value = false
      employeeForm.value = {
        id: null,
        name: '',
        position: '',
        department: '',
        phone: '',
        email: '',
        status: 'active'
      }
      dialogVisible.value = true
    }
    
    const editEmployee = (row) => {
      dialogTitle.value = '编辑员工'
      isEdit.value = true
      employeeForm.value = {
        id: row.id,
        name: row.name,
        position: row.position,
        department: row.department,
        phone: row.phone,
        email: row.email,
        status: row.status
      }
      dialogVisible.value = true
    }
    
    const saveEmployee = async () => {
      try {
        const url = isEdit.value ? `/api/wecom/employees/${employeeForm.value.id}` : '/api/wecom/employees'
        const method = isEdit.value ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeForm.value)
        })
        
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
          dialogVisible.value = false
          loadEmployees()
        }
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }
    
    const deleteEmployee = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个员工吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`/api/wecom/employees/${id}`, { method: 'DELETE' })
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success('删除成功')
          loadEmployees()
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
        department: ''
      }
      loadEmployees()
    }
    
    const exportEmployees = () => {
      ElMessage.success('导出功能开发中...')
    }
    
    onMounted(() => {
      loadEmployees()
    })
    
    return {
      employees,
      currentPage,
      pageSize,
      total,
      filterForm,
      employeeForm,
      dialogVisible,
      dialogTitle,
      loadEmployees,
      showAddDialog,
      editEmployee,
      saveEmployee,
      deleteEmployee,
      resetFilter,
      exportEmployees
    }
  }
}
</script>

<style scoped>
.employee-management {
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
