/*
 * @Author: mengtong
 * @Date: 2026-06-11 10:14:13
 * @LastEditors: mengtong
 * @LastEditTime: 2026-06-17 22:42:30
 * @Description: Preload 脚本 - 安全暴露 API 给渲染进程
 *
 * 重要安全原则：
 * 1. 只暴露必要的最小 API
 * 2. 使用 contextBridge 进行安全隔离
 * 3. 不要直接暴露 ipcRenderer
 */

import { contextBridge, ipcRenderer } from 'electron'

// 定义要暴露给渲染进程的 API
const electronAPI = {
  // ========== 文件操作 ==========

  // 打开文件对话框
  openFile: () => ipcRenderer.invoke('open-file-dialog'),

  // 读取文件内容
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),

  // ========== 系统信息 ==========

  // 获取系统信息
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

  // ========== 窗口操作 ==========

  // 最小化窗口
  minimizeWindow: () => ipcRenderer.send('minimize-window'),

  // 最大化/还原窗口
  maximizeWindow: () => ipcRenderer.send('maximize-window'),

  // 关闭窗口
  closeWindow: () => ipcRenderer.send('close-window'),

  // 打开新窗口
  openNewWindow: () => ipcRenderer.send('open-new-window'),

  // ========== 本地存储 (electron-store) ==========

  // 获取存储的值
  storeGet: (key: string) => ipcRenderer.invoke('store-get', key),

  // 设置存储的值
  storeSet: (key: string, value: any) => ipcRenderer.invoke('store-set', key, value),

  // 删除存储的值
  storeDelete: (key: string) => ipcRenderer.invoke('store-delete', key),

  // 获取存储文件路径
  getStorePath: () => ipcRenderer.invoke('get-store-path'),

  // ========== 通知 ==========

  // 显示系统通知
  showNotification: (title: string, body: string) =>
    ipcRenderer.send('show-notification', title, body),

  // ========== 对话框 ==========

  // 显示消息对话框
  showMessageBox: (options: { type: string; title: string; message: string; buttons: string[] }) =>
    ipcRenderer.invoke('show-message-box', options),

  // ========== 外部链接 ==========

  // 打开外部链接
  openExternal: (url: string) => ipcRenderer.send('open-external', url),

  // ========== 应用路径 ==========

  // 获取应用路径
  getAppPath: () => ipcRenderer.invoke('get-app-path'),

  // 获取系统路径
  getPath: (name: string) => ipcRenderer.invoke('get-path', name),

  // ========== 自动更新 ==========

  // 检查更新
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),

  // 下载更新
  downloadUpdate: () => ipcRenderer.send('download-update'),

  // 退出并安装更新
  quitAndInstall: () => ipcRenderer.send('quit-and-install'),

  // 获取当前版本
  getCurrentVersion: () => ipcRenderer.invoke('get-current-version'),

  // 监听更新状态
  onUpdateStatus: (callback: (info: any) => void) => {
    ipcRenderer.on('update-status', (_event, info) => callback(info))
  },

  // ========== 通信测试 ==========

  // Ping 测试
  ping: () => ipcRenderer.send('ping'),

  // 监听主进程消息
  onFileSelected: (callback: (filePath: string) => void) => {
    ipcRenderer.on('file-selected', (_event, filePath) => callback(filePath))
  }
}

// 使用 contextBridge 安全暴露 API
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  } catch (error) {
    console.error('Failed to expose electronAPI:', error)
  }
} else {
  // 降级处理（不推荐）
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.electronAPI = electronAPI
}
