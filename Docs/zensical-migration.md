# 个人网站 Zensical + Pages CMS 迁移工作记录

> 状态：阶段二，Zensical 已在 PR 通过构建及 Chrome 冒烟测试；`main` 正式站点仍由 VitePress 部署。

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
