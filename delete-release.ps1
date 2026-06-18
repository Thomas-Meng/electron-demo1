# 删除 Release + Tag 脚本
# 用法: .\delete-release.ps1 v1.1.4

param(
    [Parameter(Mandatory=$true)]
    [string]$Tag
)

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

$Owner = "Thomas-Meng"
$Repo = "electron-demo1"
$Headers = @{"Authorization" = "token $env:GH_TOKEN"}

# 删除 Release
Write-Host "删除 Release $Tag..." -ForegroundColor Cyan
$release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/releases/tags/$Tag" -Headers $Headers -ErrorAction SilentlyContinue
if ($release) {
    Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/releases/$($release.id)" -Headers $Headers -Method Delete
    Write-Host "  Release 已删除" -ForegroundColor Green
} else {
    Write-Host "  Release 不存在，跳过" -ForegroundColor Yellow
}

# 删除远程 Tag
Write-Host "删除远程 Tag $Tag..." -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/git/refs/tags/$Tag" -Headers $Headers -Method Delete
    Write-Host "  远程 Tag 已删除" -ForegroundColor Green
} catch {
    Write-Host "  远程 Tag 不存在，跳过" -ForegroundColor Yellow
}

# 删除本地 Tag
Write-Host "删除本地 Tag $Tag..." -ForegroundColor Cyan
git tag -d $Tag 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  本地 Tag 已删除" -ForegroundColor Green
} else {
    Write-Host "  本地 Tag 不存在，跳过" -ForegroundColor Yellow
}

Write-Host "完成！" -ForegroundColor Green
