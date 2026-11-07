# 个人网站 Zensical + Pages CMS 迁移工作记录

> 状态：阶段四，Pages CMS 在线新建草稿已由真实提交验证；正式网站仍在 main 运行 VitePress，PR #1 保持 Draft。

## 技术决策

- 网站：Zensical（当前锁定 0.1.0）+ GitHub Pages。
- 文章编辑：Pages CMS；复杂技术文档使用 Markdown 源码模式。
- 博客：Zensical 内置 blog 插件，草稿不发布。
- 导航：Zensical 原生 awesome-nav，每目录 `.nav.yml`，不用旧 `.vitepress/sidebar.ts` 或 `_category_.json`。
- 工具：旧 `public/dev-tools/<tool>/index.html` 在构建后复制到 `site/dev-tools/<tool>/index.html`。
- 原站：`main` 的 VitePress 工作流保持不变；测试通过后才替换。

## 内容目录

- `content/docs/` 对应原 `docs/`。
- `content/open-source/` 对应原 `open-source/`。
- `content/dev-tools/` 对应原 `dev-tools/`。
- `content/blog/posts/` 为新博客文章目录。
- 旧 `_category_.json` 暂保留在旧目录，迁移后不再作为导航来源。

## 导航维护

每个目录的 `.nav.yml` 包含中文 `title` 与 `nav`。其中 `"*"` 自动匹配新增页面；新分类应在相应目录中增加一个 `.nav.yml`。

根导航 `content/.nav.yml` 只列出主要栏目；别在 `zensical.toml` 中写重复的 `nav`。

## 本地验证

```powershell
python -m pip install -r requirements-site.txt
zensical serve
zensical build --clean --strict
python scripts/zensical/restore_tools.py
python scripts/zensical/check_output.py
python scripts/zensical/audit_site.py
```

## 已知风险与上线门槛

1. 旧 VitePress 特有 Frontmatter、HTML 容器、Mermaid 需测试实际渲染。旧首页使用 Vue/VitePress 的 `layout: home`，因此新首页单独编写。
2. 旧文档 URL 与 Zensical 默认的目录 URL 是否完全一致尚未逐条验证；正式上线前需要 URL 对照清单及必要的重定向。
3. Python Markdown 与 VitePress Markdown 的锚点规则可能不同，需检查站内锚点。
4. Zensical 的 instant navigation 先不启用，以避免原有静态 HTML 工具被 SPA 路由拦截。
5. Pages CMS 需要实际完成 GitHub 授权和文章读写验收；复杂 Markdown 不应直接用富文本模式覆盖原文。
6. 已通过 GitHub Actions 实际安装 Zensical 并构建；浏览器测试还需要检查中文字体、工具交互以及 Pages CMS 的真实 GitHub 授权。
7. `main` 原有 Pages 部署流程不得在 PR 验证前改动。

## 验收标准

- 导航（含新增文件自动入导航）、博客、搜索、Mermaid、中文显示正常。
- 原三个独立开发工具可用，旧常用 URL 仍能访问。
- Pages CMS 可新建/编辑文章并上传图片；文章 Frontmatter 与正文无误。
- 严格构建、站内链接与输出文件检查通过（已加入 CI）。
- 桌面和移动端都能使用，检查 Sitemap 和域名。
- 审核 PR 后单独切换部署；保留可回滚的 Git 基线。

## 阶段二已实现（2026-11-06）

- Pages CMS 使用独立博客文章集合（标题、slug、日期、草稿、分类、摘要、正文），新建文章默认草稿。
- 技术知识库和开源项目在 CMS 中采用原始 Markdown 编辑器；禁用重命名和删除，避免意外破坏 URL。
- 媒体上传目录为 `content/assets/uploads/`，公开路径为 `/assets/uploads/`。
- 已转换知识库简介中的 VitePress 提示框语法；其它特殊格式继续抽查。
- Zensical 官网原生 Emoji 扩展用于首页图标；根及主要子目录恢复 `"*"` 通配符以支持新增文章自动发现。
- 已新增 `scripts/zensical/audit_site.py`：检查生成 HTML 的本地链接与资源引用，结果写入 `artifacts/site-audit.json`。
- 已新增 `scripts/zensical/smoke_browser.py`：GitHub Actions 的 Chrome 自动打开首页、知识库、博客和项目页，测试手机端横向溢出及三个工具页面。
- CI 通过 `actions/upload-artifact@v4` 上传预览压缩包、审计结果与桌面/手机截图；**不会发布到正式域名**。

### 已经观察到的真实测试结果

