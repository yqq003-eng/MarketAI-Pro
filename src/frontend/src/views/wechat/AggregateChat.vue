<template>
  <div class="aggregate-chat">
    <div class="chat-sidebar">
      <div class="sidebar-header">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索聊天"
          prefix-icon="el-icon-search"
          size="small">
        </el-input>
      </div>

      <div class="chat-list">
        <div 
          v-for="chat in filteredChats" 
          :key="chat.id"
          class="chat-item"
          :class="{ 'active': activeChat && activeChat.id === chat.id }"
          @click="selectChat(chat)">
          <el-badge :value="chat.unreadCount" :hidden="chat.unreadCount === 0">
            <img :src="chat.customerAvatar" :alt="chat.customerName" class="chat-avatar">
          </el-badge>
          <div class="chat-info">
            <div class="chat-name">{{ chat.customerName }}</div>
            <div class="chat-last-msg">{{ chat.lastMessage }}</div>
          </div>
          <div class="chat-time">{{ formatTime(chat.lastTime) }}</div>
        </div>
      </div>
    </div>

    <div class="chat-main">
      <template v-if="activeChat">
        <div class="chat-header">
          <span class="chat-title">{{ activeChat.customerName }}</span>
          <el-tag size="small" :type="activeChat.status === 'active' ? 'success' : 'info'">
            {{ activeChat.status === 'active' ? '在线' : '离线' }}
          </el-tag>
        </div>

        <div class="chat-messages" ref="messageContainer">
          <div 
            v-for="msg in messages" 
            :key="msg.id"
            class="message-item"
            :class="msg.sender">
            <img 
              :src="msg.sender === 'user' ? userAvatar : activeChat.customerAvatar" 
              :alt="msg.sender"
              class="message-avatar">
            <div class="message-content">
              <div class="message-text">{{ msg.content }}</div>
              <div class="message-time">{{ formatTime(msg.time) }}</div>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <div class="input-toolbar">
            <el-button size="mini" icon="el-icon-picture" @click="showEmojiPicker = !showEmojiPicker"></el-button>
            <el-button size="mini" icon="el-icon-picture-outline" @click="triggerFileUpload"></el-button>
            <el-button size="mini" icon="el-icon-folder" @click="triggerImageUpload"></el-button>
          </div>
          <div class="input-area">
            <el-input
              type="textarea"
              v-model="newMessage"
              placeholder="输入消息..."
              :rows="3"
              @keyup.ctrl.enter.native="sendMessage">
            </el-input>
            <el-button type="primary" size="small" @click="sendMessage" style="margin-top: 10px;">发送</el-button>
          </div>
        </div>
      </template>

      <div v-else class="chat-empty">
        <i class="el-icon-chat-dot-round"></i>
        <p>选择一个聊天开始对话</p>
      </div>
    </div>

    <!-- 快捷回复 -->
    <div class="chat-sidebar-right">
      <div class="sidebar-header">
        <span>快捷回复</span>
      </div>
      <div class="quick-replies">
        <div 
          v-for="reply in quickReplies" 
          :key="reply.id"
          class="reply-item"
          @click="useQuickReply(reply)">
          <div class="reply-title">{{ reply.title }}</div>
          <div class="reply-content">{{ reply.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AggregateChat',
  data() {
    return {
      searchKeyword: '',
      activeChat: null,
      newMessage: '',
      showEmojiPicker: false,
      chats: [
        {
          id: 1,
          customerName: '张三',
          customerAvatar: 'https://via.placeholder.com/40',
          lastMessage: '您好，我想了解一下产品',
          lastTime: '2026-06-20 10:30:00',
          unreadCount: 3,
          status: 'active'
        },
        {
          id: 2,
          customerName: '李四',
          customerAvatar: 'https://via.placeholder.com/40',
          lastMessage: '谢谢，我考虑一下',
          lastTime: '2026-06-19 15:20:00',
          unreadCount: 0,
          status: 'offline'
        }
      ],
      messages: [
        {
          id: 1,
          chatId: 1,
          sender: 'customer',
          content: '您好，我想了解一下产品',
          time: '2026-06-20 10:30:00'
        },
        {
          id: 2,
          chatId: 1,
          sender: 'user',
          content: '您好！很高兴为您服务，请问您想了解哪方面的信息呢？',
          time: '2026-06-20 10:32:00'
        }
      ],
      quickReplies: [
        {
          id: 1,
          title: '产品介绍',
          content: '很高兴为您介绍我们的产品，它有很多优势...'
        },
        {
          id: 2,
          title: '价格咨询',
          content: '我们的产品价格非常优惠，具体可以...'
        },
        {
          id: 3,
          title: '使用方法',
          content: '产品使用很简单，我来给您详细说明...'
        }
      ],
      userAvatar: 'https://via.placeholder.com/40'
    }
  },
  computed: {
    filteredChats() {
      if (!this.searchKeyword) {
        return this.chats
      }
      return this.chats.filter(chat => 
        chat.customerName.includes(this.searchKeyword)
      )
    }
  },
  methods: {
    formatTime(timeStr) {
      const now = new Date()
      const time = new Date(timeStr)
      const diff = now - time

      if (diff < 60000) { // 1分钟内
        return '刚刚'
      } else if (diff < 3600000) { // 1小时内
        return Math.floor(diff / 60000) + '分钟前'
      } else if (diff < 86400000) { // 1天内
        return Math.floor(diff / 3600000) + '小时前'
      } else {
        return time.toLocaleDateString('zh-CN')
      }
    },
    selectChat(chat) {
      this.activeChat = chat
      chat.unreadCount = 0

      // 加载聊天记录
      this.$http.get(`/api/wechat/chat/${chat.id}/messages`)
        .then(res => {
          if (res.data.success) {
            this.messages = res.data.data
            this.scrollToBottom()
          }
        })
        .catch(err => {
          this.$message.error('加载聊天记录失败')
        })
    },
    sendMessage() {
      if (!this.newMessage.trim()) {
        this.$message.error('请输入消息内容')
        return
      }

      const message = {
        id: Date.now(),
        chatId: this.activeChat.id,
        sender: 'user',
        content: this.newMessage,
        time: new Date().toISOString()
      }

      this.messages.push(message)
      this.newMessage = ''
      this.scrollToBottom()

      // 调用后端API发送消息
      this.$http.post(`/api/wechat/chat/${this.activeChat.id}/messages`, {
        content: message.content,
        type: 'text'
      }).then(res => {
        if (res.data.success) {
          console.log('Message sent successfully')
        }
      }).catch(err => {
        this.$message.error('发送消息失败')
      })
    },
    useQuickReply(reply) {
      this.newMessage = reply.content
    },
    triggerFileUpload() {
      this.$message.info('文件上传功能')
      // 这里应该触发文件上传
    },
    triggerImageUpload() {
      this.$message.info('图片上传功能')
      // 这里应该触发图片上传
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messageContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    }
  },
  mounted() {
    // 加载聊天列表
    this.$http.get('/api/wechat/chat/list')
      .then(res => {
        if (res.data.success) {
          this.chats = res.data.data
        }
      })
      .catch(err => {
        this.$message.error('加载聊天列表失败')
      })
  }
}
</script>

<style scoped>
.aggregate-chat {
  display: flex;
  height: calc(100vh - 120px);
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.chat-sidebar {
  width: 300px;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.sidebar-header {
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.3s;
}

.chat-item:hover,
.chat-item.active {
  background-color: #ecf5ff;
}

.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.chat-info {
  flex: 1;
  overflow: hidden;
}

.chat-name {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
}

.chat-last-msg {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-time {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-title {
  font-size: 16px;
  font-weight: bold;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
}

.message-item.customer {
  flex-direction: row;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: 0 10px;
}

.message-content {
  max-width: 60%;
  padding: 10px 15px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.message-item.user .message-content {
  background-color: #95ec69;
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
  padding: 15px;
  border-top: 1px solid #e4e7ed;
}

.input-toolbar {
  margin-bottom: 10px;
}

.input-area {
  display: flex;
  flex-direction: column;
}

.chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
}

.chat-empty i {
  font-size: 64px;
  margin-bottom: 20px;
}

.chat-sidebar-right {
  width: 250px;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.quick-replies {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.reply-item {
  padding: 10px;
  margin-bottom: 10px;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.reply-item:hover {
  background-color: #ecf5ff;
}

.reply-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
}

.reply-content {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
