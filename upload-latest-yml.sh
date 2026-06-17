#!/bin/bash

# 手动上传 latest.yml 到 GitHub Releases
# 使用方法: ./upload-latest-yml.sh

# 配置信息
OWNER="Thomas-Meng"
REPO="electron-demo1"
VERSION="1.1.0"
TOKEN="${GH_TOKEN:-}"
if [ -z "$TOKEN" ]; then
    echo "错误: 请设置环境变量 GH_TOKEN"
    exit 1
fi
FILE="dist/latest.yml"

# 检查文件是否存在
if [ ! -f "$FILE" ]; then
    echo "错误: $FILE 文件不存在"
    exit 1
fi

# 获取 Release ID
echo "获取 Release ID..."
RELEASE_ID=$(curl -s -H "Authorization: token $TOKEN" \
    "https://api.github.com/repos/$OWNER/$REPO/releases/tags/v$VERSION" | \
    grep -o '"id": [0-9]*' | head -1 | grep -o '[0-9]*')

if [ -z "$RELEASE_ID" ]; then
    echo "错误: 无法获取 Release ID"
    exit 1
fi

echo "Release ID: $RELEASE_ID"

# 上传 latest.yml 文件
echo "上传 latest.yml 文件..."
RESPONSE=$(curl -s -X POST \
    -H "Authorization: token $TOKEN" \
    -H "Content-Type: application/octet-stream" \
    --data-binary @"$FILE" \
    "https://uploads.github.com/repos/$OWNER/$REPO/releases/$RELEASE_ID/assets?name=latest.yml")

# 检查上传结果
if echo "$RESPONSE" | grep -q '"state":"uploaded"'; then
    echo "✅ latest.yml 文件上传成功！"
    echo ""
    echo "访问以下链接查看 Release:"
    echo "https://github.com/$OWNER/$REPO/releases/tag/v$VERSION"
else
    echo "❌ 上传失败:"
    echo "$RESPONSE"
    exit 1
fi
