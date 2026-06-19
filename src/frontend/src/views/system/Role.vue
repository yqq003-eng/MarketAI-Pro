<template>
  <div class="role-container">
    <div class="page-header">
      <h2>角色管理</h2>
      <el-button type="primary" @click="showAddDialog">新增角色</el-button>
    </div>

    <el-table :data="roleList" style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="角色名称" width="150"></el-table-column>
      <el-table-column prop="code" label="角色代码" width="150"></el-table-column>
      <el-table-column prop="description" label="描述" min-width="250"></el-table-column>
      <el-table-column prop="permissions" label="权限" min-width="300">
        <template #default="scope">
          <el-tag
            v-for="perm in scope.row.permissions"
            :key="perm"
            style="margin-right: 5px; margin-bottom: 5px"
          >
            {{ perm }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="editRole(scope.row)">编辑</el-button>
          <el-button type="primary" link @click="managePermissions(scope.row)">权限</el-button>
          <el-button type="danger" link @click="deleteRole(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="500px"
    >
      <el-form :model="roleForm" label-width="100px">
        <el-form-item label="角色名称">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色代码">
          <el-input v-model="roleForm.code" placeholder="请输入角色代码" :disabled="dialogType === 'edit'"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRole">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 权限管理对话框 -->
    <el-dialog
      v-model="permissionVisible"
      title="权限管理"
      width="600px"
    >
      <div class="permission-section">
        <el-tree
          ref="permissionTreeRef"
          :data="permissionTree"
          :props="treeProps"
          show-checkbox
          node-key="id"
          default-expand-all
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionVisible = false">取消</el-button>
          <el-button type="primary" @click="savePermissions">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const roleList = ref([])
const loading = ref(false)

const dialogVisible = ref(false)
const permissionVisible = ref(false)
const dialogType = ref('add')
const roleForm = ref({
  name: '',
  code: '',
  description: '',
  permissions: []
})

const permissionTree = ref([])
const permissionTreeRef = ref(null)
const currentRoleId = ref(null)

const treeProps = {
  children: 'children',
  label: 'label'
}

const loadRoleList = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/system/roles')
    roleList.value = response.data.data || []
  } catch (error) {
    ElMessage.error('加载角色列表失败')
  } finally {
    loading.value = false
  }
}

const loadPermissionTree = async () => {
  try {
    // 这里应该从API获取权限树，这里使用示例数据
    permissionTree.value = [
      {
        id: 'dashboard',
        label: '仪表盘',
        children: [
          { id: 'dashboard:view', label: '查看' }
        ]
      },
      {
        id: 'video',
        label: '短视频矩阵',
        children: [
          { id: 'video:view', label: '查看' },
          { id: 'video:create', label: '创建' },
          { id: 'video:edit', label: '编辑' },
          { id: 'video:delete', label: '删除' }
        ]
      },
      {
        id: 'customer',
        label: '智能获客',
        children: [
          { id: 'customer:view', label: '查看' },
          { id: 'customer:create', label: '创建' },
          { id: 'customer:edit', label: '编辑' },
          { id: 'customer:delete', label: '删除' }
        ]
      },
      {
        id: 'system',
        label: '系统管理',
        children: [
          { id: 'system:user:view', label: '用户查看' },
          { id: 'system:user:manage', label: '用户管理' },
          { id: 'system:role:view', label: '角色查看' },
          { id: 'system:role:manage', label: '角色管理' },
          { id: 'system:config:view', label: '配置查看' },
          { id: 'system:config:manage', label: '配置管理' }
        ]
      }
    ]
  } catch (error) {
    ElMessage.error('加载权限树失败')
  }
}

const showAddDialog = () => {
  dialogType.value = 'add'
  roleForm.value = {
    name: '',
    code: '',
    description: '',
    permissions: []
  }
  dialogVisible.value = true
}

const editRole = (row) => {
  dialogType.value = 'edit'
  roleForm.value = { ...row }
  dialogVisible.value = true
}

const saveRole = async () => {
  try {
    if (dialogType.value === 'add') {
      await axios.post('/api/system/roles', roleForm.value)
      ElMessage.success('新增角色成功')
    } else {
      await axios.put(`/api/system/roles/${roleForm.value.id}`, roleForm.value)
      ElMessage.success('更新角色成功')
    }
    dialogVisible.value = false
    loadRoleList()
  } catch (error) {
    ElMessage.error('保存角色失败')
  }
}

const managePermissions = async (row) => {
  currentRoleId.value = row.id
  permissionVisible.value = true

  await nextTick()

  // 设置已选中的权限
  if (permissionTreeRef.value) {
    permissionTreeRef.value.setCheckedKeys(row.permissions || [])
  }
}

const savePermissions = async () => {
  try {
    const checkedKeys = permissionTreeRef.value?.getCheckedKeys() || []
    const halfCheckedKeys = permissionTreeRef.value?.getHalfCheckedKeys() || []
    const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys]

    await axios.put(`/api/system/roles/${currentRoleId.value}`, {
      permissions: allCheckedKeys
    })

    ElMessage.success('权限更新成功')
    permissionVisible.value = false
    loadRoleList()
  } catch (error) {
    ElMessage.error('权限更新失败')
  }
}

const deleteRole = (row) => {
  ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await axios.delete(`/api/system/roles/${row.id}`)
      ElMessage.success('删除成功')
      loadRoleList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  loadRoleList()
  loadPermissionTree()
})
</script>

<style scoped>
.role-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.permission-section {
  max-height: 400px;
  overflow-y: auto;
}
</style>
