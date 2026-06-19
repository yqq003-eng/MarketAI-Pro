<template>
  <div class="customer-management">
    <div class="page-header">
      <h2>客户管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog">添加客户</el-button>
        <el-button @click="exportCustomers">导出数据</el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="姓名/公司" clearable></el-input>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="filterForm.tag" placeholder="选择标签" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="潜在客户" value="潜在客户"></el-option>
            <el-option label="成交客户" value="成交客户"></el-option>
            <el-option label="VIP客户" value="VIP客户"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadCustomers">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 客户列表 -->
    <el-table :data="customers" border style="width: 100%">
      <el-table-column prop="name" label="姓名" width="120"></el-table-column>
      <el-table-column prop="phone" label="手机号" width="150"></el-table-column>
      <el-table-column prop="company" label="公司" width="200"></el-table-column>
      <el-table-column prop="tags" label="标签" width="200">
        <template #default="scope">
          <el-tag v-for="tag in scope.row.tags.split(',')" :key="tag" size="small" style="margin-right: 5px;">
            {{ tag }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="owner" label="负责人" width="120"></el-table-column>
      <el-table-column prop="created_at" label="添加时间" width="180"></el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="editCustomer(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteCustomer(scope.row.id)">删除</el-button>
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
        @size-change="loadCustomers"
        @current-change="loadCustomers"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="customerForm" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="customerForm.name"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="customerForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="公司">
          <el-input v-model="customerForm.company"></el-input>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="customerForm.tags" multiple placeholder="选择标签" style="width: 100%;">
            <el-option label="潜在客户" value="潜在客户"></el-option>
            <el-option label="成交客户" value="成交客户"></el-option>
            <el-option label="VIP客户" value="VIP客户"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="customerForm.owner"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCustomer">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'CustomerManagement',
  setup() {
    const customers = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    const dialogVisible = ref(false)
    const dialogTitle = ref('添加客户')
    const isEdit = ref(false)
    
    const filterForm = ref({
      keyword: '',
      tag: ''
    })
    
    const customerForm = ref({
      id: null,
      name: '',
      phone: '',
      company: '',
      tags: [],
      owner: ''
    })
    
    const loadCustomers = async () => {
      try {
        const response = await fetch(`/api/wecom/customers?page=${currentPage.value}&limit=${pageSize.value}&keyword=${filterForm.value.keyword}&tag=${filterForm.value.tag}`)
        const result = await response.json()
        if (result.code === 200) {
          customers.value = result.data.list
          total.value = result.data.total
        }
      } catch (error) {
        ElMessage.error('加载客户数据失败')
      }
    }
    
    const showAddDialog = () => {
      dialogTitle.value = '添加客户'
      isEdit.value = false
      customerForm.value = {
        id: null,
        name: '',
        phone: '',
        company: '',
        tags: [],
        owner: ''
      }
      dialogVisible.value = true
    }
    
    const editCustomer = (row) => {
      dialogTitle.value = '编辑客户'
      isEdit.value = true
      customerForm.value = {
        id: row.id,
        name: row.name,
        phone: row.phone,
        company: row.company,
        tags: row.tags ? row.tags.split(',') : [],
        owner: row.owner
      }
      dialogVisible.value = true
    }
    
    const saveCustomer = async () => {
      try {
        const url = isEdit.value ? `/api/wecom/customers/${customerForm.value.id}` : '/api/wecom/customers'
        const method = isEdit.value ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...customerForm.value,
            tags: customerForm.value.tags.join(',')
          })
        })
        
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
          dialogVisible.value = false
          loadCustomers()
        }
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }
    
    const deleteCustomer = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个客户吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`/api/wecom/customers/${id}`, { method: 'DELETE' })
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success('删除成功')
          loadCustomers()
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
        tag: ''
      }
      loadCustomers()
    }
    
    const exportCustomers = () => {
      ElMessage.success('导出功能开发中...')
    }
    
    onMounted(() => {
      loadCustomers()
    })
    
    return {
      customers,
      currentPage,
      pageSize,
      total,
      filterForm,
      customerForm,
      dialogVisible,
      dialogTitle,
      loadCustomers,
      showAddDialog,
      editCustomer,
      saveCustomer,
      deleteCustomer,
      resetFilter,
      exportCustomers
    }
  }
}
</script>

<style scoped>
.customer-management {
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
