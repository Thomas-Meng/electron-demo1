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

# 清理指定版本的 Release
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

# 上传单个文件到 Release（带重试，大文件用 curl）
function Upload-Asset($releaseId, $filePath, $fileName) {
    $maxRetry = 3
    for ($i = 1; $i -le $maxRetry; $i++) {
        Write-Host "  上传 $fileName（第 $i 次）..." -ForegroundColor Gray
        try {
            $result = curl.exe -s -X POST `
                -H "Authorization: token $env:GH_TOKEN" `
                -H "Content-Type: application/octet-stream" `
                --data-binary "@$filePath" `
                "https://uploads.github.com/repos/$Owner/$Repo/releases/$releaseId/assets?name=$fileName" `
                --max-time 300
            $json = $result | ConvertFrom-Json
            if ($json.name -eq $fileName) {
                Write-Host "  $fileName 上传成功" -ForegroundColor Green
                return $true
            } else {
                Write-Host "  上传失败: $($json.message)" -ForegroundColor Red
            }
        } catch {
            Write-Host "  上传失败: $($_.Exception.Message)" -ForegroundColor Red
        }
        if ($i -lt $maxRetry) { Start-Sleep -Seconds 5 }
    }
    return $false
}

# ============ 开始 ============

# 1. 升版本号
Write-Host "1/5 升级版本号 ($Version)..." -ForegroundColor Cyan
npm version $Version
if ($LASTEXITCODE -ne 0) {
    Write-Host "失败: 请先提交未保存的修改" -ForegroundColor Red
    exit 1
}

$NewVersion = (Get-Content "package.json" | ConvertFrom-Json).version
$Tag = "v$NewVersion"
Write-Host "  版本: $Tag" -ForegroundColor Yellow

# 2. 推送
Write-Host "2/5 推送代码和 tag..." -ForegroundColor Cyan
git push --follow-tags
if ($LASTEXITCODE -ne 0) {
    Write-Host "失败: 推送出错" -ForegroundColor Red
    exit 1
}

# 3. 构建（不发布）
Write-Host "3/5 构建应用..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "失败: 构建出错" -ForegroundColor Red
    exit 1
}

# 4. 清理旧 Release 并创建新的
Write-Host "4/5 创建 GitHub Release..." -ForegroundColor Cyan
Cleanup-Release $Tag

# 创建 Release
$body = @{
    tag_name = $Tag
    name = $NewVersion
    body = "Release $NewVersion"
    draft = $false
    prerelease = $false
} | ConvertTo-Json

$release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/releases" `
    -Method Post -Headers $Headers -Body $body -ContentType "application/json"
$releaseId = $release.id
Write-Host "  Release 已创建 (ID: $releaseId)" -ForegroundColor Green

# 5. 上传文件
Write-Host "5/5 上传文件..." -ForegroundColor Cyan
$distDir = Join-Path $PSScriptRoot "dist"
$allSuccess = $true

$files = @(
    @{ Path = Join-Path $distDir "electron-app-$NewVersion-setup.exe"; Name = "electron-app-$NewVersion-setup.exe" },
    @{ Path = Join-Path $distDir "electron-app-$NewVersion-setup.exe.blockmap"; Name = "electron-app-$NewVersion-setup.exe.blockmap" },
    @{ Path = Join-Path $distDir "latest.yml"; Name = "latest.yml" }
)

foreach ($file in $files) {
    if (Test-Path $file.Path) {
        $ok = Upload-Asset $releaseId $file.Path $file.Name
        if (-not $ok) { $allSuccess = $false }
    } else {
        Write-Host "  文件不存在: $($file.Name)" -ForegroundColor Red
        $allSuccess = $false
    }
}

# 结果
if ($allSuccess) {
    Write-Host "`n发布成功！" -ForegroundColor Green
    Write-Host "https://github.com/$Owner/$Repo/releases/tag/$Tag" -ForegroundColor Cyan
} else {
    Write-Host "`n发布完成但部分文件上传失败，请检查 GitHub Release" -ForegroundColor Yellow
    Write-Host "https://github.com/$Owner/$Repo/releases/tag/$Tag" -ForegroundColor Cyan
    exit 1
}
