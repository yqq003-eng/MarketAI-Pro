<template>
  <div class="category-container">
    <div class="page-header">
      <h2>知识分类</h2>
      <el-button type="primary" @click="showAddDialog">新增分类</el-button>
    </div>

    <el-table :data="categoryList" style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="分类名称" min-width="200"></el-table-column>
      <el-table-column prop="description" label="分类描述" min-width="250"></el-table-column>
      <el-table-column prop="parentId" label="父分类" width="150">
        <template #default="scope">
          {{ getParentName(scope.row.parentId) }}
        </template>
      </el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="100"></el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="editCategory(scope.row)">编辑</el-button>
          <el-button type="danger" link @click="deleteCategory(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增分类' : '编辑分类'"
      width="500px"
    >
      <el-form :model="categoryForm" label-width="100px">
        <el-form-item label="分类名称">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="父分类">
          <el-select v-model="categoryForm.parentId" placeholder="请选择父分类" clearable>
            <el-option label="无父分类" :value="null"></el-option>
            <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.name" :value="cat.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分类描述">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="categoryForm.sortOrder" :min="0" :max="999"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCategory">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const categoryList = ref([])
const loading = ref(false)

const dialogVisible = ref(false)
const dialogType = ref('add')
const categoryForm = ref({
  name: '',
  parentId: null,
  description: '',
  sortOrder: 0
})

const getParentName = (parentId) => {
  if (!parentId) return '无'
  const parent = categoryList.value.find(cat => cat.id === parentId)
  return parent ? parent.name : '无'
}

const loadCategoryList = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/knowledge/categories')
    categoryList.value = response.data.data || []
  } catch (error) {
    ElMessage.error('加载分类列表失败')
  } finally {
    loading.value = false
  }
}

const showAddDialog = () => {
  dialogType.value = 'add'
  categoryForm.value = {
    name: '',
    parentId: null,
    description: '',
    sortOrder: 0
  }
  dialogVisible.value = true
}

const editCategory = (row) => {
  dialogType.value = 'edit'
  categoryForm.value = { ...row }
  dialogVisible.value = true
}

const saveCategory = async () => {
  try {
    if (dialogType.value === 'add') {
      await axios.post('/api/knowledge/categories', categoryForm.value)
      ElMessage.success('新增分类成功')
    } else {
      await axios.put(`/api/knowledge/categories/${categoryForm.value.id}`, categoryForm.value)
      ElMessage.success('更新分类成功')
    }
    dialogVisible.value = false
    loadCategoryList()
  } catch (error) {
    ElMessage.error('保存分类失败')
  }
}

const deleteCategory = (row) => {
  ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await axios.delete(`/api/knowledge/categories/${row.id}`)
      ElMessage.success('删除成功')
      loadCategoryList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  loadCategoryList()
})
</script>

<style scoped>
.category-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
