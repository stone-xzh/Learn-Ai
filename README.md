<div align="center">

# Learn Ai

**保持好奇，持续记录。**

关于 AI、代码，以及持续学习的个人笔记。

[访问博客](https://stone-xzh.github.io/Learn-Ai/) · [开始写作](docs/writing.md) · [文章模板](templates/post.md) · [发布状态](https://github.com/stone-xzh/Learn-Ai/actions)

</div>

---

## 写作，从这里开始

日常只需要编辑 **[posts/](posts)** 中的文章。提交后，GitHub Actions 会自动构建并发布网站。

1. 复制 **[文章模板](templates/post.md)**。
2. 在 **[posts/](posts)** 新建 `2026-10-22-my-first-note.md`，修改文章信息并写正文。
3. 提交到 `main`，等待 **[发布任务](https://github.com/stone-xzh/Learn-Ai/actions)** 出现绿色对勾。

详细步骤、字段说明与 Markdown 排版示例，请看 **[写作与发布指南](docs/writing.md)**。

## 目录一览

```text
Learn-Ai/
├── posts/                  # 文章：日常写作的地方
├── templates/
│   └── post.md             # 新文章模板
├── docs/
│   └── writing.md          # 写作与发布指南
├── assets/                 # 样式、交互脚本和站点图标
├── scripts/                # 构建与检查脚本
├── .github/workflows/      # GitHub Pages 自动发布
├── site.json               # 博客名称、作者、网址等配置
├── package.json            # 构建命令与依赖
├── package-lock.json       # 固定依赖版本
└── README.md               # 当前说明
```

`dist/` 是本地构建输出，`node_modules/` 是依赖目录，两者都不会提交到仓库。

## 常用修改

| 想做什么 | 打开哪里 |
| --- | --- |
| 新增或修改文章 | [posts/](posts) |
| 查看发文步骤 | [docs/writing.md](docs/writing.md) |
| 修改博客名称、作者、正式网址 | [site.json](site.json) |
| 调整颜色、字号、间距 | [assets/style.css](assets/style.css) |
| 修改导航、页面布局和关于页正文 | [scripts/build.mjs](scripts/build.mjs) |
| 查看发布是否成功 | [GitHub Actions](https://github.com/stone-xzh/Learn-Ai/actions) |

## 博客功能

- 按年份排列的文章列表，适配电脑与手机。
- 归档、分类筛选，以及标题、摘要、标签搜索。
- 深浅色主题、可展开的文章目录与代码复制。
- RSS 订阅、网站地图和 404 页面。
- 使用 Markdown 写作，所有页面资源由本站提供。

起步文章已标注为“示例笔记”，可以替换为自己的内容。搜索不包含正文全文。

<details>
<summary><strong>本地预览与开发</strong></summary>

需要 Node.js 22 或更高版本。以下命令在仓库根目录运行：

```bash
npm ci
npm run build
npm run check
python3 -m http.server 8000 --directory dist
```

打开 <http://localhost:8000> 查看。修改源文件后重新运行 `npm run build`，不要直接编辑 `dist/`。

`npm run check` 会检查页面、站内链接、文章锚点与结构化数据。

</details>

<details>
<summary><strong>自动发布配置</strong></summary>

发布流程定义在 [pages.yml](.github/workflows/pages.yml)。推送到 `main` 会依次安装依赖、构建、检查，再部署到 GitHub Pages。

仓库 **Settings → Pages → Source** 使用 **GitHub Actions**，当前已配置完成。

</details>

---

视觉参考 [Nan Xiao 的博客](https://nanx.me/blog/)。页面代码独立实现，使用系统中文字体。
