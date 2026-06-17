# Electron 应用图标更换指南

## 📋 图标类型说明

| 图标位置 | 文件 | 格式 | 尺寸要求 | 用途 |
|----------|------|------|----------|------|
| **应用图标** | `build/icon.png` | PNG | 256x256 或 512x512 | 开发时窗口图标 |
| **Windows 图标** | `build/icon.ico` | ICO | 256x256 (多尺寸) | 打包后的 exe 图标 |
| **macOS 图标** | `build/icon.icns` | ICNS | 512x512 或 1024x1024 | 打包后的 app 图标 |
| **Linux 图标** | `build/icon.png` | PNG | 256x256 或 512x512 | AppImage 图标 |
| **托盘图标** | `resources/icon.png` | PNG | 16x16 或 32x32 | 系统托盘图标 |

## 🎨 图标设计要求

### 设计规范
- **背景**：透明背景（推荐）
- **形状**：圆角矩形或圆形（现代风格）
- **颜色**：鲜艳、对比度高
- **细节**：简洁清晰，小尺寸下也要能辨认

### 推荐尺寸
```
开发阶段（PNG）：256x256 或 512x512
Windows（ICO）：包含 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
macOS（ICNS）：包含 16x16 到 1024x1024 多种尺寸
托盘图标：16x16 或 32x32
```

## 🔧 更换图标步骤

### 方法 1：直接替换文件（推荐）

#### Windows 应用图标
1. 准备一个 256x256 或更大的 PNG 图标
2. 使用在线工具转换为 ICO 格式：
   - [ConvertICO](https://convertico.com/)
   - [ICO Convert](https://icoconvert.com/)
   - [Favicon.io](https://favicon.io/)
3. 替换 `build/icon.ico` 文件

#### macOS 应用图标
1. 准备一个 1024x1024 的 PNG 图标
2. 使用工具转换为 ICNS 格式：
   - macOS 自带：`iconutil` 命令
   - 在线工具：[iConvert Icons](https://iconverticons.com/)
   - 软件：[Image2Icon](https://www.img2icnsapp.com/)
3. 替换 `build/icon.icns` 文件

#### 开发时窗口图标
1. 准备一个 256x256 的 PNG 图标
2. 替换 `build/icon.png` 文件

#### 系统托盘图标
1. 准备一个 16x16 或 32x32 的 PNG 图标（透明背景）
2. 替换 `resources/icon.png` 文件

### 方法 2：修改配置文件

如果你想使用不同路径的图标，可以修改配置：

#### 1. 修改主进程窗口图标
```typescript
// src/main/index.ts
import icon from '../../resources/my-custom-icon.png?asset'

const mainWindow = new BrowserWindow({
  icon: icon,  // 设置窗口图标
  // ... 其他配置
})
```

#### 2. 修改 electron-builder 配置
```yaml
# electron-builder.yml
win:
  icon: build/my-icon.ico  # 自定义 ICO 路径

mac:
  icon: build/my-icon.icns  # 自定义 ICNS 路径

linux:
  icon: build/my-icon.png  # 自定义 PNG 路径
```

## 🛠️ 图标制作工具推荐

### 在线工具（免费）
1. **Favicon.io** - https://favicon.io/
   - 支持从文字、图片生成图标
   - 可导出多种格式

2. **ConvertICO** - https://convertico.com/
   - PNG 转 ICO
   - 支持批量转换

3. **ICO Convert** - https://icoconvert.com/
   - 支持多种尺寸
   - 可自定义 ICO 包含的尺寸

### 桌面软件
1. **Image2Icon** (macOS) - https://www.img2icnsapp.com/
   - 专业的图标制作工具
   - 支持所有平台格式

2. **IcoFX** (Windows) - https://icofx.ro/
   - Windows 图标编辑器
   - 支持 ICO/CUR 格式

3. **GIMP** (跨平台) - https://www.gimp.org/
   - 免费开源图像编辑器
   - 需要安装 ICO 插件

### 命令行工具
```bash
# macOS 使用 iconutil 创建 ICNS
# 1. 创建 icon.iconset 目录结构
mkdir icon.iconset

# 2. 准备不同尺寸的 PNG 文件
sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png

# 3. 生成 ICNS 文件
iconutil -c icns icon.iconset -o icon.icns
```

## 📁 当前项目图标位置

```
electron-app/
├── build/
│   ├── icon.icns          # macOS 应用图标
│   ├── icon.ico           # Windows 应用图标
│   └── icon.png           # 通用图标（开发时使用）
├── resources/
│   └── icon.png           # 托盘图标和 Linux 图标
└── src/
    └── main/
        └── index.ts       # 窗口图标配置
```

## ✅ 更换图标检查清单

### 开发阶段
- [ ] 替换 `build/icon.png`（256x256 PNG）
- [ ] 替换 `resources/icon.png`（32x32 PNG，透明背景）
- [ ] 运行 `npm run dev` 验证窗口图标
- [ ] 检查托盘图标是否正常显示

### 打包阶段
- [ ] 替换 `build/icon.ico`（Windows，多尺寸 ICO）
- [ ] 替换 `build/icon.icns`（macOS，多尺寸 ICNS）
- [ ] 运行 `npm run build:win` 验证 Windows 图标
- [ ] 运行 `npm run build:mac` 验证 macOS 图标
- [ ] 检查安装程序图标是否正常

## 🎯 培训演示建议

在培训时可以演示：

1. **展示当前图标位置**
   ```bash
   # 打开 build 目录
   start build
   ```

2. **在线生成一个简单图标**
   - 使用 Favicon.io 生成文字图标
   - 下载 ICO 和 PNG 格式

3. **替换图标并演示效果**
   - 替换 `resources/icon.png`
   - 重启应用查看效果
   - 展示托盘图标变化

4. **讲解不同格式的区别**
   - PNG：通用，适合开发
   - ICO：Windows 专用，支持多尺寸
   - ICNS：macOS 专用，支持 Retina

## ⚠️ 常见问题

### Q1: 更换图标后没有生效？
**A:** 
- 开发时：重启 `npm run dev`
- 打包后：重新运行 `npm run build`

### Q2: ICO 文件太大？
**A:** 
- 使用在线工具压缩
- 减少包含的尺寸数量
- 优化 PNG 源文件

### Q3: 托盘图标不清晰？
**A:**
- 使用 16x16 或 32x32 的小尺寸图标
- 确保图标设计简洁，细节不要太多
- 使用透明背景

### Q4: macOS 图标显示异常？
**A:**
- 确保 ICNS 包含所有必需的尺寸
- 使用 `iconutil` 验证：`iconutil -c icns icon.iconset`

## 📚 参考资源

- [Electron Builder 图标配置](https://www.electron.build/icons)
- [Apple 图标规范](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Windows 图标规范](https://learn.microsoft.com/en-us/windows/apps/design/style/iconography/app-icon-construction)