- GitHub Actions 构建成功，静态工具复制和关键输出检查通过。
- 扫描 79 个 HTML 页面、7,103 个本地引用，未发现未解析链接。
- Chrome 冒烟测试已通过 5 个主要路由、博客草稿不公开、移动端无横向溢出、Base64 转换和 JSON/时间戳工具加载。
- 第一次 CI 截图的中文为方框，是 Runner 缺少 CJK 字体。已增加 Noto CJK 字体安装，需以最新一轮截图为准。

### 在线编辑验收（需账户持有人操作）

1. 访问 https://app.pagescms.org/ ，使用 GitHub 账户登录。
2. 安装 Pages CMS GitHub App 时，**只授权当前 `stark1898y.github.io` 仓库**。
3. 选择 `refactor/zensical-pagescms-v1` 分支（如果 UI 允许切换），先不要对正式 `main` 编辑。
4. 在博客新建草稿，填写英文 `slug`、发布日期、中文标题，加入一段文字和一张上传图片。
5. 保存后查看分支提交及生成的 Markdown。确认草稿不公开，再取消 `draft` 验证博客列表，最后清理测试文章。
6. 不要用富文本编辑器保存现有复杂技术文章；对 Mermaid、HTML、代码块使用源码编辑与 Git Diff 审核。

### 剩余问题

- 真实浏览器中文搜索词与搜索高亮结果需要进一步测试。
- CMS 授权和上传操作必须实际验收，不能仅凭配置文件视为成功。
- 旧 URL 与导航锚点需逐项抽查；现阶段自动校验只能证明构建文件及普通链接存在。
- 线上切换前应更新 Zensical `edit_uri` 为 `edit/main/content/`，准备回滚 Tag，然后由审核者合并草稿 PR。

## 阶段三：迁移兼容、页面与搜索（2026-11-06）

- 首页采用独立 `content/index.md` 和 `content/stylesheets/home.css`，保留技术知识库、博客、开源项目和浏览器工具入口；隐藏首页侧边目录以扩大阅读空间。
- `zensical.toml` 新增 `extra_css`，首页 CSS 类以 `stark-` 为前缀，避免污染普通文档。
- `.pages.yml` 已按官方文档将博客后台日期排序改成 `view.sort: [date, title]` 与 `view.default.sort/order`。
- 迁移兼容脚本 `scripts/zensical/restore_legacy_urls.py` 为旧版非首页文章生成 `.html` 轻量重定向，保留 URL 查询参数和锚点，防止历史分享地址失效。
- `scripts/zensical/check_output.py` 检查 `search.json` 是否索引硬件设计、STM32、RTOS、NTC 等术语，同时确保测试草稿未进入索引。
- Chrome 冒烟测试新增旧 `.html` 跳转、Mermaid 动态图表转换以及浏览器搜索结果交互测试。
- GitHub Actions 的普通 PR 测试不再反复安装中文字体；需要查看含中文字形的 CI 截图时，可以手动触发带 CJK 字体安装的工作流。
- `scripts/zensical/restore_tools.py` 为静态 HTML 工具加入网站 SVG favicon 引用，避免旧站工具页面没有站点图标。
- 测试采用自动化 PR 构建，不会发布到实际自定义域名，且所有正式部署控制仍归原 `main` 工作流。

### 上线前仍然必须人工验收

- [ ] 用本人 GitHub 登录 Pages CMS，确认能够切换到测试分支、新建草稿、修改正文和上传图片；检查 Git 差异是否保留代码块与 Markdown。
- [ ] 浏览器验证搜索中文分词、结果链接点击和移动端搜索入口；静态 `search.json` 检查不能完全替代实测。
- [ ] 验证已分享的站内旧 URL、`.html` 和锚点；当前生成的是静态跳转，不依赖服务器端 301。
- [ ] 检查现有项目 iframe、引用图、复杂旧表格与 Mermaid 混排文档。
- [ ] 正式部署之前锁定 Zensical 版本、验证 Sitemap、域名和回滚 Tag；改 `edit_uri` 为主分支。
- [ ] 旧 VitePress 源目录在验收通过后再移除，不得提前清理。


## 阶段四：Pages CMS 实际接入与生产构建预备（2026-11-07）

### 已确认事项

