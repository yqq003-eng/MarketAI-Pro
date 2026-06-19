const { app, BrowserWindow, ipcMain, Tray, Menu, shell, Notification } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater')

// 保持对window对象的全局引用，避免JavaScript对象被垃圾回收时window被关闭
let mainWindow
let tray

const isDevelopment = process.argv.includes('--development') || process.env.NODE_ENV === 'development'

function createWindow() {
  // 创建浏览器窗口
  const windowConfig = {
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    show: false,
    frame: true,
    titleBarStyle: 'default',
    backgroundColor: '#0a0e1a'
  }
  
  // 如果图标存在，则设置图标
  const iconPath = path.join(__dirname, '../resources/icon.png')
  if (require('fs').existsSync(iconPath)) {
    windowConfig.icon = iconPath
  }
  
  mainWindow = new BrowserWindow(windowConfig)

  // 加载应用
  if (isDevelopment) {
    // 开发环境：加载Vue开发服务器
    mainWindow.loadURL('http://localhost:8080')
    mainWindow.webContents.openDevTools()
  } else {
    // 生产环境：加载构建后的文件
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 关闭窗口时触发
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 外部链接用默认浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

function createTray() {
  const trayPath = path.join(__dirname, '../resources/tray.png')
  
  // 如果托盘图标存在，则创建托盘
  if (require('fs').existsSync(trayPath)) {
    tray = new Tray(trayPath)
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '打开主窗口',
        click: () => {
          if (mainWindow) {
            mainWindow.show()
            mainWindow.focus()
          }
        }
      },
      {
        label: '检查更新',
        click: () => {
          autoUpdater.checkForUpdatesAndNotify()
        }
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          app.quit()
        }
      }
    ])
    tray.setToolTip('MarketAI Pro')
    tray.setContextMenu(contextMenu)

    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    })
  } else {
    console.log('托盘图标不存在，跳过创建托盘')
  }
}

// Electron初始化完成后创建窗口
app.whenReady().then(() => {
  createWindow()
  createTray()
  
  // 启动时检查更新
  if (!isDevelopment) {
    autoUpdater.checkForUpdatesAndNotify()
  }
})

// 所有窗口关闭时退出应用（Windows/Linux）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 应用激活时（macOS）
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC通信处理
ipcMain.handle('app:getVersion', () => {
  return app.getVersion()
})

ipcMain.handle('app:minimize', () => {
  if (mainWindow) mainWindow.minimize()
})

ipcMain.handle('app:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.handle('app:close', () => {
  if (mainWindow) mainWindow.close()
})

ipcMain.handle('app:showNotification', (event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show()
  }
})

// 自动更新事件
autoUpdater.on('update-available', () => {
  mainWindow?.webContents.send('update:available')
})

autoUpdater.on('update-downloaded', () => {
  mainWindow?.webContents.send('update:downloaded')
})

// 安全策略
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (navigationEvent, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)
    if (parsedUrl.origin !== 'http://localhost:8080' && !navigationUrl.startsWith('file://')) {
      navigationEvent.preventDefault()
    }
  })
})
