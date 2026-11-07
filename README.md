# Stark1898y 个人技术网站

网站：<https://www.stark1898y.cc/>

以 **Zensical + awesome-nav + Pages CMS + GitHub Pages** 为目标架构，整理嵌入式软硬件技术文档、博客、开源项目与浏览器工具。

> **迁移中**：本分支 `refactor/zensical-pagescms-v1` 尚未上线。GitHub 默认 `main` 仍使用 VitePress，迁移进度与验收条件参见 [Docs/zensical-migration.md](Docs/zensical-migration.md)。

## 环境与本地预览

需要 Python 3.11+（CI 当前使用 Python 3.12）。

```powershell
git clone https://github.com/stark1898y/stark1898y.github.io.git
cd stark1898y.github.io
git switch refactor/zensical-pagescms-v1
python -m pip install -r requirements-site.txt
zensical serve
```

预览地址以 `zensical serve` 的控制台输出为准。编辑 Markdown 或 `.nav.yml` 后可实时预览。

发布前执行完整的静态检查：

```powershell
zensical build --clean --strict
python scripts/zensical/restore_tools.py
python scripts/zensical/restore_legacy_urls.py
python scripts/zensical/check_output.py
python scripts/zensical/audit_site.py
```

GitHub PR 会自动执行临时文章发布、awesome-nav、浏览器工具及 Chrome 冒烟测试，产物保存在 Actions artifacts。部署工作流已经在重构分支预备，只有合并至 `main` 后才会替换旧的 VitePress 生产部署流程。

## 内容目录

| 路径 | 作用 |
| --- | --- |
| `content/index.md` | 首页技术门户 |
| `content/docs/` | 嵌入式技术知识库 |
| `content/blog/posts/` | 博客与开发日志 |
| `content/open-source/` | 开源项目 |
| `content/dev-tools/` | 浏览器工具说明 |
| `content/assets/uploads/` | Pages CMS 上传图片和附件 |
| `public/dev-tools/` | 原有 JSON、Base64、时间戳 HTML 工具源码 |
| `content/stylesheets/` | 主题定制样式 |
| `scripts/zensical/` | 构建、测试与兼容脚本 |

## 写博客

网页编辑：登录 <https://app.pagescms.org/> → 选择仓库 `stark1898y/stark1898y.github.io` → 选择目标分支 → **博客与开发日志**。

- 新建文章填写中文标题、日期、唯一英文 `slug`；默认 `draft: true`，不会在正式网站公开。
- 正文可通过富文本模式编辑，也可切换 Markdown 源码。推荐技术文章保留 Markdown 源码。
- 如需发布，将 `draft` 改为 `false` 并保存；GitHub Actions 在正式分支上构建并部署。
- 已发布文章的 `slug` 不要随意修改，以免旧 URL 失效。
- 上传的资源在仓库中保存于 `content/assets/uploads/`，在网页中通过 `/assets/uploads/文件名` 访问。

**验证状态**：2026-11-07 已成功使用 Pages CMS 创建 `content/blog/posts/pages-cms-test.md` 草稿，并通过构建。编辑已有文章和真实图片上传仍待完成；测试文章保持草稿，不应发布。

## 写技术文档与目录

技术文档放在 `content/docs/`，支持 Markdown、代码块、表格和 Mermaid。每个目录维护 `.nav.yml`：

```yaml
title: 软件开发
nav:
  - index.md
  - framework
  - component
  - "*"
```

`"*"` 表示接收未显式列出的新增 Markdown；一般不必再修改全局导航。旧 `_category_.json` 和 `.vitepress/sidebar.ts` 已不参与 Zensical 构建。

原有独立 HTML 工具仍保留固定 URL：`/dev-tools/json-formatter/`、`/dev-tools/base64/`、`/dev-tools/timestamp-converter/`。构建时通过复制脚本恢复到 `site/`，并兼容历史 VitePress `.html` 链接。

## 项目维护与部署原则

- 只在功能分支修改网站，PR 验证完成后再合并 `main`。
- 生成文件 `site/` 和 `artifacts/` 不要提交到 Git。
- GitHub Pages 不用数据库；不要提交密码、Token 或未公开的个人/公司资料。
- 工具的小型源码、图片、文档可直接保存在仓库；较大的可下载发布包放对应项目的 GitHub Releases。
- 生产切换前确认自定义域名、Sitemap、搜索、手机浏览器、旧 URL 和回滚方案。

详细决策、已验证事项和剩余工作参见 [迁移记录](Docs/zensical-migration.md)。
