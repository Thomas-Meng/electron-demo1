# 手动上传 latest.yml 到 GitHub Releases
# 使用方法: .\upload-latest-yml.ps1

# 配置信息
$Owner = "Thomas-Meng"
$Repo = "electron-demo1"
$Version = "1.1.0"
$Token = $env:GH_TOKEN
if (-not $Token) {
    Write-Host "错误: 请设置环境变量 GH_TOKEN" -ForegroundColor Red
    exit 1
}
$File = "dist\latest.yml"

# 检查文件是否存在
if (-not (Test-Path $File)) {
    Write-Host "错误: $File 文件不存在" -ForegroundColor Red
    exit 1
}

# 获取 Release ID
Write-Host "获取 Release ID..." -ForegroundColor Yellow
$Headers = @{
    "Authorization" = "token $Token"
    "Accept" = "application/vnd.github.v3+json"
}

try {
    $ReleaseInfo = Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/releases/tags/v$Version" -Headers $Headers
    $ReleaseId = $ReleaseInfo.id
    Write-Host "Release ID: $ReleaseId" -ForegroundColor Green
} catch {
    Write-Host "错误: 无法获取 Release ID" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# 上传 latest.yml 文件
Write-Host "上传 latest.yml 文件..." -ForegroundColor Yellow

try {
    $FileBytes = [System.IO.File]::ReadAllBytes($File)
    $FileContent = [System.Text.Encoding]::UTF8.GetString($FileBytes)

    $UploadHeaders = @{
        "Authorization" = "token $Token"
        "Content-Type" = "application/octet-stream"
    }

    $Response = Invoke-RestMethod -Uri "https://uploads.github.com/repos/$Owner/$Repo/releases/$ReleaseId/assets?name=latest.yml" -Method Post -Headers $UploadHeaders -Body $FileContent

    Write-Host "✅ latest.yml 文件上传成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "访问以下链接查看 Release:" -ForegroundColor Cyan
    Write-Host "https://github.com/$Owner/$Repo/releases/tag/v$Version" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 上传失败:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
