<template>
  <div class="customer-tags">
    <div class="page-header">
      <h2>客户标签</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog">添加标签</el-button>
        <el-button @click="refreshList">刷新</el-button>
      </div>
    </div>

    <!-- 标签列表 -->
    <div class="tags-container">
      <el-row :gutter="20">
        <el-col :span="8" v-for="tag in tags" :key="tag.id" style="margin-bottom: 20px;">
          <el-card shadow="hover" class="tag-card">
            <div class="tag-header">
              <el-tag :color="tag.color" effect="dark" size="large">{{ tag.name }}</el-tag>
              <div class="tag-actions">
                <el-button size="small" @click="editTag(tag)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteTag(tag.id)">删除</el-button>
              </div>
            </div>
            <div class="tag-body">
              <p class="tag-description">{{ tag.description || '暂无描述' }}</p>
              <p class="tag-meta">
                <span>创建时间: {{ tag.created_at }}</span>
              </p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="tagForm" label-width="80px">
        <el-form-item label="标签名称">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称"></el-input>
        </el-form-item>
        <el-form-item label="标签颜色">
          <el-color-picker v-model="tagForm.color"></el-color-picker>
          <div style="margin-left: 10px; display: inline-block;">
            <el-tag :color="tagForm.color" effect="dark">{{ tagForm.name || '预览' }}</el-tag>
          </div>
        </el-form-item>
        <el-form-item label="标签描述">
          <el-input v-model="tagForm.description" type="textarea" :rows="3" placeholder="请输入标签描述"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTag">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'CustomerTags',
  setup() {
    const tags = ref([])
    const dialogVisible = ref(false)
    const dialogTitle = ref('添加标签')
    const isEdit = ref(false)
    
    const tagForm = ref({
      id: null,
      name: '',
      color: '#409EFF',
      description: ''
    })
    
    const loadTags = async () => {
      try {
        const response = await fetch('/api/wecom/customer-tags')
        const result = await response.json()
        if (result.code === 200) {
          tags.value = result.data
        }
      } catch (error) {
        ElMessage.error('加载标签数据失败')
      }
    }
    
    const showAddDialog = () => {
      dialogTitle.value = '添加标签'
      isEdit.value = false
      tagForm.value = {
        id: null,
        name: '',
        color: '#409EFF',
        description: ''
      }
      dialogVisible.value = true
    }
    
    const editTag = (row) => {
      dialogTitle.value = '编辑标签'
      isEdit.value = true
      tagForm.value = {
        id: row.id,
        name: row.name,
        color: row.color,
        description: row.description
      }
      dialogVisible.value = true
    }
    
    const saveTag = async () => {
      try {
        const url = isEdit.value ? `/api/wecom/customer-tags/${tagForm.value.id}` : '/api/wecom/customer-tags'
        const method = isEdit.value ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tagForm.value)
        })
        
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
          dialogVisible.value = false
          loadTags()
        }
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }
    
    const deleteTag = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个标签吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`/api/wecom/customer-tags/${id}`, { method: 'DELETE' })
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success('删除成功')
          loadTags()
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }
    
    const refreshList = () => {
      loadTags()
    }
    
    onMounted(() => {
      loadTags()
    })
    
    return {
      tags,
      tagForm,
      dialogVisible,
      dialogTitle,
      loadTags,
      showAddDialog,
      editTag,
      saveTag,
      deleteTag,
      refreshList
    }
  }
}
</script>

<style scoped>
.customer-tags {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tags-container {
  margin-top: 20px;
}

.tag-card {
  height: 180px;
  transition: all 0.3s;
}

.tag-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.tag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.tag-actions {
  display: flex;
  gap: 5px;
}

.tag-body {
  padding: 10px 0;
}

.tag-description {
  color: #666;
  margin-bottom: 10px;
  min-height: 40px;
}

.tag-meta {
  font-size: 12px;
  color: #999;
}
</style>
