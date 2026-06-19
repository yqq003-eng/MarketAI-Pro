<template>
  <div class="avatar-customization">
    <div class="page-header">
      <h2>形象定制</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog">添加形象</el-button>
        <el-button @click="refreshList">刷新</el-button>
      </div>
    </div>

    <!-- 形象列表 -->
    <el-table :data="avatars" border style="width: 100%">
      <el-table-column prop="name" label="形象名称" width="200"></el-table-column>
      <el-table-column prop="gender" label="性别" width="100">
        <template #default="scope">
          <el-tag>
            {{ scope.row.gender === 'male' ? '男' : '女' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="age_range" label="年龄范围" width="120"></el-table-column>
      <el-table-column prop="style" label="风格" width="150"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="editAvatar(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteAvatar(scope.row.id)">删除</el-button>
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
        @size-change="loadAvatars"
        @current-change="loadAvatars"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="avatarForm" label-width="80px">
        <el-form-item label="形象名称">
          <el-input v-model="avatarForm.name"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="avatarForm.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄范围">
          <el-input v-model="avatarForm.age_range"></el-input>
        </el-form-item>
        <el-form-item label="风格">
          <el-input v-model="avatarForm.style"></el-input>
        </el-form-item>
        <el-form-item label="照片URL">
          <el-input v-model="avatarForm.photo_url" placeholder="请输入照片URL"></el-input>
        </el-form-item>
        <el-form-item label="模型URL">
          <el-input v-model="avatarForm.model_url" placeholder="请输入3D模型URL"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="avatarForm.status" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAvatar">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'AvatarCustomization',
  setup() {
    const avatars = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    const dialogVisible = ref(false)
    const dialogTitle = ref('添加形象')
    const isEdit = ref(false)
    
    const avatarForm = ref({
      id: null,
      name: '',
      gender: 'male',
      age_range: '',
      style: '',
      photo_url: '',
      model_url: '',
      status: 1
    })
    
    const loadAvatars = async () => {
      try {
        const response = await fetch(`/api/digital/avatars?page=${currentPage.value}&limit=${pageSize.value}`)
        const result = await response.json()
        if (result.code === 200) {
          avatars.value = result.data.list
          total.value = result.data.total
        }
      } catch (error) {
        ElMessage.error('加载形象数据失败')
      }
    }
    
    const showAddDialog = () => {
      dialogTitle.value = '添加形象'
      isEdit.value = false
      avatarForm.value = {
        id: null,
        name: '',
        gender: 'male',
        age_range: '',
        style: '',
        photo_url: '',
        model_url: '',
        status: 1
      }
      dialogVisible.value = true
    }
    
    const editAvatar = (row) => {
      dialogTitle.value = '编辑形象'
      isEdit.value = true
      avatarForm.value = {
        id: row.id,
        name: row.name,
        gender: row.gender,
        age_range: row.age_range,
        style: row.style,
        photo_url: row.photo_url,
        model_url: row.model_url,
        status: row.status
      }
      dialogVisible.value = true
    }
    
    const saveAvatar = async () => {
      try {
        const url = isEdit.value ? `/api/digital/avatars/${avatarForm.value.id}` : '/api/digital/avatars'
        const method = isEdit.value ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(avatarForm.value)
        })
        
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
          dialogVisible.value = false
          loadAvatars()
        }
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }
    
    const deleteAvatar = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个形象吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`/api/digital/avatars/${id}`, { method: 'DELETE' })
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success('删除成功')
          loadAvatars()
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }
    
    const refreshList = () => {
      loadAvatars()
    }
    
    onMounted(() => {
      loadAvatars()
    })
    
    return {
      avatars,
      currentPage,
      pageSize,
      total,
      avatarForm,
      dialogVisible,
      dialogTitle,
      loadAvatars,
      showAddDialog,
      editAvatar,
      saveAvatar,
      deleteAvatar,
      refreshList
    }
  }
}
</script>

<style scoped>
.avatar-customization {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
