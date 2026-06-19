<template>
  <div class="auto-reply">
    <div class="page-header">
      <h2>自动回复</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog">添加规则</el-button>
        <el-button @click="refreshList">刷新</el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="启用" :value="1"></el-option>
            <el-option label="禁用" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadAutoReplies">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 自动回复规则列表 -->
    <el-table :data="autoReplies" border style="width: 100%">
      <el-table-column prop="name" label="规则名称" width="200"></el-table-column>
      <el-table-column prop="keywords" label="关键词" width="200"></el-table-column>
      <el-table-column prop="reply_type" label="回复类型" width="120">
        <template #default="scope">
          <el-tag>
            {{ scope.row.reply_type === 'text' ? '文本' : scope.row.reply_type === 'image' ? '图片' : '链接' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="reply_content" label="回复内容" width="300">
        <template #default="scope">
          <div class="content-preview">{{ scope.row.reply_content }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="editRule(scope.row)">编辑</el-button>
          <el-button size="small" :type="scope.row.status === 1 ? 'warning' : 'success'" @click="toggleStatus(scope.row)">
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button size="small" type="danger" @click="deleteRule(scope.row.id)">删除</el-button>
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
        @size-change="loadAutoReplies"
        @current-change="loadAutoReplies"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="ruleForm" label-width="100px">
        <el-form-item label="规则名称">
          <el-input v-model="ruleForm.name" placeholder="请输入规则名称"></el-input>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="ruleForm.keywords" placeholder="请输入关键词，多个关键词用逗号分隔"></el-input>
          <div class="form-tip">多个关键词用逗号分隔，如：你好,hello,hi</div>
        </el-form-item>
        <el-form-item label="回复类型">
          <el-radio-group v-model="ruleForm.reply_type">
            <el-radio label="text">文本</el-radio>
            <el-radio label="image">图片</el-radio>
            <el-radio label="link">链接</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="回复内容">
          <el-input v-model="ruleForm.reply_content" type="textarea" :rows="4" placeholder="请输入回复内容"></el-input>
          <div class="form-tip" v-if="ruleForm.reply_type === 'image'">请输入图片URL地址</div>
          <div class="form-tip" v-if="ruleForm.reply_type === 'link'">请输入链接URL地址</div>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="ruleForm.status" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRule">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'AutoReply',
  setup() {
    const autoReplies = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    const dialogVisible = ref(false)
    const dialogTitle = ref('添加规则')
    const isEdit = ref(false)
    
    const filterForm = ref({
      status: ''
    })
    
    const ruleForm = ref({
      id: null,
      name: '',
      keywords: '',
      reply_type: 'text',
      reply_content: '',
      status: 1
    })
    
    const loadAutoReplies = async () => {
      try {
        const response = await fetch(`/api/wecom/auto-replies?page=${currentPage.value}&limit=${pageSize.value}&status=${filterForm.value.status}`)
        const result = await response.json()
        if (result.code === 200) {
          autoReplies.value = result.data.list
          total.value = result.data.total
        }
      } catch (error) {
        ElMessage.error('加载自动回复规则失败')
      }
    }
    
    const showAddDialog = () => {
      dialogTitle.value = '添加规则'
      isEdit.value = false
      ruleForm.value = {
        id: null,
        name: '',
        keywords: '',
        reply_type: 'text',
        reply_content: '',
        status: 1
      }
      dialogVisible.value = true
    }
    
    const editRule = (row) => {
      dialogTitle.value = '编辑规则'
      isEdit.value = true
      ruleForm.value = {
        id: row.id,
        name: row.name,
        keywords: row.keywords,
        reply_type: row.reply_type,
        reply_content: row.reply_content,
        status: row.status
      }
      dialogVisible.value = true
    }
    
    const saveRule = async () => {
      try {
        const url = isEdit.value ? `/api/wecom/auto-replies/${ruleForm.value.id}` : '/api/wecom/auto-replies'
        const method = isEdit.value ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ruleForm.value)
        })
        
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
          dialogVisible.value = false
          loadAutoReplies()
        }
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }
    
    const deleteRule = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个自动回复规则吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`/api/wecom/auto-replies/${id}`, { method: 'DELETE' })
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success('删除成功')
          loadAutoReplies()
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }
    
    const toggleStatus = async (row) => {
      try {
        const newStatus = row.status === 1 ? 0 : 1
        const response = await fetch(`/api/wecom/auto-replies/${row.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...row,
            status: newStatus
          })
        })
        
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success(newStatus === 1 ? '已启用' : '已禁用')
          loadAutoReplies()
        }
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }
    
    const refreshList = () => {
      loadAutoReplies()
    }
    
    const resetFilter = () => {
      filterForm.value = {
        status: ''
      }
      loadAutoReplies()
    }
    
    onMounted(() => {
      loadAutoReplies()
    })
    
    return {
      autoReplies,
      currentPage,
      pageSize,
      total,
      filterForm,
      ruleForm,
      dialogVisible,
      dialogTitle,
      loadAutoReplies,
      showAddDialog,
      editRule,
      saveRule,
      deleteRule,
      toggleStatus,
      refreshList,
      resetFilter
    }
  }
}
</script>

<style scoped>
.auto-reply {
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

.content-preview {
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
