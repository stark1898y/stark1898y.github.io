# Stark1898y 网站重构：迁移与验收记录

> 最新决策：**Zensical + 原生 awesome-nav + Pages CMS + Vercel 正式部署，GitHub Actions CI，GitHub Pages 手动备用**。
> **2026-11-07 已正式上线**：[PR #1](https://github.com/stark1898y/stark1898y.github.io/pull/1) 已 Squash Merge 到 `main`（提交 `b11323561504`），Vercel Production Ready，正式域名为 <https://www.stark1898y.cc/>。以下保留迁移过程和历史验收记录。

## 一、迁移范围

从 VitePress 迁移原知识库、项目说明和开发工具首页。73 篇 Markdown 与配套项目图片复制到 `content/`；按原有分类建立 29 份 `.nav.yml`。原 `.vitepress/`、TypeScript 侧边栏、旧副本和 `package.json` / `package-lock.json` 已从正式 `main` 清理，旧版本在 Git 历史和备份 Tag 中保留。

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

**已验证**：重构分支 Preview Ready，合并后的 Production 亦 Ready。此前的环境兼容问题与修复记录见部署文档。

## 四、上线前检查和回滚

主站旧 VitePress `main` 基线：`7126143f26514a3e3b4c45c7f52d84c51b46ac1d`。

旧站回滚 Tag `site-vitepress-pre-zensical-20261107` 已确认推送并指向正确的 VitePress 基线提交。2026-11-07 PR #1 已合并，新版 Production 部署 Ready。

- [x] 原始文章、图片、工具目录迁移并清理重复源码。
- [x] 本地与 CI 构建、浏览器、搜索、Mermaid、Sitemap 等测试。
- [x] CMS 实际在线编辑及图片上传。
- [x] Vercel 构建配置与 GitHub Pages 手动备用配置已提交。
- [x] Vercel Preview 真实构建日志与页面访问验收。
- [x] Vercel Production 关联 `main`，正式域名已验证且实际提供新版站点。
- [x] 远端备份 Tag 已推送且 Git 对象目标正确。
- [x] PR #1 已正式合并：`b11323561504`。
- [x] 正式域名上的首页、文档、三项工具、旧文章兼容 URL、robots、Sitemap 和统计 API 实际 HTTP 请求通过。404 等页面由构建与 CI 检查，仍可人工抽查。

**当前基线**：`main` 已采用 Zensical；README 与开发文档已更新。上线后写作使用 Pages CMS，构建和正式托管使用 Vercel。

## 阶段六：网站页脚与访客统计（2026-11-07）

- 在 Zensical 主题已有版权栏追加「建站至今 N 天」，以 GitHub 仓库创建时间 `2022-01-12T05:49:47Z` 作为建站起点，不将它等同于服务器实际可用率或无故障运行时间。
- 通过 `zensical.toml` 的 HTML `copyright`、`extra_javascript` 和 `extra_css` 实现，保留主题原生页脚，不复制整份模板。
- `content/javascripts/footer.js` 无 Cookies、不访问第三方服务器；按访问者当前时间计算天数。起点可在配置中的 `data-stark-site-since` 修改。
- Chrome 冒烟测试增加首页和文档页脚的数值检查。
- **访客人数暂不显示虚构数据**。优先推荐 Vercel Web Analytics；Hobby 仅保证约一个月的数据查询窗口，适合展示「近 30 日访客 / 浏览量」而非伪称「历史累计访客」。公开展示指标需要安全的服务端代理或定时生成统计数据，Token 不得放在网页里。详见 [页脚统计方案](footer-statistics.md)。

## 第七阶段：Vercel Preview 实测及统计 API 兼容检查（2026-11-07）

- 通过已授权的 Vercel 连接访问最新 Preview，首页、知识库、JSON 格式化工具、时间戳工具、历史 `.html` 跳转页面、`search.json` 等返回有效内容。
- `/api/site-stats` 实际运行于 Vercel Preview Function；因 Token 仅配置在 Production，返回 `statistics_not_configured`（符合保密隔离设计），不是构建错误。
- Web Analytics 官方脚本 `/_vercel/insights/script.js` 在预览部署返回 200，但实际追踪代码仅在 `www.stark1898y.cc` 生产域名执行，不计入 Preview 流量。
- 阅读 Vercel 官方 visits/count REST API 文档后，将统计请求 `since/until` 改成 ISO 8601（UTC）格式，覆盖日期格式测试；同时修复只修改 `api/**`、`tests/**` 时 CI 不触发的问题。
- 最终上线前仍需在浏览器人工检查 Vercel Preview 视觉效果，以及新生产部署中 Token 对 Analytics API 的认证是否成功。

## 第八阶段：正式上线验收（2026-11-07）

- [x] [PR #1](https://github.com/stark1898y/stark1898y.github.io/pull/1) 已合并到 `main`：`b113235615043a2950c10d7ecc910ece2f3d22df`。
- [x] Vercel Production 已部署该提交，状态 Ready；没有修改自定义域名 DNS。
- [x] 通过正式域名实际检查：首页、知识库、博客、Base64/JSON/时间戳工具、历史 `.html` 地址、Sitemap、robots、Analytics 脚本及 `/api/site-stats` 均为 HTTP 200。
- [x] 页脚日期保持 GitHub 仓库创建时间 `2022-01-12T05:49:47Z`；日夜模式的生产页面配置已生效。
- [x] Production `/api/site-stats` 返回 `{\"visitors\":0,\"pageviews\":0,\"periodDays\":30}`，表示 API 鉴权与结构校验成功，但还需观察实际浏览器事件是否持续收集。
- [ ] 访问者真实浏览器最终检查手机端布局、主题切换、搜索操作和三项独立工具。
- [ ] 在 Vercel Analytics 中确认访问事件开始累计，必要时等待统计缓存过期。
