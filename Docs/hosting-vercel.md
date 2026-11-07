# Vercel 正式部署与 GitHub 备用发布

> 2026-11-07 更新。本项目使用 **Vercel 正式托管、GitHub 存储源码、Pages CMS 在线编辑、GitHub Actions 做 CI**。GitHub Pages 仅作为可选手动备援。

## 为什么保留 Vercel

当前生产站 `https://www.stark1898y.cc/` 已绑定到 Vercel 项目。Vercel 可直接为 GitHub PR 生成 Preview URL、部署生产分支并从历史部署快速恢复；同时提供分析、速度洞察、预览保护等能力（可能受当前套餐额度限制）。网站内容仍为静态生成，不需要数据库；仅 `api/site-stats.js` 使用一项只读 Vercel Function 来查询访客统计。

GitHub Pages 如果不作为生产入口，不应要求 DNS 指向 `stark1898y.github.io`。GitHub Pages 设置里出现 `InvalidCNAMEError` 是域名未指向 GitHub Pages 的表现；只要继续由 Vercel 托管，这个提示可以暂时不处理。

## 构建和验证环境基线（2026-11-07）

| 环境 | 固定版本 | 用途 |
| --- | --- | --- |
| GitHub Actions | Ubuntu 26.04 LTS x64 | PR 自动构建和 GitHub Pages 手动备用 |
| Python | 3.12（setup-python@v7） | Zensical、Pages CMS 文章及链接检查 |
| Node.js | 24（setup-node@v7） | 独立 HTML 工具和统计 API 单元测试 |
| Chrome | Ubuntu 26.04 runner 自带 Chrome | Playwright 桌面/移动端冒烟测试 |
| Playwright | 1.56.0 | 与现有冒烟测试保持一致 |
| Zensical | 0.1.0（requirements-site.txt） | 保持已验证的构建基线 |
| Vercel | Python 3.12 项目专属 uv 虚拟环境 | 正式站和 Preview 部署 |

GitHub Actions 不依赖操作系统默认的 Python 3.14 或 Node 24 预装路径，显式安装/选择目标版本。工作流会记录实际 OS/Python/Node/Chrome 版本并验证主版本，防止环境静默漂移。Vercel 自身的云运行环境与 GitHub Actions 不是同一台机器，不为升级 Ubuntu 而修改 Vercel 配置。

### uv 硬链接告警处理（2026-11-07）

Vercel 上安装依赖时可能出现 `Failed to hardlink files; falling back to full copy`。这是 uv 缓存与 `.venv` 文件系统不适合使用硬链接时的正常回退，**不会影响网站构建结果**。已经为 Vercel 的 `installCommand` 显式指定 `uv pip install --link-mode=copy`，避免先尝试硬链接而产生冗余告警。

这一选项是指定复制模式，**并不保证加速安装**；继续使用 uv 的缓存，不使用 `--break-system-packages`，也不更改 GitHub CI 及 Python 版本。

## 构建配置

根目录 `vercel.json` 已设置：

| 设置 | 值 |
| --- | --- |
| Framework Preset | `Other`（`framework: null`） |
| Install Command | `uv venv --python 3.12 .venv && uv pip install --link-mode=copy --python .venv/bin/python -r requirements-site.txt` |
| Build Command | `.venv/bin/python scripts/zensical/build_site.py` |
| Output Directory | `site` |
| Trailing Slash | `true` |
| Clean URLs | `false`（保留 VitePress 旧 `.html` 兼容路径） |

`scripts/zensical/build_site.py` 依次执行 Zensical 严格构建、HTML 工具复制、历史地址跳转页、Sitemap/robots 和站内链接校验。与 GitHub Actions PR 检查使用相同脚本，减少环境差异。

### Vercel 后台需要复核

进入 Vercel → 你的项目 → **Settings**：

1. **Git**：GitHub Repository 是 `stark1898y/stark1898y.github.io`；Production Branch 是 `main`；PR 预览正常生成。
2. **General / Build & Development Settings**：Root Directory 为仓库根目录 `./`；部署配置未被项目级旧 VitePress 自定义命令误覆盖。以部署日志实际出现 `zensical build` 为准。
3. **Domains**：继续保留 `www.stark1898y.cc`，不要移动 DNS 到 GitHub Pages。
4. **Deployments**：选择重构分支最近一次 Preview，确认其状态为 Ready，实际检查页面与三项 HTML 工具。

如果 Preview 构建失败，先阅读 Vercel Deployment Logs，检查 Python 及 `pip` 是否可用、依赖是否安装、输出目录 `site/` 是否存在；不要在未通过 Preview 前合并 PR。

## 自定义域名与 SEO

- 正式域名保持 `https://www.stark1898y.cc/`。
- Canonical、`site_url`、`robots.txt`、`sitemap.xml` 和工具 HTML canonical 全部统一为该域名。
- `trailingSlash: true` 匹配 Zensical `/docs/.../` 页面，同时文件型旧 URL（`.html`）不强制追加斜杠。
- GitHub Pages 中的自定义域名警告不应触发将 `www` 的 CNAME 改到 GitHub，否则会将现有正式网站从 Vercel 移走。
- 如需以后改用 GitHub Pages 正式托管，可在明确的迁移窗口切换，届时才调整 DNS。

## Pages CMS 发布链路

