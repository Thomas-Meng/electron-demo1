# Electron 培训演示项目

## 📋 项目简介

这是一个完整的 Electron 培训演示项目，基于 **React + TypeScript + Electron-Vite** 构建，涵盖了 Electron 开发的核心知识点。

## 🎯 培训目标

通过本项目，学员将掌握：
- Electron 双进程架构（主进程、渲染进程、预加载脚本）
- IPC 进程间通信机制
- 文件系统操作
- 窗口管理
- 本地数据持久化（electron-store）
- 系统功能调用（通知、对话框、系统信息）
- 菜单和托盘配置
- 项目打包与发布

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 构建打包
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## 📚 培训内容大纲

### 第一部分：核心概念（概览标签页）
- **主进程 (Main Process)**
  - 唯一的一个进程
  - 运行在 Node.js 环境
  - 管理窗口生命周期
  - 调用原生系统 API

- **渲染进程 (Renderer Process)**
  - 每个窗口一个进程
  - 运行在 Chromium 环境
  - 负责 UI 渲染
  - 响应用户交互

- **预加载脚本 (Preload)**
  - 连接主进程和渲染进程
  - 安全暴露 API
  - 使用 contextBridge
  - 最小权限原则

- **IPC 通信**
  - 进程间通信机制
  - invoke/handle (双向)
  - send/on (单向)

### 第二部分：IPC 通信演示（IPC通信标签页）
- **Ping 测试**：最简单的 IPC 通信
- **消息对话框**：调用主进程显示原生对话框
- **外部链接**：在默认浏览器中打开链接

#### 本项目中使用的 IPC 功能清单（共 17 个）

##### 📁 文件操作类（2 个）

| IPC 通道 | 通信方式 | 功能说明 | 使用场景 |
|---------|---------|---------|---------|
| `open-file-dialog` | invoke/handle | 打开文件对话框 | 选择本地文件 |
| `read-file` | invoke/handle | 读取文件内容 | 显示文件内容 |

**代码示例**：
```typescript
// 渲染进程调用
const handleOpenFile = async () => {
  const filePaths = await window.electronAPI.openFile()
  if (filePaths?.length) {
    const content = await window.electronAPI.readFile(filePaths[0])
    console.log('文件内容:', content)
  }
}
```

##### 💻 系统信息类（3 个）

| IPC 通道 | 通信方式 | 功能说明 | 使用场景 |
|---------|---------|---------|---------|
| `get-system-info` | invoke/handle | 获取系统信息 | 显示系统版本、CPU、内存等 |
| `get-app-path` | invoke/handle | 获取应用路径 | 获取应用安装目录 |
| `get-path` | invoke/handle | 获取系统路径 | 获取桌面、文档、下载等目录 |

**代码示例**：
```typescript
// 渲染进程调用
const handleGetSystemInfo = async () => {
  const info = await window.electronAPI.getSystemInfo()
  console.log('系统:', info.platform)
  console.log('CPU:', info.cpus)
  console.log('内存:', info.totalMemory)
}

const handleGetPaths = async () => {
  const appPath = await window.electronAPI.getAppPath()
  const desktopPath = await window.electronAPI.getPath('desktop')
  console.log('应用路径:', appPath)
  console.log('桌面路径:', desktopPath)
}
```

##### 🪟 窗口管理类（4 个）

| IPC 通道 | 通信方式 | 功能说明 | 使用场景 |
|---------|---------|---------|---------|
| `minimize-window` | send/on | 最小化窗口 | 点击最小化按钮 |
| `maximize-window` | send/on | 最大化/还原窗口 | 点击最大化按钮 |
| `close-window` | send/on | 关闭窗口 | 点击关闭按钮 |
| `open-new-window` | send/on | 打开新窗口 | 多窗口功能 |

**代码示例**：
```typescript
// 渲染进程调用
const handleMinimize = () => window.electronAPI.minimizeWindow()
const handleMaximize = () => window.electronAPI.maximizeWindow()
const handleClose = () => window.electronAPI.closeWindow()
const handleNewWindow = () => window.electronAPI.openNewWindow()
```

##### 💾 本地存储类（4 个）

| IPC 通道 | 通信方式 | 功能说明 | 使用场景 |
|---------|---------|---------|---------|
| `store-get` | invoke/handle | 获取存储的值 | 读取用户配置 |
| `store-set` | invoke/handle | 设置存储的值 | 保存用户配置 |
| `store-delete` | invoke/handle | 删除存储的值 | 清除配置 |
| `get-store-path` | invoke/handle | 获取存储路径 | 显示配置文件位置 |

**代码示例**：
```typescript
// 渲染进程调用
const handleSaveConfig = async () => {
  await window.electronAPI.storeSet('theme', 'dark')
  await window.electronAPI.storeSet('fontSize', 14)
}

const handleLoadConfig = async () => {
  const theme = await window.electronAPI.storeGet('theme')
  const fontSize = await window.electronAPI.storeGet('fontSize')
  console.log('主题:', theme)
  console.log('字号:', fontSize)
}

const handleDeleteConfig = async () => {
  await window.electronAPI.storeDelete('theme')
}

const handleGetStorePath = async () => {
  const path = await window.electronAPI.getStorePath()
  console.log('配置文件路径:', path)
}
```

