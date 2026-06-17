/*
 * @Author: mengtong
 * @Date: 2026-06-11 10:14:13
 * @LastEditors: mengtong
 * @LastEditTime: 2026-06-17 18:05:43
 * @Description: Electron 培训演示 - 主界面
 */

import { useState, useEffect } from 'react'
import './assets/main.css'
import electronLogo from './assets/icon.png'
import UpdateManager from './components/UpdateManager'

interface SystemInfo {
  platform: string
  arch: string
  nodeVersion: string
  electronVersion: string
  chromeVersion: string
  hostname: string
  cpus: number
  totalMemory: string
  freeMemory: string
}

interface StoreItem {
  key: string
  value: string
}

function App(): React.JSX.Element {
  // 状态管理
  const [fileContent, setFileContent] = useState<string>('')
  const [filePath, setFilePath] = useState<string>('')
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [storeKey, setStoreKey] = useState<string>('')
  const [storeValue, setStoreValue] = useState<string>('')
  const [storedItems, setStoredItems] = useState<StoreItem[]>([])
  const [storePath, setStorePath] = useState<string>('')
  const [notificationTitle, setNotificationTitle] = useState<string>('测试通知')
  const [notificationBody, setNotificationBody] = useState<string>('这是一条来自Electron的通知！')
  const [activeTab, setActiveTab] = useState<string>('overview')

  // 获取系统信息
  const handleGetSystemInfo = async (): Promise<void> => {
    const info = await window.electronAPI.getSystemInfo()
    setSystemInfo(info)
  }

  // 打开文件
  const handleOpenFile = async (): Promise<void> => {
    const filePaths = await window.electronAPI.openFile()
    if (filePaths && filePaths.length > 0) {
      setFilePath(filePaths[0])
      const content = await window.electronAPI.readFile(filePaths[0])
      setFileContent(content || '无法读取文件内容')
    }
  }

  // 窗口操作
  const handleMinimize = (): void => window.electronAPI.minimizeWindow()
  const handleMaximize = (): void => window.electronAPI.maximizeWindow()
  const handleClose = (): void => window.electronAPI.closeWindow()
  const handleNewWindow = (): void => window.electronAPI.openNewWindow()

  // 存储操作
  const handleStoreSet = async (): Promise<void> => {
    if (storeKey && storeValue) {
      await window.electronAPI.storeSet(storeKey, storeValue)
      await loadStoredItems()
      setStoreKey('')
      setStoreValue('')
    }
  }

  const handleStoreDelete = async (key: string): Promise<void> => {
    await window.electronAPI.storeDelete(key)
    await loadStoredItems()
  }

  const loadStoredItems = async (): Promise<void> => {
    const keys = ['theme', 'language', 'fontSize', 'lastOpenFile', 'userPreference']
    const items: StoreItem[] = []

    for (const key of keys) {
      const value = await window.electronAPI.storeGet(key)
      if (value !== undefined && value !== null) {
        items.push({ key, value: String(value) })
      }
    }

    setStoredItems(items)
  }

  // 获取存储路径
  const loadStorePath = async (): Promise<void> => {
    const path = await window.electronAPI.getStorePath()
    setStorePath(path)
  }

  // 通知
  const handleShowNotification = (): void => {
    window.electronAPI.showNotification(notificationTitle, notificationBody)
  }

  // 消息对话框
  const handleShowDialog = async (): Promise<void> => {
    const response = await window.electronAPI.showMessageBox({
      type: 'info',
      title: '确认操作',
      message: '这是一个 Electron 消息对话框演示',
      buttons: ['确定', '取消', '帮助']
    })
    console.log('用户点击了按钮:', response)
  }

  // 打开外部链接
  const handleOpenExternal = (url: string): void => {
    window.electronAPI.openExternal(url)
  }

  // Ping 测试
  const handlePing = (): void => {
    window.electronAPI.ping()
  }

  // 初始化
  useEffect(() => {
    handleGetSystemInfo()
    loadStoredItems()
    loadStorePath()
  }, [])

  // 标签页配置
  const tabs = [
    { id: 'overview', label: '概览', icon: '📋' },
    { id: 'ipc', label: 'IPC通信', icon: '🔗' },
    { id: 'file', label: '文件操作', icon: '📁' },
    { id: 'window', label: '窗口管理', icon: '🪟' },
    { id: 'storage', label: '本地存储', icon: '💾' },
    { id: 'system', label: '系统功能', icon: '⚙️' }
  ]

  return (
    <div className="app">
      {/* 头部 */}
      <header className="header">
        <div className="header-left">
          <img src={electronLogo} alt="Electron" className="logo" />
          <div>
            <h1>Electron 培训演示</h1>
            <p className="subtitle">React + TypeScript + Electron-Vite</p>
          </div>
        </div>
        <div className="header-right">
          <UpdateManager />
          <button onClick={handleMinimize} className="btn btn-sm" title="最小化">
            ➖
          </button>
          <button onClick={handleMaximize} className="btn btn-sm" title="最大化">
            ⬜
          </button>
          <button onClick={handleClose} className="btn btn-sm btn-danger" title="关闭">
            ❌
          </button>
        </div>
      </header>

      {/* 导航标签 */}
      <nav className="nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* 主内容区 */}
      <main className="main-content">
        {/* 概览标签页 */}
        {activeTab === 'overview' && (
          <div className="section">
            <h2>🎯 Electron 核心概念</h2>
            <div className="concept-grid">
              <div className="concept-card">
                <h3>🖥️ 主进程 (Main Process)</h3>
                <ul>
                  <li>唯一的一个进程</li>
                  <li>运行在 Node.js 环境</li>
                  <li>管理窗口生命周期</li>
                  <li>调用原生系统 API</li>
                  <li>不能操作 DOM</li>
                </ul>
              </div>
              <div className="concept-card">
                <h3>🎨 渲染进程 (Renderer Process)</h3>
                <ul>
                  <li>每个窗口一个进程</li>
                  <li>运行在 Chromium 环境</li>
                  <li>负责 UI 渲染</li>
                  <li>响应用户交互</li>
                  <li>可以操作 DOM</li>
                </ul>
              </div>
              <div className="concept-card">
                <h3>🔗 预加载脚本 (Preload)</h3>
                <ul>
                  <li>连接主进程和渲染进程</li>
                  <li>安全暴露 API</li>
                  <li>使用 contextBridge</li>
                  <li>最小权限原则</li>
                  <li>防止安全风险</li>
                </ul>
              </div>
              <div className="concept-card">
                <h3>📡 IPC 通信</h3>
                <ul>
                  <li>进程间通信机制</li>
                  <li>invoke/handle (双向)</li>
                  <li>send/on (单向)</li>
                  <li>异步通信</li>
                  <li>数据序列化</li>
                </ul>
              </div>
            </div>

            <div className="info-box">
              <h3>💡 为什么选择 Electron？</h3>
              <ul>
                <li>✅ 复用现有前端能力（React、Vue、TypeScript）</li>
                <li>✅ 跨平台支持（Windows、macOS、Linux）</li>
                <li>✅ 生态成熟（NPM 生态）</li>
                <li>✅ 渲染一致性（自带 Chromium）</li>
                <li>✅ 学习成本低（前端团队友好）</li>
              </ul>
            </div>
          </div>
        )}

        {/* IPC通信标签页 */}
        {activeTab === 'ipc' && (
          <div className="section">
            <h2>🔗 IPC 通信演示</h2>
            <p className="description">
              IPC (Inter-Process Communication) 是 Electron 中进程间通信的核心机制。 前端通过
              Preload 暴露的 API 与主进程进行安全通信。
            </p>

            <div className="demo-grid">
              <div className="demo-card">
                <h3>📡 Ping 测试</h3>
                <p>最简单的 IPC 通信示例，发送消息到主进程</p>
                <button onClick={handlePing} className="btn btn-primary">
                  发送 Ping
                </button>
                <pre className="code-block">
                  {`// 渲染进程
window.electronAPI.ping()

// Preload
ping: () => ipcRenderer.send('ping')

// 主进程
ipcMain.on('ping', () => {
  console.log('pong')
})`}
                </pre>
              </div>

              <div className="demo-card">
                <h3>💬 消息对话框</h3>
                <p>调用主进程显示原生对话框</p>
                <button onClick={handleShowDialog} className="btn btn-primary">
                  显示对话框
                </button>
                <pre className="code-block">
                  {`// 渲染进程
const response = await window.electronAPI
  .showMessageBox({
    type: 'info',
    title: '确认',
    message: '操作确认',
    buttons: ['确定', '取消']
  })

// 主进程
ipcMain.handle('show-message-box',
  async (_event, options) => {
    const result = await dialog
      .showMessageBox(options)
    return result.response
  })`}
                </pre>
              </div>

              <div className="demo-card">
                <h3>🔗 外部链接</h3>
                <p>在默认浏览器中打开链接</p>
                <div className="btn-group">
                  <button
                    onClick={() => handleOpenExternal('https://electron-vite.org')}
                    className="btn btn-primary"
                  >
                    Electron-Vite 文档
                  </button>
                  <button
                    onClick={() => handleOpenExternal('https://www.electronjs.org')}
                    className="btn btn-secondary"
                  >
                    Electron 官网
                  </button>
                </div>
                <pre className="code-block">
                  {`// 渲染进程
window.electronAPI.openExternal(url)

// 主进程
ipcMain.on('open-external', (_event, url) => {
  shell.openExternal(url)
})`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 文件操作标签页 */}
        {activeTab === 'file' && (
          <div className="section">
            <h2>📁 文件操作演示</h2>
            <p className="description">
              Electron 可以轻松访问本地文件系统，这是普通 Web 应用无法做到的。
            </p>

            <div className="demo-grid">
              <div className="demo-card">
                <h3>📂 打开文件</h3>
                <p>使用原生文件对话框选择文件</p>
                <button onClick={handleOpenFile} className="btn btn-primary">
                  选择文件
                </button>
                {filePath && (
                  <div className="file-info">
                    <strong>选中的文件：</strong>
                    <code>{filePath}</code>
                  </div>
                )}
              </div>

              {fileContent && (
                <div className="demo-card full-width">
                  <h3>📄 文件内容</h3>
                  <div className="file-content">
                    <pre>{fileContent}</pre>
                  </div>
                </div>
              )}

              <div className="demo-card full-width">
                <h3>💻 代码示例</h3>
                <pre className="code-block">
                  {`// ========== 主进程 (main.ts) ==========
import { ipcMain, dialog } from 'electron'
import { readFile } from 'fs/promises'

// 打开文件对话框
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: '文本文件', extensions: ['txt', 'md'] }
    ]
  })
  return result.canceled ? undefined : result.filePaths
})

// 读取文件内容
ipcMain.handle('read-file', async (_event, filePath) => {
  const content = await readFile(filePath, 'utf-8')
  return content
})

// ========== Preload (preload.ts) ==========
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file-dialog'),
  readFile: (path) => ipcRenderer.invoke('read-file', path)
})

// ========== 渲染进程 (React) ==========
const handleOpen = async () => {
  const paths = await window.electronAPI.openFile()
  if (paths?.length) {
    const content = await window.electronAPI.readFile(paths[0])
    console.log(content)
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 窗口管理标签页 */}
        {activeTab === 'window' && (
          <div className="section">
            <h2>🪟 窗口管理演示</h2>
            <p className="description">
              Electron 提供了强大的窗口管理能力，可以创建多个窗口、控制窗口状态。
            </p>

            <div className="demo-grid">
              <div className="demo-card">
                <h3>🎛️ 窗口控制</h3>
                <p>控制当前窗口的最小化、最大化和关闭</p>
                <div className="btn-group">
                  <button onClick={handleMinimize} className="btn btn-secondary">
                    最小化
                  </button>
                  <button onClick={handleMaximize} className="btn btn-secondary">
                    最大化/还原
                  </button>
                  <button onClick={handleClose} className="btn btn-danger">
                    关闭窗口
                  </button>
                </div>
              </div>

              <div className="demo-card">
                <h3>➕ 多窗口</h3>
                <p>创建新的子窗口</p>
                <button onClick={handleNewWindow} className="btn btn-primary">
                  打开新窗口
                </button>
                <pre className="code-block">
                  {`// 主进程
function createNewWindow() {
  const newWindow = new BrowserWindow({
    width: 600,
    height: 400,
    parent: mainWindow,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  newWindow.loadURL(url)
}

// 通过 IPC 触发
ipcMain.on('open-new-window', () => {
  createNewWindow()
})`}
                </pre>
              </div>

              <div className="demo-card full-width">
                <h3>📋 窗口配置选项</h3>
                <pre className="code-block">
                  {`const mainWindow = new BrowserWindow({
  width: 1200,              // 窗口宽度
  height: 800,              // 窗口高度
  minWidth: 800,            // 最小宽度
  minHeight: 600,           // 最小高度
  show: false,              // 创建后不立即显示
  frame: true,              // 是否显示边框
  transparent: false,       // 是否透明
  resizable: true,          // 是否可调整大小
  fullscreenable: true,     // 是否可全屏
  icon: 'path/to/icon.png', // 窗口图标
  webPreferences: {
    preload: '...',         // 预加载脚本
    contextIsolation: true, // 上下文隔离
    nodeIntegration: false, // Node.js 集成
    sandbox: false          // 沙箱模式
  }
})`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 本地存储标签页 */}
        {activeTab === 'storage' && (
          <div className="section">
            <h2>💾 本地存储演示</h2>
            <p className="description">
              Electron 提供了多种数据存储方案。这里演示使用 electron-store 进行持久化存储。
            </p>

            <div className="demo-grid">
              <div className="demo-card full-width">
                <h3>📁 存储文件位置</h3>
                <p>electron-store 将数据以 JSON 格式持久化到以下位置：</p>
                <div className="file-info">
                  <strong>当前应用的存储路径：</strong>
                  <code>{storePath || '加载中...'}</code>
                </div>
                <div className="info-box" style={{ marginTop: '16px' }}>
                  <h4>不同系统的默认存储位置：</h4>
                  <ul>
                    <li>
                      <strong>Windows：</strong>{' '}
                      C:\Users\&lt;用户名&gt;\AppData\Roaming\&lt;应用名&gt;\config.json
                    </li>
                    <li>
                      <strong>macOS：</strong> ~/Library/Application
                      Support/&lt;应用名&gt;/config.json
                    </li>
                    <li>
                      <strong>Linux：</strong> ~/.config/&lt;应用名&gt;/config.json
                    </li>
                  </ul>
                </div>
              </div>

              <div className="demo-card">
                <h3>➕ 添加数据</h3>
                <div className="form-group">
                  <label>键名：</label>
                  <input
                    type="text"
                    value={storeKey}
                    onChange={(e) => setStoreKey(e.target.value)}
                    placeholder="例如: theme"
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label>值：</label>
                  <input
                    type="text"
                    value={storeValue}
                    onChange={(e) => setStoreValue(e.target.value)}
                    placeholder="例如: dark"
                    className="input"
                  />
                </div>
                <button onClick={handleStoreSet} className="btn btn-primary">
                  保存数据
                </button>
              </div>

              <div className="demo-card">
                <h3>📋 已存储的数据</h3>
                {storedItems.length === 0 ? (
                  <p className="empty-text">暂无数据，请先添加一些数据</p>
                ) : (
                  <div className="store-list">
                    {storedItems.map((item) => (
                      <div key={item.key} className="store-item">
                        <div className="store-item-content">
                          <strong>{item.key}：</strong>
                          <span>{item.value}</span>
                        </div>
                        <button
                          onClick={() => handleStoreDelete(item.key)}
                          className="btn btn-sm btn-danger"
                        >
                          删除
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="demo-card full-width">
                <h3>📊 存储方案对比</h3>
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>方案</th>
                      <th>适用场景</th>
                      <th>持久化</th>
                      <th>跨窗口</th>
                      <th>容量</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>React State</td>
                      <td>页面临时状态</td>
                      <td>❌</td>
                      <td>❌</td>
                      <td>内存</td>
                    </tr>
                    <tr>
                      <td>sessionStorage</td>
                      <td>会话级数据</td>
                      <td>❌</td>
                      <td>❌</td>
                      <td>5-10MB</td>
                    </tr>
                    <tr>
                      <td>localStorage</td>
                      <td>简单持久化</td>
                      <td>✅</td>
                      <td>✅</td>
                      <td>5-10MB</td>
                    </tr>
                    <tr>
                      <td>electron-store</td>
                      <td>配置和偏好</td>
                      <td>✅</td>
                      <td>✅</td>
                      <td>无限制</td>
                    </tr>
                    <tr>
                      <td>SQLite</td>
                      <td>复杂数据查询</td>
                      <td>✅</td>
                      <td>✅</td>
                      <td>无限制</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="demo-card full-width">
                <h3>💻 electron-store 使用示例</h3>
                <pre className="code-block">
                  {`// 安装
npm install electron-store

// 主进程
import Store from 'electron-store'
const store = new Store()

// 设置值
store.set('theme', 'dark')
store.set('fontSize', 14)
store.set('user.name', '张三')

// 获取值
const theme = store.get('theme')  // 'dark'
const name = store.get('user.name')  // '张三'

// 删除值
store.delete('theme')

// 通过 IPC 暴露给渲染进程
ipcMain.handle('store-get', (_event, key) => {
  return store.get(key)
})

ipcMain.handle('store-set', (_event, key, value) => {
  store.set(key, value)
})`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 系统功能标签页 */}
        {activeTab === 'system' && (
          <div className="section">
            <h2>⚙️ 系统功能演示</h2>
            <p className="description">Electron 可以访问系统级功能，如系统信息、通知、路径等。</p>

            <div className="demo-grid">
              <div className="demo-card">
                <h3>💻 系统信息</h3>
                <button onClick={handleGetSystemInfo} className="btn btn-primary">
                  刷新系统信息
                </button>
                {systemInfo && (
                  <div className="system-info">
                    <div className="info-item">
                      <span className="info-label">操作系统：</span>
                      <span className="info-value">
                        {systemInfo.platform} ({systemInfo.arch})
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">主机名：</span>
                      <span className="info-value">{systemInfo.hostname}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">CPU 核心数：</span>
                      <span className="info-value">{systemInfo.cpus}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">总内存：</span>
                      <span className="info-value">{systemInfo.totalMemory}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">可用内存：</span>
                      <span className="info-value">{systemInfo.freeMemory}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Node.js：</span>
                      <span className="info-value">v{systemInfo.nodeVersion}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Electron：</span>
                      <span className="info-value">v{systemInfo.electronVersion}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Chrome：</span>
                      <span className="info-value">v{systemInfo.chromeVersion}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="demo-card">
                <h3>🔔 系统通知</h3>
                <div className="form-group">
                  <label>标题：</label>
                  <input
                    type="text"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label>内容：</label>
                  <input
                    type="text"
                    value={notificationBody}
                    onChange={(e) => setNotificationBody(e.target.value)}
                    className="input"
                  />
                </div>
                <button onClick={handleShowNotification} className="btn btn-primary">
                  显示通知
                </button>
              </div>

              <div className="demo-card full-width">
                <h3>💻 系统信息获取代码示例</h3>
                <pre className="code-block">
                  {`// 主进程
import { app } from 'electron'
import os from 'os'

ipcMain.handle('get-system-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.versions.node,
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome,
    hostname: os.hostname(),
    cpus: os.cpus().length,
    totalMemory: (os.totalmem() / 1024 / 1024 / 1024)
      .toFixed(2) + ' GB',
    freeMemory: (os.freemem() / 1024 / 1024 / 1024)
      .toFixed(2) + ' GB'
  }
})

// 获取应用路径
ipcMain.handle('get-app-path', () => {
  return app.getAppPath()
})

ipcMain.handle('get-path', (_event, name) => {
  return app.getPath(name)
  // name: 'home', 'appData', 'desktop',
  //       'documents', 'downloads', 'music',
  //       'pictures', 'videos', 'temp' 等
})`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 底部状态栏 */}
      <footer className="footer">
        <div className="footer-left">
          <span>Electron 培训演示 v1.0.0</span>
        </div>
        <div className="footer-right">
          <button onClick={handlePing} className="btn btn-sm">
            Ping 测试
          </button>
          <button
            onClick={() => handleOpenExternal('https://electron-vite.org')}
            className="btn btn-sm"
          >
            文档
          </button>
        </div>
      </footer>
    </div>
  )
}

export default App
