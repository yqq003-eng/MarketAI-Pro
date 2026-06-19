<template>
  <div class="refine-library">
    <div class="page-header">
      <h2>精剪库</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog">添加模板</el-button>
        <el-button @click="refreshList">刷新</el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="标题" clearable></el-input>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="filterForm.category" placeholder="选择分类" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="产品介绍" value="产品介绍"></el-option>
            <el-option label="教程分享" value="教程分享"></el-option>
            <el-option label="品牌宣传" value="品牌宣传"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadLibrary">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 精剪库列表 -->
    <el-table :data="library" border style="width: 100%">
      <el-table-column prop="title" label="标题" width="200"></el-table-column>
      <el-table-column prop="category" label="分类" width="150"></el-table-column>
      <el-table-column prop="description" label="描述" width="300"></el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="viewTemplate(scope.row)">查看</el-button>
          <el-button size="small" @click="editTemplate(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteTemplate(scope.row.id)">删除</el-button>
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
        @size-change="loadLibrary"
        @current-change="loadLibrary"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="templateForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="templateForm.title"></el-input>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="templateForm.category" placeholder="选择分类" style="width: 100%;">
            <el-option label="产品介绍" value="产品介绍"></el-option>
            <el-option label="教程分享" value="教程分享"></el-option>
            <el-option label="品牌宣传" value="品牌宣传"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="templateForm.description" type="textarea" :rows="3"></el-input>
        </el-form-item>
        <el-form-item label="模板URL">
          <el-input v-model="templateForm.template_url"></el-input>
        </el-form-item>
        <el-form-item label="缩略图">
          <el-input v-model="templateForm.thumbnail"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTemplate">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'RefineLibrary',
  setup() {
    const library = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    const dialogVisible = ref(false)
    const dialogTitle = ref('添加模板')
    const isEdit = ref(false)
    
    const filterForm = ref({
      keyword: '',
      category: ''
    })
    
    const templateForm = ref({
      id: null,
      title: '',
      category: '',
      description: '',
      template_url: '',
      thumbnail: ''
    })
    
    const loadLibrary = async () => {
      try {
        const response = await fetch(`/api/digital/refine-library?page=${currentPage.value}&limit=${pageSize.value}&keyword=${filterForm.value.keyword}&category=${filterForm.value.category}`)
        const result = await response.json()
        if (result.code === 200) {
          library.value = result.data.list
          total.value = result.data.total
        }
      } catch (error) {
        ElMessage.error('加载精剪库数据失败')
      }
    }
    
    const showAddDialog = () => {
      dialogTitle.value = '添加模板'
      isEdit.value = false
      templateForm.value = {
        id: null,
        title: '',
        category: '',
        description: '',
        template_url: '',
        thumbnail: ''
      }
      dialogVisible.value = true
    }
    
    const editTemplate = (row) => {
      dialogTitle.value = '编辑模板'
      isEdit.value = true
      templateForm.value = {
        id: row.id,
        title: row.title,
        category: row.category,
        description: row.description,
        template_url: row.template_url,
        thumbnail: row.thumbnail
      }
      dialogVisible.value = true
    }
    
    const viewTemplate = (row) => {
      ElMessage.info('查看模板功能开发中...')
    }
    
    const saveTemplate = async () => {
      try {
        const url = isEdit.value ? `/api/digital/refine-library/${templateForm.value.id}` : '/api/digital/refine-library'
        const method = isEdit.value ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateForm.value)
        })
        
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
          dialogVisible.value = false
          loadLibrary()
        }
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }
    
    const deleteTemplate = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个模板吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`/api/digital/refine-library/${id}`, { method: 'DELETE' })
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success('删除成功')
          loadLibrary()
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }
    
    const refreshList = () => {
      loadLibrary()
    }
    
    const resetFilter = () => {
      filterForm.value = {
        keyword: '',
        category: ''
      }
      loadLibrary()
    }
    
    onMounted(() => {
      loadLibrary()
    })
    
    return {
      library,
      currentPage,
      pageSize,
      total,
      filterForm,
      templateForm,
      dialogVisible,
      dialogTitle,
      loadLibrary,
      showAddDialog,
      editTemplate,
      viewTemplate,
      saveTemplate,
      deleteTemplate,
      refreshList,
      resetFilter
    }
  }
}
</script>

<style scoped>
.refine-library {
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