##### 🔔 系统交互类（3 个）

| IPC 通道 | 通信方式 | 功能说明 | 使用场景 |
|---------|---------|---------|---------|
| `show-notification` | send/on | 显示系统通知 | 推送消息给用户 |
| `show-message-box` | invoke/handle | 显示消息对话框 | 确认操作、提示信息 |
| `open-external` | send/on | 打开外部链接 | 用默认浏览器打开网址 |

**代码示例**：
```typescript
// 渲染进程调用
const handleShowNotification = () => {
  window.electronAPI.showNotification('标题', '这是一条通知')
}

const handleShowDialog = async () => {
  const response = await window.electronAPI.showMessageBox({
    type: 'info',
    title: '确认',
    message: '确定要删除吗？',
    buttons: ['确定', '取消']
  })
  if (response === 0) {
    console.log('用户点击了确定')
  }
}

const handleOpenLink = () => {
  window.electronAPI.openExternal('https://electron-vite.org')
}
```

##### 🧪 测试类（1 个）

| IPC 通道 | 通信方式 | 功能说明 | 使用场景 |
|---------|---------|---------|---------|
| `ping` | send/on | Ping 测试 | 测试 IPC 通信是否正常 |

**代码示例**：
```typescript
// 渲染进程调用
const handlePing = () => {
  window.electronAPI.ping()
  // 主进程会在控制台输出 "pong"
}
```

##### 📊 IPC 功能统计

```
总计：17 个 IPC 通道

通信方式分布：
├── invoke/handle（双向）：10 个
│   ├── 文件操作：2 个
│   ├── 系统信息：3 个
│   └── 本地存储：4 个
│
└── send/on（单向）：7 个
    ├── 窗口管理：4 个
    ├── 系统交互：2 个
    └── 测试：1 个
```

##### 📁 IPC 代码组织结构

```
src/main/index.ts（主进程）
├── 文件操作 IPC（第 229-249 行）
├── 系统信息 IPC（第 253-267 行）
├── 窗口管理 IPC（第 269-287 行）
├── 本地存储 IPC（第 290-305 行）
└── 系统交互 IPC（第 308-335 行）

src/preload/index.ts（预加载脚本）
├── 文件操作 API（第 21-24 行）
├── 系统信息 API（第 29 行）
├── 窗口管理 API（第 34-43 行）
├── 本地存储 API（第 48-57 行）
└── 系统交互 API（第 63-91 行）
```

### 第三部分：文件操作（文件操作标签页）
- **打开文件对话框**：使用原生文件选择器
- **读取文件内容**：访问本地文件系统
- **文件路径处理**：获取和处理文件路径

### 第四部分：窗口管理（窗口管理标签页）
- **窗口控制**：最小化、最大化、关闭
- **多窗口管理**：创建和管理多个窗口
- **窗口配置选项**：各种窗口属性设置

### 第五部分：本地存储（本地存储标签页）
- **electron-store 使用**：持久化配置数据
- **存储方案对比**：不同存储方案的适用场景
- **数据增删改查**：完整的存储操作演示

### 第六部分：系统功能（系统功能标签页）
- **系统信息获取**：操作系统、CPU、内存等
- **系统通知**：显示原生通知
- **应用路径**：获取各种系统路径

## 🔑 核心知识点详解

### 1. 安全配置（重要！）

```typescript
// 主进程窗口配置
const mainWindow = new BrowserWindow({
  webPreferences: {
    preload: join(__dirname, '../preload/index.js'),
    contextIsolation: true,  // ✅ 启用上下文隔离
    nodeIntegration: false   // ✅ 禁用 Node.js 集成
  }
})
```

**安全原则：**
- 渲染进程不要直接开放全部 Node.js 能力
- 主进程负责文件、窗口、系统 API 等桌面能力
- preload 只暴露"够用的最小 API"
- 页面需要什么能力，就定向暴露什么能力

### 2. IPC 通信模式

#### 双向通信（推荐）
```typescript
// 主进程
ipcMain.handle('channel-name', async (_event, data) => {
  // 处理逻辑
  return result
})

// Preload
const api = {
  methodName: (data) => ipcRenderer.invoke('channel-name', data)
}

// 渲染进程
const result = await window.electronAPI.methodName(data)
```

#### 单向通信
```typescript
// 主进程
ipcMain.on('channel-name', (_event, data) => {
  // 处理逻辑
})

// Preload
const api = {
  methodName: (data) => ipcRenderer.send('channel-name', data)
}

// 渲染进程
window.electronAPI.methodName(data)
```

### 3. 路由选择

**推荐使用 HashRouter**（本项目已配置）

```tsx
// ❌ 不推荐
<BrowserRouter>
  <App />
</BrowserRouter>

// ✅ 推荐
<HashRouter>
  <App />
</HashRouter>
```

