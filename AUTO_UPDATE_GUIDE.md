# Electron 应用自动更新指南

## 📋 概述

本指南介绍如何为 Electron 应用实现自动更新功能，让用户无需手动下载安装包即可获取最新版本。

## 🔄 更新流程

```
用户安装 v1.0.0
    ↓
开发者发布 v1.1.0（上传新版本到服务器）
    ↓
应用启动时自动检查更新（读取 latest.yml）
    ↓
发现新版本，自动下载更新包
    ↓
提示用户安装更新
    ↓
应用重启，完成更新
```

## 🛠️ 实现步骤

### 1. 配置更新服务器

在 `electron-builder.yml` 中配置更新服务器地址：

```yaml
publish:
  provider: generic          # 使用自定义服务器
  url: https://your-server.com/updates/
  
# 或者使用 GitHub Releases
publish:
  provider: github
  owner: your-username
  repo: your-repo
```

### 2. 安装依赖

确保项目中已安装 `electron-updater`：

```bash
npm install electron-updater
```

### 3. 创建自动更新模块

本项目已创建 `src/main/updater.ts`，包含完整的自动更新功能。

#### 主要功能：

- ✅ 自动检查更新
- ✅ 自动下载更新
- ✅ 下载进度通知
- ✅ 提示用户安装
- ✅ 退出并安装更新

### 4. 在主进程中集成

在 `src/main/index.ts` 中导入并使用：

```typescript
import { updateManager } from './updater'

// 设置主窗口引用
if (mainWindow) {
  updateManager.setMainWindow(mainWindow)
}

// 应用启动后检查更新（延迟 5 秒）
setTimeout(() => {
  updateManager.checkForUpdates()
}, 5000)
```

### 5. 在 Preload 中暴露 API

在 `src/preload/index.ts` 中暴露更新相关 API：

```typescript
const electronAPI = {
  // ... 其他 API
  
  // 自动更新
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  downloadUpdate: () => ipcRenderer.send('download-update'),
  quitAndInstall: () => ipcRenderer.send('quit-and-install'),
  getCurrentVersion: () => ipcRenderer.invoke('get-current-version'),
  onUpdateStatus: (callback) => {
    ipcRenderer.on('update-status', (event, info) => callback(info))
  }
}
```

### 6. 在 React 中使用

在 `src/renderer/src/components/UpdateManager.tsx` 中创建更新管理组件：

```tsx
import UpdateManager from './components/UpdateManager'

function App() {
  return (
    <div className="app">
      <header className="header">
        <UpdateManager />
        {/* 其他内容 */}
      </header>
    </div>
  )
}
```

## 📦 发布新版本

### 1. 更新版本号

在 `package.json` 中更新版本号：

```json
{
  "version": "1.1.0"
}
```

### 2. 构建并打包

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

### 3. 上传文件到服务器

打包完成后，会生成以下文件：

```
dist/
├── electron-app-1.1.0-setup.exe          # Windows 安装包
├── electron-app-1.1.0-setup.exe.blockmap # 块映射文件
├── latest.yml                            # 版本信息文件
└── win-unpacked/                         # 解压后的应用
```

**需要上传的文件**：

1. `electron-app-1.1.0-setup.exe` - 完整安装包
2. `electron-app-1.1.0-setup.exe.blockmap` - 块映射文件（增量更新用）
3. `latest.yml` - 版本信息文件

### 4. 上传到更新服务器

将上述文件上传到配置的更新服务器地址：

```
https://your-server.com/updates/
├── electron-app-1.1.0-setup.exe
├── electron-app-1.1.0-setup.exe.blockmap
└── latest.yml
```

## 🔧 更新服务器配置

### 方案 1：自建服务器

使用 Node.js + Express 搭建简单的更新服务器：

```javascript
const express = require('express')
const path = require('path')
const app = express()

// 静态文件服务
app.use('/updates', express.static(path.join(__dirname, 'updates')))

// CORS 配置
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.listen(3000, () => {
  console.log('更新服务器运行在 http://localhost:3000')
})
```

### 方案 2：使用 GitHub Releases

```yaml
# electron-builder.yml
publish:
  provider: github
  owner: your-username
  repo: your-repo
  token: ${GITHUB_TOKEN}
```

### 方案 3：使用云存储

将更新文件上传到：
- 阿里云 OSS
- 腾讯云 COS
- AWS S3
- 七牛云

## 🎯 更新状态说明

