# 个人网站 Zensical + Pages CMS 迁移工作记录

> 状态：阶段一，独立分支验证；正式 `main` 仍由 VitePress 部署。

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
zensical build --clean
python scripts/zensical/restore_tools.py
python scripts/zensical/check_output.py
```

## 已知风险与上线门槛

1. 旧 VitePress 特有 Frontmatter、HTML 容器、Mermaid 需测试实际渲染。旧首页使用 Vue/VitePress 的 `layout: home`，因此新首页单独编写。
2. 旧文档 URL 与 Zensical 默认的目录 URL 是否完全一致尚未逐条验证；正式上线前需要 URL 对照清单及必要的重定向。
3. Python Markdown 与 VitePress Markdown 的锚点规则可能不同，需检查站内锚点。
4. Zensical 的 instant navigation 先不启用，以避免原有静态 HTML 工具被 SPA 路由拦截。
5. Pages CMS 需要实际完成 GitHub 授权和文章读写验收；复杂 Markdown 不应直接用富文本模式覆盖原文。
6. 当前环境无法直接安装 Zensical 执行真实构建；以 GitHub Actions 构建结果为准，不能仅凭源码推断通过。
7. `main` 原有 Pages 部署流程不得在 PR 验证前改动。

## 验收标准

- 导航（含新增文件自动入导航）、博客、搜索、Mermaid、中文显示正常。
- 原三个独立开发工具可用，旧常用 URL 仍能访问。
- Pages CMS 可新建/编辑文章并上传图片；文章 Frontmatter 与正文无误。
- 校验站内链接及输出文件，升级严格构建前清理旧坏链。
- 桌面和移动端都能使用，检查 Sitemap 和域名。
- 审核 PR 后单独切换部署；保留可回滚的 Git 基线。
