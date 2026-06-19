<template>
  <div class="chat-management">
    <div class="page-header">
      <h2>沟通聊天</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog">发送消息</el-button>
        <el-button @click="refreshChats">刷新</el-button>
      </div>
    </div>

    <!-- 候选人选择 -->
    <div class="candidate-selector">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="候选人">
          <el-select v-model="selectedCandidate" placeholder="选择候选人" @change="loadChats" style="width: 300px;">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="candidate in candidates" :key="candidate.id" :label="candidate.name" :value="candidate.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <!-- 聊天记录 -->
    <div class="chat-container" v-if="selectedCandidate">
      <div class="chat-messages">
        <div v-for="chat in chats" :key="chat.id" :class="['message-item', chat.sender === 'recruiter' ? 'message-right' : 'message-left']">
          <div class="message-content">
            <div class="message-sender">{{ chat.sender === 'recruiter' ? '我' : '候选人' }}</div>
            <div class="message-text">{{ chat.message }}</div>
            <div class="message-time">{{ formatTime(chat.created_at) }}</div>
          </div>
        </div>
      </div>
      
      <!-- 消息输入 -->
      <div class="chat-input">
        <el-input v-model="newMessage" placeholder="请输入消息内容" @keyup.enter="sendMessage">
          <template #append>
            <el-button @click="sendMessage">发送</el-button>
          </template>
        </el-input>
      </div>
    </div>

    <div v-else class="no-selection">
      <el-empty description="请选择候选人"></el-empty>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'ChatManagement',
  setup() {
    const candidates = ref([])
    const selectedCandidate = ref('')
    const chats = ref([])
    const newMessage = ref('')
    
    const filterForm = ref({
      keyword: ''
    })
    
    const loadCandidates = async () => {
      try {
        const response = await fetch('/api/boss/candidates?limit=1000')
        const result = await response.json()
        if (result.code === 200) {
          candidates.value = result.data.list
        }
      } catch (error) {
        ElMessage.error('加载候选人数据失败')
      }
    }
    
    const loadChats = async () => {
      if (!selectedCandidate.value) {
        chats.value = []
        return
      }
      
      try {
        const response = await fetch(`/api/boss/chats?candidate_id=${selectedCandidate.value}`)
        const result = await response.json()
        if (result.code === 200) {
          chats.value = result.data
        }
      } catch (error) {
        ElMessage.error('加载聊天记录失败')
      }
    }
    
    const sendMessage = async () => {
      if (!newMessage.value.trim()) {
        ElMessage.warning('请输入消息内容')
        return
      }
      
      if (!selectedCandidate.value) {
        ElMessage.warning('请选择候选人')
        return
      }
      
      try {
        const response = await fetch('/api/boss/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidate_id: selectedCandidate.value,
            message: newMessage.value,
            sender: 'recruiter'
          })
        })
        
        const result = await response.json()
        if (result.code === 200) {
          newMessage.value = ''
          loadChats()
        }
      } catch (error) {
        ElMessage.error('发送消息失败')
      }
    }
    
    const showAddDialog = () => {
      ElMessage.info('请选择候选人并输入消息')
    }
    
    const refreshChats = () => {
      loadChats()
    }
    
    const formatTime = (time) => {
      if (!time) return ''
      const date = new Date(time)
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    
    onMounted(() => {
      loadCandidates()
    })
    
    return {
      candidates,
      selectedCandidate,
      chats,
      newMessage,
      filterForm,
      loadCandidates,
      loadChats,
      sendMessage,
      showAddDialog,
      refreshChats,
      formatTime
    }
  }
}
</script>

<style scoped>
.chat-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.candidate-selector {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 4px;
}

.chat-container {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  height: 600px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message-item {
  margin-bottom: 20px;
  display: flex;
}

.message-left {
  justify-content: flex-start;
}

.message-right {
  justify-content: flex-end;
}

.message-content {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 8px;
}

.message-left .message-content {
  background: #f0f0f0;
}

.message-right .message-content {
  background: #95ec69;
  color: white;
}

.message-sender {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.message-text {
  font-size: 14px;
  line-height: 1.5;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  text-align: right;
}

.chat-input {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
}

.no-selection {
  padding: 100px 0;
  text-align: center;
}
</style>
