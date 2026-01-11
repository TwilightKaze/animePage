# 二次元浏览器起始页

一个美观的二次元风格浏览器起始页，支持多种实用功能。

## 功能特性

-  **快捷链接** - 自定义常用网站，自动获取图标
-  **待办事项** - 简单的 Todo 列表
-  **自定义壁纸** - 内置壁纸 + 支持上传自定义图片

## 使用方法

### 方法一：直接打开
1. 双击 `index.html` 文件即可使用

### 方法二：设为浏览器主页
1. 复制 `index.html` 的完整路径
2. 在浏览器设置中将主页设为该路径

### 方法三：本地服务器
```bash
# 使用 Python
python -m http.server 8080

# 使用 Node.js
npx serve .
```

## 文件结构

```
anime-start-page/
├── index.html    # 主页面
├── style.css     # 样式文件
├── script.js     # 功能脚本
└── README.md     # 说明文档
```

## 自定义

### 修改默认链接
编辑 `script.js` 中的 `DEFAULT_LINKS` 数组

### 修改默认壁纸
编辑 `script.js` 中的 `DEFAULT_WALLPAPERS` 数组

### 修改配色
编辑 `style.css` 中的 `:root` CSS 变量

## 数据存储

所有用户数据保存在浏览器的 localStorage 中：
- 快捷链接
- 待办事项
- 壁纸设置
- 搜索引擎偏好

##  API

- 网站图标：Google Favicon API

## 📄 许可证

MIT License
