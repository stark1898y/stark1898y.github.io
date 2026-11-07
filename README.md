# Stark1898y 技术网站

**嵌入式技术知识库 · 开发日志 · 开源项目 · 在线工具**

- 网站：<https://www.stark1898y.cc/>
- 代码和文档：[stark1898y/stark1898y.github.io](https://github.com/stark1898y/stark1898y.github.io)
- 在线编辑：[Pages CMS](https://app.pagescms.org/)
- 技术栈：[Zensical](https://zensical.org/) + 原生 `awesome-nav` + Pages CMS + Vercel

> **正式上线（2026-11-07）**：Zensical 已通过 [PR #1](https://github.com/stark1898y/stark1898y.github.io/pull/1) 合并到 `main`（提交 `b11323561504`），Vercel Production 已成功部署，正式域名为 <https://www.stark1898y.cc/>。旧 VitePress 的备份 Tag 已保留。

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

### CI 运行环境（2026-11-07）

GitHub Actions 已明确采用 `ubuntu-26.04`（不是随时间变化的 `ubuntu-latest`），`actions/setup-python@v7` 设置 Python 3.12，`actions/setup-node@v7` 设置 Node.js 24。浏览器测试使用 Ubuntu 26.04 运行器预装的 Google Chrome 和固定版本的 Playwright 1.56.0，并校验操作系统与运行时版本。手动截图审查工作流可额外安装 Noto CJK 字体。

Vercel 正式构建继续通过 `uv` 虚拟环境使用 Python 3.12；这是与 GitHub CI 分离的构建机器，不受 Actions Ubuntu 版本影响。`zensical==0.1.0` 仍锁定，不在同一次 OS 迁移中升级框架。

## 二、开发与预览

建议 Python 3.12（CI 使用该版本），只需 Python 即可构建网站。Node.js 24 LTS 主要用于三个独立 HTML 工具及统计 API 的测试。

```powershell
git clone https://github.com/stark1898y/stark1898y.github.io.git
cd stark1898y.github.io
git switch main
git pull --ff-only origin main

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

## 五、日常发布、验收与回滚

网站已经通过 Vercel 正式部署，后续无需再次合并原迁移 PR。推荐继续使用功能分支与 PR 工作流：

1. 在功能分支或 Pages CMS 选定的分支修改 Markdown、资源或工具源码，等待 GitHub Actions CI 和 Vercel Preview 通过。
2. 审阅 PR，合并到 `main` 后由 Vercel Git Integration 自动进行 Production 部署；不用修改 DNS，也不要同时启用 GitHub Pages 自动部署。
3. 发布后抽查首页、知识库、博客、三个独立工具、日夜模式、搜索、旧 `.html` 地址和 Sitemap。
4. Pages CMS 文章设置 `draft: false` 才会被 Zensical 发布；该标志不保证公开 GitHub 仓库里的文件保密。
5. 若生产发生问题，先在 Vercel Deployments 中回滚/重新提升上一稳定部署；如需恢复原 VitePress，使用备份 Tag `site-vitepress-pre-zensical-20261107` 创建恢复 PR，不强制重置 `main`。

生产站点首次正式部署：`b113235615043a2950c10d7ecc910ece2f3d22df`。已直接验证首页、博客、知识库、三个在线工具、历史兼容链接、robots、Sitemap 与 `/api/site-stats` 全部 HTTP 200。统计 API 暂返回近 30 天已采集访客与浏览量均为 0；实际采集事件是否到达 Vercel Analytics 需持续观察。

详细运维和历史验收：[部署与回滚说明](Docs/hosting-vercel.md) · [迁移记录](Docs/zensical-migration.md)。
