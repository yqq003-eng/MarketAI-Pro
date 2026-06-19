<template>
  <div class="voice-customization">
    <div class="page-header">
      <h2>声音定制</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog">添加声音</el-button>
        <el-button @click="refreshList">刷新</el-button>
      </div>
    </div>

    <!-- 声音列表 -->
    <el-table :data="voices" border style="width: 100%">
      <el-table-column prop="name" label="声音名称" width="200"></el-table-column>
      <el-table-column prop="gender" label="性别" width="100">
        <template #default="scope">
          <el-tag>
            {{ scope.row.gender === 'male' ? '男' : '女' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="age" label="年龄" width="100"></el-table-column>
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
          <el-button size="small" @click="editVoice(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteVoice(scope.row.id)">删除</el-button>
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
        @size-change="loadVoices"
        @current-change="loadVoices"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="voiceForm" label-width="80px">
        <el-form-item label="声音名称">
          <el-input v-model="voiceForm.name"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="voiceForm.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number v-model="voiceForm.age" :min="18" :max="100"></el-input-number>
        </el-form-item>
        <el-form-item label="风格">
          <el-input v-model="voiceForm.style"></el-input>
        </el-form-item>
        <el-form-item label="样本音频">
          <el-input v-model="voiceForm.sample_url" placeholder="请输入音频URL"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="voiceForm.status" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveVoice">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'VoiceCustomization',
  setup() {
    const voices = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    const dialogVisible = ref(false)
    const dialogTitle = ref('添加声音')
    const isEdit = ref(false)
    
    const voiceForm = ref({
      id: null,
      name: '',
      gender: 'male',
      age: 30,
      style: '',
      sample_url: '',
      status: 1
    })
    
    const loadVoices = async () => {
      try {
        const response = await fetch(`/api/digital/voices?page=${currentPage.value}&limit=${pageSize.value}`)
        const result = await response.json()
        if (result.code === 200) {
          voices.value = result.data.list
          total.value = result.data.total
        }
      } catch (error) {
        ElMessage.error('加载声音数据失败')
      }
    }
    
    const showAddDialog = () => {
      dialogTitle.value = '添加声音'
      isEdit.value = false
      voiceForm.value = {
        id: null,
        name: '',
        gender: 'male',
        age: 30,
        style: '',
        sample_url: '',
        status: 1
      }
      dialogVisible.value = true
    }
    
    const editVoice = (row) => {
      dialogTitle.value = '编辑声音'
      isEdit.value = true
      voiceForm.value = {
        id: row.id,
        name: row.name,
        gender: row.gender,
        age: row.age,
        style: row.style,
        sample_url: row.sample_url,
        status: row.status
      }
      dialogVisible.value = true
    }
    
    const saveVoice = async () => {
      try {
        const url = isEdit.value ? `/api/digital/voices/${voiceForm.value.id}` : '/api/digital/voices'
        const method = isEdit.value ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(voiceForm.value)
        })
        
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
          dialogVisible.value = false
          loadVoices()
        }
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }
    
    const deleteVoice = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个声音吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`/api/digital/voices/${id}`, { method: 'DELETE' })
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success('删除成功')
          loadVoices()
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }
    
    const refreshList = () => {
      loadVoices()
    }
    
    onMounted(() => {
      loadVoices()
    })
    
    return {
      voices,
      currentPage,
      pageSize,
      total,
      voiceForm,
      dialogVisible,
      dialogTitle,
      loadVoices,
      showAddDialog,
      editVoice,
      saveVoice,
      deleteVoice,
      refreshList
    }
  }
}
</script>

<style scoped>
.voice-customization {
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
