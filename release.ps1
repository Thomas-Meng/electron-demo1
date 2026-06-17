# 发布脚本
# 用法: .\release.ps1 [patch|minor|major]

param(
    [string]$Version = "patch"
)

# 检查 GH_TOKEN
if (-not $env:GH_TOKEN) {
    Write-Host "错误: 请先设置 GH_TOKEN" -ForegroundColor Red
    Write-Host '  $env:GH_TOKEN="你的token"' -ForegroundColor Yellow
    exit 1
}

# 升版本号
Write-Host "升级版本号 ($Version)..." -ForegroundColor Cyan
npm version $Version

# 推送
Write-Host "推送代码和 tag..." -ForegroundColor Cyan
git push --follow-tags

# 构建并发布
Write-Host "构建并发布..." -ForegroundColor Cyan
npm run release

Write-Host "发布完成！" -ForegroundColor Green
