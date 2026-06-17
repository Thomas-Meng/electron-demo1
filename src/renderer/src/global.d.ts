/*
 * @Author: mengtong
 * @Date: 2026-06-17 16:55:00
 * @LastEditors: mengtong
 * @LastEditTime: 2026-06-17 16:55:00
 * @Description: Electron API 类型声明 - 培训演示
 */

export interface IElectronAPI {
  // 文件操作
  openFile: () => Promise<string[] | undefined>
  readFile: (filePath: string) => Promise<string>

  // 系统信息
  getSystemInfo: () => Promise<{
    platform: string
    arch: string
    nodeVersion: string
    electronVersion: string
    chromeVersion: string
    hostname: string
    cpus: number
    totalMemory: string
    freeMemory: string
  }>

  // 窗口操作
  openNewWindow: () => void
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void

  // 本地存储
  storeGet: (key: string) => Promise<any>
  storeSet: (key: string, value: any) => Promise<void>
  storeDelete: (key: string) => Promise<void>
  getStorePath: () => Promise<string>

  // 通知
  showNotification: (title: string, body: string) => void

  // 对话框
  showMessageBox: (options: {
    type: string
    title: string
    message: string
    buttons: string[]
  }) => Promise<number>

  // 打开外部链接
  openExternal: (url: string) => void

  // 获取应用路径
  getAppPath: () => Promise<string>
  getPath: (name: string) => Promise<string>

  // 自动更新
  checkForUpdates: () => void
  downloadUpdate: () => void
  quitAndInstall: () => void
  getCurrentVersion: () => Promise<string>
  onUpdateStatus: (callback: (info: {
    status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
    version?: string
    releaseDate?: string
    releaseNotes?: string
    progress?: number
    error?: string
  }) => void) => void

  // ping 测试
  ping: () => void
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