**原因：**
- 打包后的 Electron 加载的是本地 `file://.../index.html`
- BrowserRouter 刷新后本地系统无法重定向回 index.html
- HashRouter 使用 hash 路由，不存在这个问题

### 4. TypeScript 类型声明

```typescript
// src/renderer/src/global.d.ts
export interface IElectronAPI {
  openFile: () => Promise<string[] | undefined>
  readFile: (filePath: string) => Promise<string>
  getSystemInfo: () => Promise<SystemInfo>
  // ... 其他方法
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
```

### 5. 本地存储方案对比

| 方案 | 适用场景 | 持久化 | 跨窗口 | 容量 |
|------|----------|--------|--------|------|
| React State | 页面临时状态 | ❌ | ❌ | 内存 |
| sessionStorage | 会话级数据 | ❌ | ❌ | 5-10MB |
| localStorage | 简单持久化 | ✅ | ✅ | 5-10MB |
| **electron-store** | **配置和偏好** | ✅ | ✅ | 无限制 |
| SQLite | 复杂数据查询 | ✅ | ✅ | 无限制 |

## 📁 项目结构

```
electron-app/
├── src/
│   ├── main/                    # 主进程
│   │   └── index.ts            # 主进程入口
│   ├── preload/                 # 预加载脚本
│   │   ├── index.ts            # Preload 入口
│   │   └── index.d.ts          # 类型声明
│   └── renderer/               # 渲染进程
│       ├── src/
│       │   ├── App.tsx         # React 主组件
│       │   ├── global.d.ts    # 全局类型声明
│       │   └── assets/        # 静态资源
│       └── index.html          # HTML 入口
├── resources/                   # 应用资源
├── electron-builder.yml        # 打包配置
└── package.json                # 项目配置
```

## 🎨 界面功能

### 概览标签页
- 展示 Electron 核心概念
- 双进程架构说明
- 为什么选择 Electron

### IPC 通信标签页
- Ping 测试演示
- 消息对话框演示
- 外部链接打开演示

### 文件操作标签页
- 打开文件对话框
- 读取文件内容
- 代码示例展示

### 窗口管理标签页
- 窗口控制按钮
- 多窗口创建
- 窗口配置选项

### 本地存储标签页
- 数据增删改查
- 存储方案对比表
- electron-store 使用示例

### 系统功能标签页
- 系统信息展示
- 系统通知演示
- 应用路径获取

## ⚠️ 常见问题与避坑指南

### 1. 路由用错，打包后白屏
**问题：** 使用 BrowserRouter，打包后刷新白屏
**解决：** 使用 HashRouter

### 2. 把 Node 能力直接暴露给前端
**问题：** 为了省事把所有能力挂到 window
**解决：** 用 preload 做最小暴露

### 3. 主进程和渲染进程职责混乱
**问题：** 页面交互在主进程，文件操作在渲染进程
**解决：** 页面交互在渲染进程，文件、窗口、系统 API 在主进程

### 4. 开发环境正常，打包后异常
**问题：** 资源路径、路由模式、preload 路径有问题
**解决：** 打包后一定要单独验证

### 5. 跨平台打包限制
**问题：** Windows 无法打包 macOS 的 .dmg
**解决：** 使用 CI/CD 或准备两台不同系统的电脑

## 📦 依赖说明

### 核心依赖
- `electron`: Electron 框架
- `react` / `react-dom`: React 框架
- `typescript`: TypeScript 支持
- `electron-vite`: 构建工具
- `electron-builder`: 打包工具
- `electron-store`: 本地存储

### 开发依赖
- `@vitejs/plugin-react`: Vite React 插件
- `eslint`: 代码检查
- `prettier`: 代码格式化

## 🎓 培训建议

### 讲授顺序
1. **概念讲解**（15分钟）
   - 展示概览标签页
   - 讲解双进程架构
   - 说明安全原则

2. **代码演示**（30分钟）
   - 展示 IPC 通信
   - 演示文件操作
   - 演示窗口管理

3. **动手实践**（45分钟）
   - 让学员修改代码
   - 尝试添加新功能
   - 解决实际问题

4. **总结答疑**（15分钟）
   - 回顾核心知识点
   - 解答学员疑问
   - 讨论实际应用场景

### 演示技巧
- 使用 F12 打开 DevTools 展示调试
- 逐步演示每个功能的代码实现
- 让学员观察主进程和渲染进程的日志
- 展示打包后的应用效果

## 📖 扩展学习

### 官方文档
- [Electron 官方文档](https://www.electronjs.org/)
- [Electron-Vite 文档](https://cn.electron-vite.org/)
- [Electron Builder 文档](https://www.electron.build/)

### 推荐资源
- [Electron 应用示例](https://www.electronjs.org/apps)
- [Awesome Electron](https://github.com/sindresorhus/awesome-electron)
- [Electron API 演示](https://github.com/nicedoc/electron-api-demos)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
