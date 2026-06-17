/*
 * @Author: mengtong
 * @Date: 2026-06-17
 * @Description: 自动更新管理组件
 */

import { useState, useEffect } from 'react'

// 更新状态枚举
type UpdateStatus =
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error'

// 更新信息接口
interface UpdateInfo {
  status: UpdateStatus
  version?: string
  releaseDate?: string
  releaseNotes?: string
  progress?: number
  error?: string
}

export default function UpdateManager(): React.JSX.Element {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [currentVersion, setCurrentVersion] = useState<string>('')
  const [isVisible, setIsVisible] = useState<boolean>(false)

  // 初始化
  useEffect(() => {
    // 获取当前版本
    const loadVersion = async () => {
      const version = await window.electronAPI.getCurrentVersion()
      setCurrentVersion(version)
    }
    loadVersion()

    // 监听更新状态
    window.electronAPI.onUpdateStatus((info) => {
      setUpdateInfo(info)

      // 自动显示更新面板
      if (
        info.status === 'available' ||
        info.status === 'downloading' ||
        info.status === 'downloaded'
      ) {
        setIsVisible(true)
      }
    })
  }, [])

  // 检查更新
  const handleCheckUpdate = (): void => {
    window.electronAPI.checkForUpdates()
  }

  // 下载更新
  const handleDownloadUpdate = (): void => {
    window.electronAPI.downloadUpdate()
  }

  // 安装更新
  const handleInstallUpdate = (): void => {
    window.electronAPI.quitAndInstall()
  }

  // 关闭面板
  const handleClose = (): void => {
    setIsVisible(false)
  }

  // 获取状态文本
  const getStatusText = (): string => {
    if (!updateInfo) return '检查更新'

    switch (updateInfo.status) {
      case 'checking':
        return '正在检查更新...'
      case 'available':
        return `发现新版本 ${updateInfo.version}`
      case 'not-available':
        return '当前已是最新版本'
      case 'downloading':
        return `下载中 ${updateInfo.progress?.toFixed(1) || 0}%`
      case 'downloaded':
        return '更新已就绪'
      case 'error':
        return `更新失败: ${updateInfo.error}`
      default:
        return '检查更新'
    }
  }

  // 获取状态图标
  const getStatusIcon = (): string => {
    if (!updateInfo) return '🔄'

    switch (updateInfo.status) {
      case 'checking':
        return '⏳'
      case 'available':
        return '🆕'
      case 'not-available':
        return '✅'
      case 'downloading':
        return '📥'
      case 'downloaded':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '🔄'
    }
  }

  // 渲染更新进度条
  const renderProgressBar = (): React.JSX.Element | null => {
    if (updateInfo?.status !== 'downloading') return null

    return (
      <div className="update-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${updateInfo.progress || 0}%` }} />
        </div>
        <span className="progress-text">{updateInfo.progress?.toFixed(1) || 0}%</span>
      </div>
    )
  }

  // 渲染更新操作按钮
  const renderActions = (): React.JSX.Element => {
    if (!updateInfo) {
      return (
        <button onClick={handleCheckUpdate} className="btn btn-primary btn-sm">
          检查更新
        </button>
      )
    }

    switch (updateInfo.status) {
      case 'available':
        return (
          <button onClick={handleDownloadUpdate} className="btn btn-primary btn-sm">
            下载更新
          </button>
        )
      case 'downloaded':
        return (
          <button onClick={handleInstallUpdate} className="btn btn-success btn-sm">
            立即安装
          </button>
        )
      case 'not-available':
        return (
          <button onClick={handleCheckUpdate} className="btn btn-secondary btn-sm">
            重新检查
          </button>
        )
      case 'error':
        return (
          <button onClick={handleCheckUpdate} className="btn btn-secondary btn-sm">
            重试
          </button>
        )
      default:
        return (
          <button onClick={handleCheckUpdate} className="btn btn-secondary btn-sm">
            检查更新
          </button>
        )
    }
  }

  // 如果不可见，只显示一个小按钮
  if (!isVisible) {
    return (
      <div className="update-trigger">
        <button
          onClick={() => setIsVisible(true)}
          className="btn btn-sm btn-outline"
          title="检查更新"
        >
          🔄 更新
        </button>
        <span className="version-text">v{currentVersion}</span>
      </div>
    )
  }

  return (
    <div className="update-panel">
      <div className="update-header">
        <h4>应用更新</h4>
        <button onClick={handleClose} className="btn-close">
          ×
        </button>
      </div>

      <div className="update-content">
        <div className="update-status">
          <span className="status-icon">{getStatusIcon()}</span>
          <span className="status-text">{getStatusText()}</span>
        </div>

        {updateInfo?.version && (
          <div className="update-version">
            <strong>版本：</strong> {updateInfo.version}
          </div>
        )}

        {updateInfo?.releaseDate && (
          <div className="update-date">
            <strong>发布日期：</strong> {new Date(updateInfo.releaseDate).toLocaleDateString()}
          </div>
        )}

        {updateInfo?.releaseNotes && (
          <div className="update-notes">
            <strong>更新说明：</strong>
            <p>{updateInfo.releaseNotes}</p>
          </div>
        )}

        {renderProgressBar()}

        <div className="update-actions">
          {renderActions()}
          <span className="current-version">当前版本: v{currentVersion}</span>
        </div>
      </div>
    </div>
  )
}
