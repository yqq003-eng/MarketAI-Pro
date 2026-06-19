<template>
  <div class="digital-refine">
    <div class="page-header">
      <h2>数字人精剪</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog">创建精剪</el-button>
        <el-button @click="refreshList">刷新</el-button>
      </div>
    </div>

    <!-- 精剪列表 -->
    <el-table :data="refines" border style="width: 100%">
      <el-table-column prop="title" label="标题" width="200"></el-table-column>
      <el-table-column prop="voice_id" label="声音ID" width="100"></el-table-column>
      <el-table-column prop="avatar_id" label="形象ID" width="100"></el-table-column>
      <el-table-column prop="duration" label="时长(秒)" width="120"></el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="viewRefine(scope.row)">查看</el-button>
          <el-button size="small" @click="editRefine(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteRefine(scope.row.id)">删除</el-button>
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
        @size-change="loadRefines"
        @current-change="loadRefines"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="refineForm" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="refineForm.title"></el-input>
        </el-form-item>
        <el-form-item label="声音ID">
          <el-input-number v-model="refineForm.voice_id" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="形象ID">
          <el-input-number v-model="refineForm.avatar_id" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="脚本内容">
          <el-input v-model="refineForm.script" type="textarea" :rows="6"></el-input>
        </el-form-item>
        <el-form-item label="视频URL">
          <el-input v-model="refineForm.video_url"></el-input>
        </el-form-item>
        <el-form-item label="时长(秒)">
          <el-input-number v-model="refineForm.duration" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="refineForm.status" placeholder="选择状态">
            <el-option label="草稿" value="draft"></el-option>
            <el-option label="处理中" value="processing"></el-option>
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="失败" value="failed"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRefine">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'DigitalRefine',
  setup() {
    const refines = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    const dialogVisible = ref(false)
    const dialogTitle = ref('创建精剪')
    const isEdit = ref(false)
    
    const refineForm = ref({
      id: null,
      title: '',
      voice_id: null,
      avatar_id: null,
      script: '',
      video_url: '',
      duration: null,
      status: 'draft'
    })
    
    const loadRefines = async () => {
      try {
        const response = await fetch(`/api/digital/refines?page=${currentPage.value}&limit=${pageSize.value}`)
        const result = await response.json()
        if (result.code === 200) {
          refines.value = result.data.list
          total.value = result.data.total
        }
      } catch (error) {
        ElMessage.error('加载精剪数据失败')
      }
    }
    
    const showAddDialog = () => {
      dialogTitle.value = '创建精剪'
      isEdit.value = false
      refineForm.value = {
        id: null,
        title: '',
        voice_id: null,
        avatar_id: null,
        script: '',
        video_url: '',
        duration: null,
        status: 'draft'
      }
      dialogVisible.value = true
    }
    
    const editRefine = (row) => {
      dialogTitle.value = '编辑精剪'
      isEdit.value = true
      refineForm.value = {
        id: row.id,
        title: row.title,
        voice_id: row.voice_id,
        avatar_id: row.avatar_id,
        script: row.script,
        video_url: row.video_url,
        duration: row.duration,
        status: row.status
      }
      dialogVisible.value = true
    }
    
    const viewRefine = (row) => {
      ElMessage.info('查看功能开发中...')
    }
    
    const saveRefine = async () => {
      try {
        const url = isEdit.value ? `/api/digital/refines/${refineForm.value.id}` : '/api/digital/refines'
        const method = isEdit.value ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(refineForm.value)
        })
        
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
          dialogVisible.value = false
          loadRefines()
        }
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }
    
    const deleteRefine = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个精剪吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`/api/digital/refines/${id}`, { method: 'DELETE' })
        const result = await response.json()
        if (result.code === 200) {
          ElMessage.success('删除成功')
          loadRefines()
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }
    
    const refreshList = () => {
      loadRefines()
    }
    
    const getStatusType = (status) => {
      const types = {
        'draft': 'info',
        'processing': 'warning',
        'completed': 'success',
        'failed': 'danger'
      }
      return types[status] || 'info'
    }
    
    const getStatusText = (status) => {
      const texts = {
        'draft': '草稿',
        'processing': '处理中',
        'completed': '已完成',
        'failed': '失败'
      }
      return texts[status] || '未知'
    }
    
    onMounted(() => {
      loadRefines()
    })
    
    return {
      refines,
      currentPage,
      pageSize,
      total,
      refineForm,
      dialogVisible,
      dialogTitle,
      loadRefines,
      showAddDialog,
      editRefine,
      viewRefine,
      saveRefine,
      deleteRefine,
      refreshList,
      getStatusType,
      getStatusText
    }
  }
}
</script>

<style scoped>
.digital-refine {
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
