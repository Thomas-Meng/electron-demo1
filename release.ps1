# 发布脚本
# 用法: .\release.ps1 [patch|minor|major]

param(
    [string]$Version = "patch"
)

$ErrorActionPreference = "Stop"
$Owner = "Thomas-Meng"
$Repo = "electron-demo1"

# 自动从 .env 读取 GH_TOKEN
if (-not $env:GH_TOKEN) {
    $envFile = Join-Path $PSScriptRoot ".env"
    if (Test-Path $envFile) {
        $envContent = Get-Content $envFile
        foreach ($line in $envContent) {
            if ($line -match "^GH_TOKEN=(.+)$") {
                $env:GH_TOKEN = $Matches[1].Trim()
                break
            }
        }
    }
    if (-not $env:GH_TOKEN) {
        Write-Host "错误: 请在 .env 文件中设置 GH_TOKEN" -ForegroundColor Red
        exit 1
    }
}

$Headers = @{
    "Authorization" = "token $env:GH_TOKEN"
    "Accept" = "application/vnd.github.v3+json"
}

# 清理指定版本的 Release 和 Tag
function Cleanup-Release($tag) {
    Write-Host "清理 $tag 的旧 Release..." -ForegroundColor Yellow
    try {
        $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/releases/tags/$tag" -Headers $Headers -ErrorAction SilentlyContinue
        if ($release) {
            Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/releases/$($release.id)" -Headers $Headers -Method Delete
            Write-Host "  Release 已删除" -ForegroundColor Green
            Start-Sleep -Seconds 2
        }
    } catch {}
}

# 升版本号
Write-Host "升级版本号 ($Version)..." -ForegroundColor Cyan
npm version $Version
if ($LASTEXITCODE -ne 0) {
    Write-Host "失败: 升级版本号出错（请先提交未保存的修改）" -ForegroundColor Red
    exit 1
}

$NewVersion = (Get-Content "package.json" | ConvertFrom-Json).version
$Tag = "v$NewVersion"
Write-Host "版本: $Tag" -ForegroundColor Yellow

# 推送
Write-Host "推送代码和 tag..." -ForegroundColor Cyan
git push --follow-tags
if ($LASTEXITCODE -ne 0) {
    Write-Host "失败: 推送出错，请检查网络连接" -ForegroundColor Red
    exit 1
}

# 发布前清理旧 Release
Cleanup-Release $Tag

# 构建并发布（最多重试 3 次）
$maxRetry = 3
for ($i = 1; $i -le $maxRetry; $i++) {
    Write-Host "构建并发布（第 $i 次）..." -ForegroundColor Cyan
    npm run release
    if ($LASTEXITCODE -eq 0) { break }

    if ($i -lt $maxRetry) {
        Write-Host "发布失败，清理后重试..." -ForegroundColor Yellow
        Cleanup-Release $Tag
        # 重新创建 tag（因为 Release 删除后 tag 可能还在）
        git tag -f $Tag
        git push -f origin $Tag
        Start-Sleep -Seconds 3
    }
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "失败: 发布出错，已重试 $maxRetry 次" -ForegroundColor Red
    Cleanup-Release $Tag
    exit 1
}

# 验证发布结果
Write-Host "验证发布结果..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
try {
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/releases/tags/$Tag" -Headers $Headers
    $assets = $release.assets | ForEach-Object { $_.name }
    $hasExe = $assets -contains "electron-app-$NewVersion-setup.exe"
    $hasBlockmap = $assets -contains "electron-app-$NewVersion-setup.exe.blockmap"
    $hasLatestYml = $assets -contains "latest.yml"

    if ($hasExe -and $hasBlockmap -and $hasLatestYml) {
        Write-Host "发布成功！所有文件齐全：" -ForegroundColor Green
        $assets | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
    } else {
        Write-Host "错误: 文件不完整！" -ForegroundColor Red
        if (-not $hasExe) { Write-Host "  缺少: setup.exe" -ForegroundColor Red }
        if (-not $hasBlockmap) { Write-Host "  缺少: setup.exe.blockmap" -ForegroundColor Red }
        if (-not $hasLatestYml) { Write-Host "  缺少: latest.yml" -ForegroundColor Red }
        Write-Host "正在清理不完整 Release..." -ForegroundColor Yellow
        Cleanup-Release $Tag
        exit 1
    }
} catch {
    Write-Host "警告: 无法验证发布结果，请手动检查 GitHub" -ForegroundColor Yellow
}
