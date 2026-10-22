# Learn Ai

一个轻量的中文 AI 学习笔记博客。使用 Markdown 写文章，由 GitHub Actions 构建并发布到 GitHub Pages。

网站地址：https://stone-xzh.github.io/Learn-Ai/

## 写一篇文章

在仓库根目录新增一个文件，例如 `post-004-my-first-note.md`。文件名必须以 `post-` 开头，以 `.md` 结尾。

```markdown
---
title: "我的第一篇 AI 学习笔记"
date: "2026-10-22"
slug: "my-first-note"
category: "学习方法"
tags: ["AI 入门", "笔记"]
summary: "用一句话介绍这篇文章。"
sample: false
---

## 今天想弄清楚的问题

在这里开始写正文。

## 我的理解

使用 **加粗**、列表、链接和代码块整理笔记。
```

- `slug` 是文章的网址文件名，使用小写英文、数字和连接号，不能与其他文章重复。
- 日期必须使用引号括起来的 `YYYY-MM-DD` 格式。文章按日期从新到旧排列。
- 分类直接修改 `category`，归档页会自动生成对应筛选按钮。
- 首页按文章的实际年份分组，日期从新到旧排列。旧的 `featured` 配置仍兼容，但在简洁版中不显示推荐卡片。
- `sample: true` 表示示例笔记，正式文章用 `false` 或删除该项。
- 提交到 `main` 分支后，Actions 会自动更新网站。无需服务器，也无需 Docker。

GitHub 网页操作：仓库首页 → Add file → Create new file → 填写文件名与内容 → Commit changes。

## 修改现有文章

打开任意 `post-*.md`，点击编辑按钮，修改正文后提交。三篇起步文章都标注为示例，可以编辑或删除。

## 网站配置

- `site.json`：站点信息、正式网址和 GitHub 仓库地址。
- `style.css`：颜色、布局和手机适配。
- `app.js`：搜索、分类、主题切换和复制代码。
- `build.mjs`：页面模板、Markdown 构建、RSS 与网站地图。
- 站点名称、作者和介绍由 `site.json` 统一读取；关于页正文在 `build.mjs` 中修改。

## 首次发布

仓库的 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。

工作流文件为 `.github/workflows/pages.yml`。首次启用 Pages 后，在 Actions 中打开 Publish Learn Ai，使用 Run workflow 触发发布；后续推送到 main 会自动运行。

## 本地预览

需要 Node.js 22 或更高版本：

```bash
npm ci
npm run build
npm run check
python3 -m http.server 8000 --directory dist
```

浏览器打开 http://localhost:8000 。`dist/` 是构建结果，不需要手动编辑或提交。

## 功能

手机适配、分类筛选、标题/摘要/标签搜索、深浅色切换、文章目录、代码复制、归档、RSS、网站地图与 404 页面。所有浏览器资源来自本站，无外部字体、追踪脚本或运行时 CDN 依赖。

首页采用按年份分组的日期与标题列表。搜索和分类集中在归档页；文章标签可以点击检索，目录可以展开。页脚「夜间／日间」切换并记住主题。

视觉参考 [Nan Xiao 的博客](https://nanx.me/blog/)：居中单栏、轻量导航、细分隔线和克制的字体层级。页面代码独立实现，使用系统中文字体，不包含参考站的文章、图片或商业字体。

搜索在当前的文章元数据中进行，不是正文全文搜索。评论、登录和服务器数据库不包含在本项目中。
