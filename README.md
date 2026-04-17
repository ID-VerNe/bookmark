# 🔖 DASH. (Bookmark Management System)

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Frontend: React 19](https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg)](https://react.dev/)
[![Backend: PHP 8](https://img.shields.io/badge/Backend-PHP%208-777BB4.svg)](https://www.php.net/)

**DASH.** 是一个为开发者设计的极简、高效、自托管的书签管理系统。它不仅是一个书签收藏夹，更是一个集成了智能识别与多引擎搜索的 **智能地址栏 (Omnibox)**。

![Dashboard Preview](https://raw.githubusercontent.com/ID-VerNe/bookmark/master/.gemini-clipboard/clipboard-1769919752851.png)

---

## ✨ 核心特性

### 🚀 智能 Omnibox (搜索栏)
采用了类似 Chrome 的启发式识别算法，能够精准区分搜索行为与跳转行为：
- **自动识别 URL**：输入 `github.com`、`localhost:3000` 或 `192.168.1.1` 自动判定为网址并直接跳转，无需输入协议头。
- **默认 AI 搜索**：直接输入关键词并回车，默认唤起 **Google AI (udm=50)** 检索，提供即时的 AI 摘要结果。
- **多引擎快捷指令** (支持中英文问号):
  - `? <query>` : 调用普通 Google 搜索。
  - `?bd <query>` : 调用百度搜索。
  - `?gh <query>` : 直接搜索 GitHub 仓库。
  - `?fy <query>` : 极速中英互译 (基于百度翻译)。

### 🔍 极速本地检索 (拼音增强)
- **多维索引**：支持按标题、网址、拼音全拼以及**拼音首字母**进行实时过滤。
- **直觉匹配**：输入 `dcd` 即可秒级定位到标题为 `点击率` 的书签。
- **热点排序**：根据点击次数 (`click_count`) 自动置顶常用书签。

### 🤖 自动化后端
- **智能抓取**：添加书签时，后端通过 `Guzzle` 和 `DomCrawler` 自动提取目标网页的标题、描述及 Favicon 图标。
- **本地存储**：Favicon 会被自动保存至本地，确保在任何环境下都能快速加载并保护隐私。

---

## 🛠️ 技术架构

- **Frontend**: 
  - [React 19](https://react.dev/) - 最新的 React 版本，性能更佳。
  - [Vite 6](https://vite.dev/) - 极速的开发与构建工具。
  - [Tailwind CSS 4](https://tailwindcss.com/) - 现代化的原子化 CSS 框架。
  - [TanStack Query v5](https://tanstack.com/query) - 强大的异步状态管理。
- **Backend**:
  - [PHP 8+](https://www.php.net/) - 轻量级 RESTful API 实现。
  - [SQLite 3](https://www.sqlite.org/) - 无需服务器配置的嵌入式数据库。
  - [Guzzle](https://docs.guzzlephp.org/) - 强大的 PHP HTTP 客户端。

---

## 📦 项目目录结构

```text
C:\Users\VerNe\Downloads\Documents\bookmark\
├── frontend\           # React 19 前端源码
│   ├── src\
│   │   ├── api\        # API 请求封装
│   │   ├── components\ # UI 组件 (CommandCenter, CategoryPanel 等)
│   │   └── hooks\      # 自定义 Hooks
│   └── build.ps1       # 自动化打包脚本
├── php_backend\        # PHP 后端源码
│   ├── index.php       # API 入口与路由处理
│   ├── database.php    # SQLite 数据库层
│   └── utils.php       # 图标抓取与工具函数
├── static\             # 静态资源 (本地存储的 Favicons 等)
└── bookmarks.db        # SQLite 数据库文件 (生产环境需确保写权限)
```

---

## 🔨 快速开始

### 1. 环境要求
- PHP 8.0 或更高版本
- 已启用 `sqlite3` 和 `curl` 扩展
- Web 服务器 (Nginx, Apache 或 Caddy)

### 2. 构建前端
```bash
cd frontend
pnpm install
pnpm build
```
执行完毕后，`frontend/dist` 目录下即为完整的生产环境代码（包含 PHP 后端）。

### 3. 部署与权限
将 `dist` 目录下的所有文件上传至 Web 服务器。**关键步骤**：确保 PHP 进程对根目录下的 `bookmarks.db` 文件及 `static/favicons/` 目录具有写权限，否则无法更新点击统计或抓取新图标。

---

## 📜 开源协议 (GPL-3.0)

本项目采用 **GNU GPL v3** 开源协议。

> **核心条款**：如果你在自己的项目中使用、修改、分发本项目的代码，或者将本项目代码集成到你的商业/非商业产品中，那么**你的项目也必须以 GPL-3.0 协议完全开源**。
> 
> 我们鼓励开源精神的传播，请尊重原作者的劳动成果。

---
Made with ❤️ by [ID-VerNe](https://github.com/ID-VerNe)
