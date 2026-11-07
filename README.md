# Stark1898y 技术网站

**嵌入式技术知识库 · 开发日志 · 开源项目 · 在线工具**

- 网站：<https://www.stark1898y.cc/>
- 代码和文档：[stark1898y/stark1898y.github.io](https://github.com/stark1898y/stark1898y.github.io)
- 在线编辑：[Pages CMS](https://app.pagescms.org/)
- 技术栈：[Zensical](https://zensical.org/) + 原生 `awesome-nav` + Pages CMS + Vercel

> **迁移状态（2026-11-07）**：本文件位于 `refactor/zensical-pagescms-v1`，尚未合并到 `main`。目前线上仍为旧 VitePress 网站。先在 Vercel Preview 检查新站并审核 [PR #1](https://github.com/stark1898y/stark1898y.github.io/pull/1)，再安排正式发布。

## 一、网站架构与部署分工

| 平台 | 负责什么 | 是否正式生产部署 |
| --- | --- | --- |
| **GitHub** | Markdown/图片/代码的唯一源码仓库、PR、版本历史 | 不直接承载正式域名 |
| **Pages CMS** | 在浏览器中创建博客、编辑文章、上传图片并提交 GitHub | 不负责网站托管 |
| **GitHub Actions** | 构建校验、awesome-nav、搜索、链接、工具回归、Chrome 测试 | 不自动发布 GitHub Pages |
| **Vercel** | 构建 Zensical、分支/PR Preview、正式域名、CDN、HTTPS、回滚 | **唯一自动生产托管** |
| **GitHub Pages** | 仅保留手动触发的备用部署 | 平时不触发、无须修改 DNS |

生产域名 `www.stark1898y.cc` 继续由 Vercel 管理。**不要把 `www` 的 DNS 同时指向 Vercel 和 GitHub Pages。** GitHub Pages 中出现 `InvalidCNAMEError` 是因为目前 DNS 不指向 GitHub Pages，不代表 Vercel 正式站异常。暂不为解决 GitHub Pages 的提示而调整 DNS。

部署关系：

```text
Pages CMS ──保存 Markdown──┐
                          ▼
开发者 Git Push ───────> GitHub 仓库
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
        GitHub Actions              Vercel Git
        PR 构建与浏览器测试          分支/PR Preview
                                    main → Production
                                           │
                                           ▼
                                    www.stark1898y.cc
```

具体 Vercel 设置见 [部署与回滚说明](Docs/hosting-vercel.md)，页脚运行天数和访问人数接入说明见 [页脚统计](Docs/footer-statistics.md)，重构过程见 [迁移记录](Docs/zensical-migration.md)。

## 二、开发与预览

建议 Python 3.12（CI 使用该版本），只需 Python 即可构建网站。Node.js 22 主要用于三个独立 HTML 工具的测试。

```powershell
git clone https://github.com/stark1898y/stark1898y.github.io.git
cd stark1898y.github.io
git fetch origin
git switch refactor/zensical-pagescms-v1

python -m pip install -r requirements-site.txt
zensical serve
```

`zensical serve` 可实时预览 Markdown，但完整构建还会复制独立工具、恢复旧文章 URL、生成 Sitemap 并执行 SEO 和链接检查：

```powershell
python scripts/zensical/build_site.py
python -m http.server 8000 --directory site
```

打开 `http://localhost:8000/`。如需跑 Node 工具回归：

```powershell
node --test tests/*.test.mjs
```

**Vercel 使用同一份构建脚本**。仓库根目录 `vercel.json` 指定了 Other 框架、Python 安装命令、构建脚本以及静态产物 `site/`，不再执行旧 `npm run build`。PR 在 Vercel 的实际构建及预览仍需审核，GitHub Actions 成功不等于已经确认 Vercel 部署成功。

## 三、仓库目录

| 路径 | 作用 |
| --- | --- |
| `content/index.md` | 响应式首页 |
| `content/docs/` | 硬件、MCU、RTOS、Linux、软件架构等知识库 |
| `content/blog/posts/` | Pages CMS 管理的博客文章 |
| `content/open-source/` | 开源项目说明 |
| `content/dev-tools/` | 在线工具索引与教程 |
| `content/assets/uploads/` | 上传图片与下载附件 |
| `public/dev-tools/` | Base64、JSON、时间戳三个独立 HTML/JS 工具 |
| `content/stylesheets/` | 首页和页脚主题样式 |
| `content/javascripts/footer.js` | 页脚建站天数和真实访客/浏览量显示 |
| `content/javascripts/analytics.js` | 仅正式域名启用 Vercel Web Analytics |
| `api/site-stats.js` | Vercel Function：安全读取近 30 天汇总统计（不暴露 Token） |
| `scripts/zensical/` | 统一构建、兼容旧 URL、SEO、自动测试 |
| `zensical.toml` | 站点、主题及博客配置 |
| `vercel.json` | Vercel 部署配置 |
| `.pages.yml` | Pages CMS 在线编辑字段 |
| `.github/workflows/zensical-check.yml` | PR 验证 |
| `.github/workflows/deploy.yml` | 手动 GitHub Pages 备用部署 |

构建输出 `site/`、截图 `artifacts/`、`.vercel/` 等不提交仓库。

## 四、在线写作与导航

在 [Pages CMS](https://app.pagescms.org/) 使用 GitHub 账号登录，选择此仓库和编辑分支，打开「博客与开发日志」。新建文章填写标题、日期、唯一英文 `slug`；默认 `draft: true`，保存后不会进入网站与搜索索引。准备发布时将 `draft` 改为 `false`，并提交到正式 `main`。

**公开仓库的草稿不是私密文件**：GitHub 上的源 Markdown 仍可查看；上传的图片也可能直接通过静态文件 URL 访问。不要上传密码、Token、公司资料或其他保密信息。

复杂技术文档（Mermaid、代码、表格、HTML）建议使用 Markdown 源码方式编辑，避免富文本重排。

网站顶部提供 Zensical 原生 **太阳/月亮日夜模式开关**：首次访问跟随系统明暗偏好，手动切换后跨页面保持选择。该开关覆盖首页、知识库、博客和项目说明页；独立 HTML 工具保持各自的界面样式，不受 Zensical 主题切换控制。

导航使用目录中的 `.nav.yml`，例如：

```yaml
title: MCU 开发
nav:
  - index.md
  - stm32
  - ch32v
  - ble
  - "*"
```

`"*"` 自动收录未明确指定的新增文章，无需维护 TypeScript 侧边栏生成器。三个浏览器工具原地址 `/dev-tools/base64/`、`/dev-tools/json-formatter/`、`/dev-tools/timestamp-converter/` 保持不变。

Pages CMS 的**真实新建、再次编辑、PNG 上传与草稿排除**已经通过测试，相关测试文章/图片已从重构分支删除。

## 五、上线流程与回滚

1. 检查 GitHub [PR #1](https://github.com/stark1898y/stark1898y.github.io/pull/1) 所有检查通过，并在 Vercel 生成的 **Preview URL** 中实际打开首页、知识库、博客及三个工具。
2. 在 Vercel 项目 `Settings → General` 确认仓库根目录为 `./`，`Settings → Git` 确认 Production Branch 为 `main`；仓库 `vercel.json` 应覆盖构建命令及输出目录。
3. **已完成旧站备份**：远端注释 Tag [`site-vitepress-pre-zensical-20261107`](https://github.com/stark1898y/stark1898y.github.io/tree/site-vitepress-pre-zensical-20261107) 已确认存在，并准确指向旧 VitePress `main` 提交 `7126143f26514a3e3b4c45c7f52d84c51b46ac1d`。无需重复创建。
4. 确认自定义域名仍在 Vercel，HTTPS 正常，且 PR 预览无问题，再审核合并 PR。**不需要更改 DNS。**
5. Vercel 的 `main` 新部署成功后检查主页、图片、Mermaid、搜索、Sitemap、robots、404、旧 `.html` 文章和浏览器工具。
6. 发布出错时优先使用 Vercel Deployments → Promote/Rollback 恢复旧版本，或通过备份 Tag 在 GitHub 恢复旧站源码。

> 已提交的是 **重构分支**，不是正式上线。不要仅因 GitHub Actions 通过就直接合并，先确认实际的 Vercel Preview 部署结果。
