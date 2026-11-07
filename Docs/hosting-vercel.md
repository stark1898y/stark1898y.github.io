# Vercel 正式部署与 GitHub 备用发布

> 2026-11-07 更新。本项目使用 **Vercel 正式托管、GitHub 存储源码、Pages CMS 在线编辑、GitHub Actions 做 CI**。GitHub Pages 仅作为可选手动备援。

## 为什么保留 Vercel

当前生产站 `https://www.stark1898y.cc/` 已绑定到 Vercel 项目。Vercel 可直接为 GitHub PR 生成 Preview URL、部署生产分支并从历史部署快速恢复；同时提供分析、速度洞察、预览保护等能力（可能受当前套餐额度限制）。对于现阶段的纯静态 Zensical 站点，**不需要额外数据库或 Functions**。

GitHub Pages 如果不作为生产入口，不应要求 DNS 指向 `stark1898y.github.io`。GitHub Pages 设置里出现 `InvalidCNAMEError` 是域名未指向 GitHub Pages 的表现；只要继续由 Vercel 托管，这个提示可以暂时不处理。

## 构建配置

根目录 `vercel.json` 已设置：

| 设置 | 值 |
| --- | --- |
| Framework Preset | `Other`（`framework: null`） |
| Install Command | `uv venv --python 3.12 .venv && uv pip install --python .venv/bin/python -r requirements-site.txt` |
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

已在重构分支修改 `vercel.json`：

```json
{
  "installCommand": "uv venv --python 3.12 .venv && uv pip install --python .venv/bin/python -r requirements-site.txt",
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

**后续仍需人工打开 Preview URL 检查网页效果、工具交互及旧链接。** Vercel 部署状态成功不代表完整浏览器验收已经完成；PR 保持 Draft，`main` 和线上正式域名不动。


## 上线前备份

迁移前 VitePress 主分支提交：

```text
7126143f26514a3e3b4c45c7f52d84c51b46ac1d
```

建议本地执行并推送 Tag（**当前尚未代用户创建**）：

```powershell
git fetch origin
git tag -a site-vitepress-pre-zensical-20261107 7126143f26514a3e3b4c45c7f52d84c51b46ac1d -m "VitePress production before Zensical"
git push origin site-vitepress-pre-zensical-20261107
git ls-remote --tags origin site-vitepress-pre-zensical-20261107
```

## 回滚顺序

**优先：** 在 Vercel → Deployments 找到旧的 Ready 生产部署，按当前 Vercel UI 提供的 Promote / Rollback 恢复之前的线上版本。该操作通常不要求重新更改 DNS。

**必要时：** 基于备份 Tag 恢复原 `package.json`、`.vitepress/`、旧内容与部署配置，创建专用修复 PR 回 `main`，而不是在 `main` 上强制重置提交。然后通过 Vercel Git 部署恢复生产。

**GitHub Pages 手动备用：** `.github/workflows/deploy.yml` 只提供 `workflow_dispatch`。即使手动运行成功，现有域名也不会自动切到 GitHub Pages，需要另外规划 DNS；此流程不是主站的一部分。

## 上线前核对清单

- [x] GitHub Actions 严格构建、awesome-nav、草稿、中文搜索、Mermaid 和浏览器工具通过。
- [x] Pages CMS 真实新建 / 编辑 / PNG 上传、测试数据清理。
- [x] Vercel 构建文件及同源构建脚本已提交到重构分支。
- [ ] Vercel 重构分支 **Preview 真实部署为 Ready 并人工打开验证**。
- [ ] Vercel 项目 Settings 确认 Production Branch、根目录、域名和相关配置。
- [ ] 回滚 Tag 已推送远端。
- [ ] 通过 PR #1 的最终审核后再合并到 `main`；合并后检查生产部署及访问地址。