| 状态 | 说明 | UI 显示 |
|------|------|---------|
| `checking` | 正在检查更新 | ⏳ 正在检查更新... |
| `available` | 发现可用更新 | 🆕 发现新版本 x.x.x |
| `not-available` | 没有可用更新 | ✅ 当前已是最新版本 |
| `downloading` | 正在下载更新 | 📥 下载中 xx.x% |
| `downloaded` | 更新已下载完成 | ✅ 更新已就绪 |
| `error` | 更新出错 | ❌ 更新失败: 错误信息 |

## 💡 最佳实践

### 1. 延迟检查更新

```typescript
// 应用启动后延迟 5 秒检查更新，避免影响启动速度
setTimeout(() => {
  updateManager.checkForUpdates()
}, 5000)
```

### 2. 静默下载

```typescript
// 自动下载更新，不打扰用户
autoUpdater.autoDownload = true
```

### 3. 退出时安装

```typescript
// 用户退出应用时自动安装更新
autoUpdater.autoInstallOnAppQuit = true
```

### 4. 增量更新

使用 `.blockmap` 文件实现增量更新，只下载变化的部分：

```yaml
# electron-builder.yml 会自动生成 blockmap 文件
# 用户更新时只下载差异部分，节省带宽
```

### 5. 错误处理

```typescript
autoUpdater.on('error', (error) => {
  console.error('更新错误:', error)
  // 显示友好的错误提示
  // 不要因为更新失败而影响应用正常使用
})
```

## 🔍 调试技巧

### 1. 开发环境跳过更新

```typescript
if (is.dev) {
  console.log('开发环境，跳过自动更新检查')
  return
}
```

### 2. 查看更新日志

```typescript
autoUpdater.on('checking-for-update', () => {
  console.log('正在检查更新...')
})

autoUpdater.on('update-available', (info) => {
  console.log('发现新版本:', info)
})

autoUpdater.on('update-not-available', (info) => {
  console.log('当前已是最新版本:', info)
})

autoUpdater.on('download-progress', (progress) => {
  console.log('下载进度:', progress)
})

autoUpdater.on('update-downloaded', (info) => {
  console.log('更新下载完成:', info)
})

autoUpdater.on('error', (error) => {
  console.error('更新错误:', error)
})
```

### 3. 测试更新流程

1. 构建 v1.0.0 并安装
2. 修改代码，更新版本号为 v1.1.0
3. 构建 v1.1.0 并上传到服务器
4. 打开 v1.0.0 应用，观察是否提示更新

## ⚠️ 常见问题

### Q1: 更新检查失败

**可能原因**：
- 更新服务器地址配置错误
- 服务器无法访问
- `latest.yml` 文件缺失或格式错误

**解决方法**：
- 检查 `electron-builder.yml` 中的 `publish.url`
- 确保服务器可以正常访问
- 检查 `latest.yml` 文件是否存在且格式正确

### Q2: 下载更新失败

**可能原因**：
- 网络问题
- 文件权限问题
- 磁盘空间不足

**解决方法**：
- 检查网络连接
- 确保应用有写入权限
- 检查磁盘空间

### Q3: 更新后应用无法启动

**可能原因**：
- 更新文件损坏
- 权限问题
- 依赖缺失

**解决方法**：
- 重新下载完整安装包
- 以管理员权限运行
- 检查依赖是否完整

### Q4: macOS 签名问题

**可能原因**：
- 应用未签名或签名无效
- 公证失败

**解决方法**：
- 确保使用有效的开发者证书
- 完成公证流程

## 📚 相关文档

- [electron-updater 文档](https://www.electron.build/auto-update)
- [electron-builder 发布配置](https://www.electron.build/publish)
- [GitHub Releases 配置](https://docs.github.com/en/repositories/releasing-projects-on-github)

## 🎓 培训讲解建议

在培训时可以：

1. **演示更新流程**
   - 展示如何检查更新
   - 展示下载进度
   - 展示安装更新

2. **讲解更新机制**
   - `latest.yml` 文件的作用
   - `.blockmap` 文件的作用
   - 增量更新原理

3. **演示服务器配置**
   - 如何上传更新文件
   - 如何配置更新地址
   - 如何测试更新功能

4. **讨论最佳实践**
   - 延迟检查更新
   - 静默下载
   - 错误处理

---

**💡 提示**：本项目的自动更新功能已经实现，你可以直接使用 `npm run build:win` 构建并上传到更新服务器进行测试！