Pages CMS 修改 Markdown/图片后写入 GitHub；GitHub Actions 验证内容。文件提交到 `main` 后，Vercel Git Integration 自动构建并部署到现有域名。普通测试分支只生成 Vercel Preview，不影响生产。

`draft: true` 不发布文章，但公开 GitHub 源文件和媒体仍然可见。

## Vercel Preview 构建故障与修复（2026-11-07）

**已定位根因：** Vercel 使用由 `uv` 管理的 Python，原先 `python3 -m pip install -r requirements-site.txt` 尝试修改系统环境，被 PEP 668 拒绝（`externally-managed-environment`）。错误发生在安装依赖阶段，Zensical 尚未启动。

现已在 `main` 使用下列 `vercel.json` 配置：

```json
{
  "installCommand": "uv venv --python 3.12 .venv && uv pip install --link-mode=copy --python .venv/bin/python -r requirements-site.txt",
  "buildCommand": ".venv/bin/python scripts/zensical/build_site.py",
  "outputDirectory": "site"
}
```

构建脚本通过运行中 Python 解释器查找同目录的 `zensical` 命令，避免运行时误用系统 Python 或找不到虚拟环境中的可执行文件。CI 仍按原方式执行，两个环境共用同一个构建脚本。

- 项目级 `.venv/` 不修改 Vercel 的系统 Python。
- 使用 `uv` 管理环境和依赖，不使用 `--break-system-packages` 绕过 PEP 668。
- `--python 3.12` 与 GitHub Actions CI 一致。
- `.venv/` 已被 `.gitignore` 排除，不提交到 GitHub。

旧失败预览示例：<https://vercel.com/stark1898ys-projects/stark1898y-github-io/2CndGQfPUZ6CSK4nH8PqscC4yNQv>。

**部署验证已通过：** 修复提交 `a198d833` 对应的 Vercel Preview 在 GitHub 返回 `Deployment has completed`，后续 CI 配置修正提交 `51f0ddd1` 的 Vercel 部署也返回成功状态。

- 成功的 Vercel 部署：<https://vercel.com/stark1898ys-projects/stark1898y-github-io/4YUv7cRsTg2et5rwoF7Vcov1tXAM>
- GitHub CI 修正：`.github/workflows/zensical-check.yml` 同步校验 Vercel 的 `uv` 安装及 `.venv` 构建配置。

**该阶段已结束**：2026-11-07 PR #1 已正式合并，Production 构建成功。上线前的 Preview HTTP 检查与 Chrome 自动化测试均通过；今后的新 PR 继续先检查 Preview 再合并。


## 原 VitePress 备份与回滚

迁移前 VitePress 主分支提交：

```text
7126143f26514a3e3b4c45c7f52d84c51b46ac1d
```

**状态：已验收。** GitHub 远端已经存在注释 Tag `site-vitepress-pre-zensical-20261107`，Git Tag 对象 `31c0b91bf9b79315ff12c9e36f3e3224084e7336` 指向旧版 `main` 提交 `7126143f26514a3e3b4c45c7f52d84c51b46ac1d`。以下命令仅供日后核验或恢复，不要重复创建同名 Tag：

```powershell
git fetch origin
git fetch origin --tags
git show site-vitepress-pre-zensical-20261107 --no-patch
git ls-remote --tags origin site-vitepress-pre-zensical-20261107
```

## 回滚顺序

**优先：** 在 Vercel → Deployments 找到旧的 Ready 生产部署，按当前 Vercel UI 提供的 Promote / Rollback 恢复之前的线上版本。该操作通常不要求重新更改 DNS。

**必要时：** 基于备份 Tag 恢复原 `package.json`、`.vitepress/`、旧内容与部署配置，创建专用修复 PR 回 `main`，而不是在 `main` 上强制重置提交。然后通过 Vercel Git 部署恢复生产。

**GitHub Pages 手动备用：** `.github/workflows/deploy.yml` 只提供 `workflow_dispatch`。即使手动运行成功，现有域名也不会自动切到 GitHub Pages，需要另外规划 DNS；此流程不是主站的一部分。

## 正式上线验收（2026-11-07）

- [x] GitHub Actions 严格构建、awesome-nav、草稿、中文搜索、Mermaid 和浏览器工具通过。
- [x] Pages CMS 真实新建 / 编辑 / PNG 上传、测试数据清理。
- [x] Vercel 构建文件及同源构建脚本已合并至 `main`。
- [x] Vercel Preview 部署为 Ready；已通过连接真实请求验证首页、知识库、两个工具、历史 `.html` 地址、`search.json` 和统计 Function（Preview 无 Token 时正常降级）。
- [ ] 最终仍需在实际浏览器中人工确认移动端布局与导航操作。
- [x] Vercel 生产部署实际来自 `main`；正式自定义域名 `www.stark1898y.cc` 已验证。
- [x] 回滚 Tag 已推送远端，并核对注释 Tag 最终目标提交。
- [x] PR #1 已于 2026-11-07 合并，Squash Merge SHA：`b113235615043a2950c10d7ecc910ece2f3d22df`。
- [x] 新 Production 部署 Ready；实际网站首页、博客、知识库、三个工具、旧 URL、Sitemap、robots.txt 和统计 API 均返回 HTTP 200。
- [ ] 实际浏览器人工体验移动端、日夜切换和表单交互；继续观察 Analytics 的生产访问事件是否开始累计。
