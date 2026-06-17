# Electron 培训演示项目

一个完整的 Electron 桌面应用开发培训演示项目，基于 **React + TypeScript + Electron-Vite** 构建。

## 🎯 培训目标

通过本项目，学员将掌握：
- ✅ Electron 双进程架构（主进程、渲染进程、预加载脚本）
- ✅ IPC 进程间通信机制
- ✅ 文件系统操作
- ✅ 窗口管理
- ✅ 本地数据持久化（electron-store）
- ✅ 系统功能调用（通知、对话框、系统信息）
- ✅ 菜单和托盘配置
- ✅ 项目打包与发布

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建打包
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## 📚 培训内容

### 概览标签页
- Electron 核心概念讲解
- 双进程架构图解
- 为什么选择 Electron

### IPC 通信标签页
- Ping 测试演示
- 消息对话框演示
- 外部链接打开演示
- **本项目使用 17 个 IPC 通道**（详见 [TRAINING_GUIDE.md](./TRAINING_GUIDE.md)）

### 文件操作标签页
- 打开文件对话框
- 读取文件内容
- 代码示例展示

### 窗口管理标签页
- 窗口控制按钮（最小化、最大化、关闭）
- 多窗口创建演示
- 窗口配置选项说明

### 本地存储标签页
- electron-store 数据增删改查
- 存储方案对比表
- 使用示例代码

### 系统功能标签页
- 系统信息获取演示
- 系统通知演示
- 应用路径获取演示

## 🔑 核心知识点

### 1. 安全配置
```typescript
const mainWindow = new BrowserWindow({
  webPreferences: {
    preload: join(__dirname, '../preload/index.js'),
    contextIsolation: true,  // ✅ 启用上下文隔离
    nodeIntegration: false   // ✅ 禁用 Node.js 集成
  }
})
```

### 2. IPC 通信模式
```typescript
// 主进程
ipcMain.handle('channel-name', async (_event, data) => {
  return result
})

// Preload
const api = {
  methodName: (data) => ipcRenderer.invoke('channel-name', data)
}

// 渲染进程
const result = await window.electronAPI.methodName(data)
```

### 3. 路由选择
推荐使用 **HashRouter**，避免打包后白屏问题。

## 📁 项目结构

```
electron-app/
├── src/
│   ├── main/                    # 主进程
│   │   └── index.ts            # 主进程入口（IPC、菜单、托盘）
│   ├── preload/                 # 预加载脚本
│   │   ├── index.ts            # Preload 入口（安全暴露 API）
│   │   └── index.d.ts          # 类型声明
│   └── renderer/               # 渲染进程
│       ├── src/
│       │   ├── App.tsx         # React 主组件
│       │   ├── global.d.ts    # 全局类型声明
│       │   └── assets/        # 静态资源
│       └── index.html          # HTML 入口
├── resources/                   # 应用资源（图标等）
├── electron-builder.yml        # 打包配置
└── package.json                # 项目配置
```

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

## 📦 技术栈

- **Electron**: 桌面应用框架
- **React**: UI 框架
- **TypeScript**: 类型安全
- **Electron-Vite**: 构建工具
- **Electron-Builder**: 打包工具
- **Electron-Store**: 本地存储

## 🎓 培训建议

### 讲授顺序
1. **概念讲解**（15分钟）- 展示概览标签页，讲解双进程架构
2. **代码演示**（30分钟）- 展示 IPC 通信、文件操作、窗口管理
3. **动手实践**（45分钟）- 让学员修改代码，尝试添加新功能
4. **总结答疑**（15分钟）- 回顾核心知识点，解答疑问

### 演示技巧
- 使用 F12 打开 DevTools 展示调试
- 逐步演示每个功能的代码实现
- 让学员观察主进程和渲染进程的日志
- 展示打包后的应用效果

## 📖 扩展学习

- [Electron 官方文档](https://www.electronjs.org/)
- [Electron-Vite 文档](https://cn.electron-vite.org/)
- [Electron Builder 文档](https://www.electron.build/)

## 📄 许可证

MIT License

---

**💡 提示：** 更详细的培训指南请查看 [TRAINING_GUIDE.md](./TRAINING_GUIDE.md)
