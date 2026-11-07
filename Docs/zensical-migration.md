# Stark1898y 网站重构：迁移与验收记录

> 最新决策：**Zensical + 原生 awesome-nav + Pages CMS + Vercel 正式部署，GitHub Actions CI，GitHub Pages 手动备用**。
> 截至 2026-11-07，本工作仍在 [PR #1](https://github.com/stark1898y/stark1898y.github.io/pull/1) Draft 分支，**未合并到 main、未切换生产**。

## 一、迁移范围

从 VitePress 迁移原知识库、项目说明和开发工具首页。73 篇 Markdown 与配套项目图片复制到 `content/`；按原有分类建立 29 份 `.nav.yml`。原 `.vitepress/`、TypeScript 侧边栏、旧副本和 `package.json` / `package-lock.json` 已从**重构分支**清理，但旧版本仍保留在 `main` 和 Git 历史中。

### 当前目录

- `content/index.md`：响应式主页。
- `content/docs/`：硬件、MCU、RTOS、Linux、软件工具等文档。
- `content/blog/posts/`：博客文章（由 Pages CMS 管理）。
- `content/open-source/`：开源项目。
- `content/dev-tools/`：工具说明。
- `content/assets/uploads/`：CMS 媒体，使用 `/assets/uploads/` 地址。
- `public/dev-tools/`：原三个 HTML 浏览器工具。
- `scripts/zensical/`：构建、静态链接、SEO、测试。
- `vercel.json`：Vercel 构建参数。
- `.github/workflows/zensical-check.yml`：PR 校验。
- `.github/workflows/deploy.yml`：GitHub Pages 手动备援。

原目录 `_category_.json`、`.vitepress/sidebar.ts` 不再参与新站。新增 Markdown 由对应 `.nav.yml` 的 `"*"` 自动发现。

## 二、已完成且有日志支持的验证

| 项目 | 结果 |
| --- | --- |
| Zensical 0.1.0 安装和 `--strict` 构建 | PASS |
| awesome-nav 新建 Markdown 自动收录 | PASS |
| 搜索索引中中文、STM32、RTOS、NTC 关键词 | PASS |
| Chrome 浏览器桌面/手机、Mermaid、NTC 搜索 | PASS |
| 三个独立 HTML 工具与 Node.js 20 项回归测试 | PASS |
| VitePress 历史 `.html` 跳转 | PASS，构建自动生成兼容页 |
| 网页导航及静态资源审计 | PASS，未解析本地引用为 0 |
| Sitemap、robots.txt、404 和工具 canonical | PASS，主站 URL 为 `www.stark1898y.cc` |
| Pages CMS 真实新建草稿和修改正文 | PASS，产生真实 GitHub 提交 |
| Pages CMS 真实上传 PNG 图片 | PASS，两张 PNG 均进入构建产物 |
| 草稿不进入博客首页及搜索 | PASS |
| CMS 风格已发布文章、图片路径 CI 模拟 | PASS |

相关历史构建：[迁移清理后完整成功构建](https://github.com/stark1898y/stark1898y.github.io/actions/runs/42325813717)。

Pages CMS 测试文章 `pages-cms-test.md`、`first-draft.md` 和两张 PNG 已从重构分支移除，保留 Git 历史供审计；`content/blog/posts/` 与 `content/assets/uploads/` 使用 `.gitkeep` 保留空目录。公开仓库中即使是 `draft: true` 的 Markdown/媒体，也不具备隐私保护。

## 三、托管方案变更说明

原计划使用 GitHub Pages 作为生产托管，实际核对后发现现有网站与自定义域名已部署在 Vercel，而 GitHub Pages 报 `InvalidCNAMEError`。

最终调整为：**保留 Vercel 正式托管、域名不迁移；GitHub Pages 自动部署改为手动备用**。这样保留 PR Preview、历史部署回滚、分析等 Vercel 特性，也避免一份站点同时在两个平台上争用正式域名。

`vercel.json` 设置 `framework: null`、Python 安装、`site/` 产物目录及目录末尾斜杠。使用 `scripts/zensical/build_site.py` 与 GitHub Actions 共用生产构建流程。

**这只是已提交的配置；Vercel 真实 Preview 是否 Ready 需要另外查看部署日志才能确认。** 不应将 GitHub Actions 成功当作 Vercel 成功。

## 四、上线前检查和回滚

主站旧 VitePress `main` 基线：`7126143f26514a3e3b4c45c7f52d84c51b46ac1d`。

上线前：先推送 Tag `site-vitepress-pre-zensical-20261107`（具体命令见 [Vercel 部署文档](hosting-vercel.md)）；再确认 Vercel Preview 中的所有关键页面和工具；最后审核合并 PR 并等待 Vercel `main` Production 部署成功。

- [x] 原始文章、图片、工具目录迁移并清理重复源码。
- [x] 本地与 CI 构建、浏览器、搜索、Mermaid、Sitemap 等测试。
- [x] CMS 实际在线编辑及图片上传。
- [x] Vercel 构建配置与 GitHub Pages 手动备用配置已提交。
- [ ] Vercel Preview 真实构建日志与页面访问验收。
- [ ] Vercel Production Branch、根目录和域名配置核对。
- [ ] 远端备份 Tag 已推送。
- [ ] PR #1 审核后正式合并。
- [ ] 正式域名上的旧文章、浏览器工具、SEO、Sitemap、404 复核。

**重要：** README 的 `main` 版本目前仍对应旧 VitePress 生产代码，这是正常的。只有 PR 合并后，`main/README.md` 才会同步更新为本次新架构说明。
