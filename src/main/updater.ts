/*
 * @Author: mengtong
 * @Date: 2026-06-17
 * @Description: Electron 自动更新模块
 */

import { autoUpdater } from 'electron-updater'
import { BrowserWindow, dialog } from 'electron'
import { is } from '@electron-toolkit/utils'

// 更新状态枚举
export enum UpdateStatus {
  CHECKING = 'checking',
  AVAILABLE = 'available',
  NOT_AVAILABLE = 'not-available',
  DOWNLOADING = 'downloading',
  DOWNLOADED = 'downloaded',
  ERROR = 'error'
}

// 更新信息接口
export interface UpdateInfo {
  status: UpdateStatus
  version?: string
  releaseDate?: string
  releaseNotes?: string
  progress?: number
  error?: string
}

// 更新管理器类
export class UpdateManager {
  private mainWindow: BrowserWindow | null = null
  private isUpdateAvailable = false
  private isUpdateDownloaded = false

  constructor() {
    this.initAutoUpdater()
  }

  // 设置主窗口引用
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window
  }

  // 初始化自动更新器
  private initAutoUpdater(): void {
    // 开发环境不检查更新
    if (is.dev) {
      console.log('开发环境，跳过自动更新检查')
      return
    }

    // 配置自动更新器
    autoUpdater.autoDownload = true        // 自动下载更新
    autoUpdater.autoInstallOnAppQuit = true // 退出时自动安装
    autoUpdater.allowDowngrade = false      // 不允许降级

    // 设置更新服务器地址（如果 electron-builder.yml 中已配置，则不需要）
    // autoUpdater.setFeedURL({
    //   provider: 'generic',
    //   url: 'https://your-server.com/updates/'
    // })

    // 监听更新事件
    this.setupUpdateEvents()
  }

  // 设置更新事件监听
  private setupUpdateEvents(): void {
    // 检查更新中
    autoUpdater.on('checking-for-update', () => {
      console.log('正在检查更新...')
      this.sendUpdateStatus({
        status: UpdateStatus.CHECKING
      })
    })

    // 发现可用更新
    autoUpdater.on('update-available', (info) => {
      console.log('发现新版本:', info.version)
      this.isUpdateAvailable = true
      this.sendUpdateStatus({
        status: UpdateStatus.AVAILABLE,
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes as string
      })
    })

    // 没有可用更新
    autoUpdater.on('update-not-available', (info) => {
      console.log('当前已是最新版本:', info.version)
      this.sendUpdateStatus({
        status: UpdateStatus.NOT_AVAILABLE,
        version: info.version
      })
    })

    // 更新下载进度
    autoUpdater.on('download-progress', (progress) => {
      console.log('下载进度:', progress.percent.toFixed(2) + '%')
      this.sendUpdateStatus({
        status: UpdateStatus.DOWNLOADING,
        progress: progress.percent
      })
    })

    // 更新下载完成
    autoUpdater.on('update-downloaded', (info) => {
      console.log('更新下载完成:', info.version)
      this.isUpdateDownloaded = true
      this.sendUpdateStatus({
        status: UpdateStatus.DOWNLOADED,
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes as string
      })

      // 提示用户安装更新
      this.promptInstallUpdate(info.version)
    })

    // 更新错误
    autoUpdater.on('error', (error) => {
      console.error('更新错误:', error)
      this.sendUpdateStatus({
        status: UpdateStatus.ERROR,
        error: error.message
      })
    })
  }

  // 发送更新状态到渲染进程
  private sendUpdateStatus(info: UpdateInfo): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('update-status', info)
    }
  }

  // 提示用户安装更新
  private async promptInstallUpdate(version: string): Promise<void> {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      return
    }

    const result = await dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: '更新已就绪',
      message: `新版本 ${version} 已下载完成`,
      detail: '是否立即重启应用以完成更新？',
      buttons: ['立即重启', '稍后提醒'],
      defaultId: 0,
      cancelId: 1
    })

    if (result.response === 0) {
      // 用户选择立即重启
      this.quitAndInstall()
    }
  }

  // 检查更新
  checkForUpdates(): void {
    if (is.dev) {
      console.log('开发环境，跳过更新检查')
      return
    }

    autoUpdater.checkForUpdates().catch((error) => {
      console.error('检查更新失败:', error)
    })
  }

  // 下载更新
  downloadUpdate(): void {
    if (this.isUpdateAvailable && !this.isUpdateDownloaded) {
      autoUpdater.downloadUpdate().catch((error) => {
        console.error('下载更新失败:', error)
      })
    }
  }

  // 退出并安装更新
  quitAndInstall(): void {
    if (this.isUpdateDownloaded) {
      autoUpdater.quitAndInstall(false, true)
    }
  }

  // 获取当前版本
  getCurrentVersion(): string {
    return autoUpdater.currentVersion.version
  }

  // 检查是否有可用更新
  hasUpdateAvailable(): boolean {
    return this.isUpdateAvailable
  }

  // 检查更新是否已下载
  isUpdateReady(): boolean {
    return this.isUpdateDownloaded
  }
}

// 创建单例实例
export const updateManager = new UpdateManager()