- **GitHub 在线编辑已真正成功：** 用户使用 Pages CMS 创建了 `content/blog/posts/pages-cms-test.md`，提交 `f95864f3d75e45b189c9ffadb6228c55108e3a54`，提交标题为 `Create content/blog/posts/pages-cms-test.md (via Pages CMS)`。
- 文件 Frontmatter 含 `title`、`slug`、`date`、`draft: true`、`description`，格式与博客配置一致。
- GitHub Actions `42323815842` 成功；下载的 Zensical 构建产物确认该草稿未进入博客首页和 `search.json`，也未生成独立文章页面。
- 新增 `scripts/zensical/check_blog_publish.py`：在 CI 工作目录临时建立与 Pages CMS 相同格式的已发布文章和 SVG 图片，严格构建后核对博客列表、独立 URL、搜索索引、资源路径；临时文件不进入 Git 历史。
- 新增动态草稿泄露检查：每次构建读取当前 `content/blog/posts/` 下全部 `draft: true` 文章，而非仅检查固定测试标题。
- 固定文章 URL 为 `/blog/{slug}/`，不把发布日期编码到永久链接中；已有文章的 `slug` 仍应保持稳定。
- `.github/workflows/deploy.yml` 已在本重构分支预先改为 Zensical 严格构建、兼容旧链接和 GitHub Pages 部署。由于 `main` 尚未合并本 PR，**正式站点没有切换**。
- `README.md` 更新为迁移完成后的 Zensical 开发、构建、在线编辑和维护说明。

### 草稿隐私提醒

`draft: true` 仅表示**不进入网站发布与搜索索引**。本 GitHub 仓库为公开仓库，源 Markdown 仍可在 GitHub 上查看；任何公司内部资料、密码、Token 等敏感内容都不能保存到公共草稿。Pages CMS 的草稿字段帮助说明已明确提示。

### 需要用户完成的最后一组 CMS 验收

- [x] GitHub 授权后能在 **重构分支** 使用 Pages CMS 新建并保存博客草稿。
- [x] GitHub 收到带有 `(via Pages CMS)` 的真实提交且触发 Zensical CI。
- [x] 草稿从正式构建输出及搜索索引中排除。
- [x] CI 使用 Pages CMS 文章结构临时验证“取消草稿后发布”和图片路径。
- [x] **真实修改已有文章**：Pages CMS 已保存正文 `第二次编辑验证成功`，提交 `aa59d98b9476eef036985a78654104b88eb22566`，原 Frontmatter 和草稿状态均保留。
- [x] **真实上传图片**：Pages CMS 先后上传 `image.png`（7,062 字节）和 `image-1.png`（11,828 字节）；文章引用 `/assets/uploads/image.png`，生成站点产物确认两张 PNG 均存在且格式正常。`image-1.png` 未被文章引用，最终清理测试文件时再处理。
- [ ] 可选：将该测试文章在分支上切换为 `draft: false`，确认页面与搜索出现在**预览构建产物**中；随后改回 `draft: true` 或删除测试文章。
- [ ] 清点所有历史 URL 和复杂文档效果，必要时处理额外跳转。
- [ ] 经人工审阅后，创建正式版本回滚 Tag，再合并 PR #1 上线。

### 本阶段相关链接

- PR：<https://github.com/stark1898y/stark1898y.github.io/pull/1>
- 实际 Pages CMS 写入提交：<https://github.com/stark1898y/stark1898y.github.io/commit/f95864f3d75e45b189c9ffadb6228c55108e3a54>
- CMS 写入后的成功构建：<https://github.com/stark1898y/stark1898y.github.io/actions/runs/42323815842>

### 2026-11-07 真实编辑与媒体上传验收

- 2026-11-07 09:33（UTC+8），用户通过 Pages CMS 新增两张真实 PNG 并更新 `pages-cms-test.md`。
- 对应提交：上传 `image.png`：`ef2bcfd2abcd2e02aa35b38611e38d18b2b989d4`；上传 `image-1.png`：`37d677c41e87a0caf8483e3e6eabedf000d5beef`；文章编辑：`aa59d98b9476eef036985a78654104b88eb22566`。
- 文章仍为 `draft: true`，新增文字 `第二次编辑验证成功`，图片引用 `![image.png](/assets/uploads/image.png)`。
- GitHub Actions 运行 `42324698247` 已通过全部构建、链接和浏览器测试。
- 已下载检查 `zensical-preview-50` 构建产物：`site/assets/uploads/image.png` 和 `image-1.png` 都存在且有 PNG 文件头；搜索索引没有草稿标题，站点中未生成 `pages-cms-test` 文章页。
- **隐私边界**：草稿隐藏仅作用于博客文章和搜索。上传到 `content/assets/uploads/` 的图片本身会进入静态网站产物，即使对应文章仍是草稿，也可能通过完整 URL 直接访问；公开仓库中的媒体文件更是对外可见。不要上传任何不打算公开的图片或数据。
- 阶段四实际 CMS 验收已完成：授权、新建、再次编辑、上传媒体、构建和草稿排除。尚需生产上线前旧链接/复杂文档抽查、清理测试文章和无用图片、创建回滚 Tag 与域名确认。

