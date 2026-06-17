/*
 * @Author: mengtong
 * @Date: 2026-06-11 10:14:13
 * @LastEditors: mengtong
 * @LastEditTime: 2026-06-17 17:00:00
 * @Description: Electron 主进程 - 培训演示
 */

import { app, shell, BrowserWindow, ipcMain, dialog, Menu, Tray, Notification } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { updateManager } from './updater'

// 动态导入 electron-store（ESM 模块）
let store: any = null

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function initStore() {
  const Store = (await import('electron-store')).default
  store = new Store()
  return store
}

// 系统托盘变量
let tray: Tray | null = null

// 主窗口变量
let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  // 创建浏览器窗口 - 演示窗口配置
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: false, // 显示菜单栏
    icon: icon, // 设置窗口图标（所有平台）
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true, // 安全：启用上下文隔离
      nodeIntegration: false // 安全：禁用 Node.js 集成
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  // 处理外部链接打开
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 加载页面
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 创建应用菜单 - 演示菜单配置
function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        {
          label: '打开文件',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            if (mainWindow) {
              const result = await dialog.showOpenDialog(mainWindow, {
                properties: ['openFile'],
                filters: [
                  { name: '文本文件', extensions: ['txt', 'md', 'json'] },
                  { name: '所有文件', extensions: ['*'] }
                ]
              })
              if (!result.canceled && result.filePaths.length > 0) {
                mainWindow.webContents.send('file-selected', result.filePaths[0])
              }
            }
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '刷新' },
        { role: 'forceReload', label: '强制刷新' },
        { role: 'toggleDevTools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '重置缩放' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' }
      ]
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize', label: '最小化' },
        { role: 'zoom', label: '缩放' },
        { type: 'separator' },
        {
          label: '打开新窗口',
          click: () => createNewWindow()
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: '关于',
              message: 'Electron 培训演示应用',
              detail: `版本: 1.0.0\nElectron: ${process.versions.electron}\nNode.js: ${process.versions.node}\nChrome: ${process.versions.chrome}`
            })
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// 创建系统托盘 - 演示托盘功能
function createTray(): void {
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    {
      label: '打开新窗口',
      click: () => createNewWindow()
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => app.quit()
    }
  ])

  tray.setToolTip('Electron 培训演示')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

// 创建新窗口 - 演示多窗口管理
function createNewWindow(): void {
  const newWindow = new BrowserWindow({
    width: 600,
    height: 400,
    parent: mainWindow || undefined,
    modal: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  newWindow.on('ready-to-show', () => {
    newWindow.show()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    newWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#/child')
  } else {
    newWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: '/child'
    })
  }
}

// 应用准备就绪
app.whenReady().then(async () => {
  // 初始化 electron-store
  await initStore()

  // 设置应用用户模型 ID
  electronApp.setAppUserModelId('com.electron.training-demo')

  // 默认开发环境按 F12 打开 DevTools
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // ========== IPC 通信示例 ==========

  // 示例1：简单 ping 测试
  ipcMain.on('ping', () => {
    console.log('pong')
  })

  // 示例2：打开文件对话框
  ipcMain.handle('open-file-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: '文本文件', extensions: ['txt', 'md', 'json'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    })
    return result.canceled ? undefined : result.filePaths
  })

  // 示例3：读取文件内容
  ipcMain.handle('read-file', async (_event, filePath: string) => {
    const fs = require('fs').promises
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return content
    } catch (error) {
      console.error('读取文件失败:', error)
      return null
    }
  })

  // 示例4：获取系统信息
  ipcMain.handle('get-system-info', () => {
    const os = require('os')
    return {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.versions.node,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      hostname: os.hostname(),
      cpus: os.cpus().length,
      totalMemory: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + ' GB',
      freeMemory: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + ' GB'
    }
  })

  // 示例5：窗口操作
  ipcMain.on('minimize-window', () => {
    mainWindow?.minimize()
  })

  ipcMain.on('maximize-window', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.on('close-window', () => {
    mainWindow?.close()
  })

  ipcMain.on('open-new-window', () => {
    createNewWindow()
  })

  // 示例6：本地存储操作 (electron-store)
  ipcMain.handle('store-get', async (_event, key: string) => {
    return store.get(key)
  })

  ipcMain.handle('store-set', async (_event, key: string, value: any) => {
    store.set(key, value)
  })

  ipcMain.handle('store-delete', async (_event, key: string) => {
    store.delete(key)
  })

  // 获取 electron-store 存储路径
  ipcMain.handle('get-store-path', () => {
    return store.path
  })

  // 示例7：显示通知
  ipcMain.on('show-notification', (_event, title: string, body: string) => {
    new Notification({ title, body }).show()
  })

  // 示例8：显示消息对话框
  ipcMain.handle('show-message-box', async (_event, options) => {
    const result = await dialog.showMessageBox(mainWindow!, {
      type: options.type as any,
      title: options.title,
      message: options.message,
      buttons: options.buttons
    })
    return result.response
  })

  // 示例9：打开外部链接
  ipcMain.on('open-external', (_event, url: string) => {
    shell.openExternal(url)
  })

  // 示例10：获取应用路径
  ipcMain.handle('get-app-path', () => {
    return app.getAppPath()
  })

  ipcMain.handle('get-path', (_event, name: string) => {
    return app.getPath(name as any)
  })

  // ========== 自动更新 IPC ==========

  // 检查更新
  ipcMain.on('check-for-updates', () => {
    updateManager.checkForUpdates()
  })

  // 下载更新
  ipcMain.on('download-update', () => {
    updateManager.downloadUpdate()
  })

  // 退出并安装更新
  ipcMain.on('quit-and-install', () => {
    updateManager.quitAndInstall()
  })

  // 获取当前版本
  ipcMain.handle('get-current-version', () => {
    return updateManager.getCurrentVersion()
  })

  // 创建窗口、菜单、托盘
  createWindow()
  createMenu()
  createTray()

  // 设置主窗口引用到更新管理器
  if (mainWindow) {
    updateManager.setMainWindow(mainWindow)
  }

  // 应用启动后检查更新（延迟 5 秒，避免影响启动速度）
  setTimeout(() => {
    updateManager.checkForUpdates()
  }, 5000)

  // macOS: 点击 dock 图标时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 所有窗口关闭时退出（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
