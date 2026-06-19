const { contextBridge, ipcRenderer } = require('electron')

// 安全地将Electron API暴露给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 应用控制
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  minimize: () => ipcRenderer.invoke('app:minimize'),
  maximize: () => ipcRenderer.invoke('app:maximize'),
  close: () => ipcRenderer.invoke('app:close'),
  showNotification: (title, body) => ipcRenderer.invoke('app:showNotification', { title, body }),

  // 更新相关
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update:available', callback)
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update:downloaded', callback)
  },

  // 文件系统访问（安全的）
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('file:write', filePath, content),
  selectDirectory: () => ipcRenderer.invoke('file:selectDirectory'),
  selectFile: (options) => ipcRenderer.invoke('file:selectFile', options),

  // 数据库操作
  dbQuery: (sql, params) => ipcRenderer.invoke('db:query', sql, params),
  dbExecute: (sql, params) => ipcRenderer.invoke('db:execute', sql, params),

  // 本地服务管理
  startLocalServer: (port) => ipcRenderer.invoke('server:start', port),
  stopLocalServer: () => ipcRenderer.invoke('server:stop'),
  getServerStatus: () => ipcRenderer.invoke('server:status'),

  // 平台API调用
  callPlatformAPI: (platform, endpoint, data) => 
    ipcRenderer.invoke('platform:call', platform, endpoint, data),

  // WebSocket连接管理
  createWebSocket: (url) => ipcRenderer.invoke('ws:create', url),
  sendWebSocketMessage: (id, message) => ipcRenderer.invoke('ws:send', id, message),
  closeWebSocket: (id) => ipcRenderer.invoke('ws:close', id)
})

// 暴露安全的Node.js功能给渲染进程
contextBridge.exposeInMainWorld('nodeAPI', {
  // 平台信息
  platform: process.platform,
  arch: process.arch,
  versions: {
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome
  },

  // 环境变量
  env: {
    NODE_ENV: process.env.NODE_ENV
  }
})
