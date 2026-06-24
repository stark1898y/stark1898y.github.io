# 开源项目文档组织指南

## 目录结构

```
docs/open-source/
├── images/                          # 图片资源（按项目分目录）
│   ├── power-calculator/           # 功耗计算器图片
│   ├── gas-converter/              # 气体换算图片（示例）
│   └── <project-name>/             # 其他项目图片
├── power-calculator/               # 功耗计算器项目
│   ├── power-consume-calculator-guide.md  # 详细博客文章
│   └── ...                         # 其他参考资料
├── gas-converter.md                # 气体换算项目页面
├── power-calculator.md             # 功耗计算器项目页面
├── readme.md                       # 功耗计算器 README（参考）
└── README.md                       # 本指南
```

## AI 工作流程

### 1. 添加新开源项目

当您有新的开源项目需要添加到知识库时：

```bash
# 1. 创建项目目录
mkdir docs/open-source/<project-name>

# 2. 创建图片目录
mkdir docs/open-source/images/<project-name>

# 3. 复制相关文件到项目目录
# - README.md
# - 博客文章
# - 技术文档
# - 其他参考资料

# 4. 复制图片到图片目录
# - 截图
# - 图表
# - 架构图
```

### 2. AI 辅助写作流程

当您需要 AI 帮助撰写项目文档时：

1. **准备参考资料**

   - 将原始 README、博客文章等复制到 `docs/open-source/<project-name>/`
   - 将相关图片复制到 `docs/open-source/images/<project-name>/`
2. **提供上下文给 AI**

   - 告诉 AI 参考资料的位置
   - 说明需要生成的文档类型（项目页面、博客文章等）
   - 指定输出文件位置
3. **AI 生成文档**

   - AI 会读取参考资料
   - 生成符合网站风格的文档
   - 自动处理图片引用路径
4. **审核和调整**

   - 检查生成的内容
   - 调整格式和风格
   - 更新 `power-calculator.md` 等项目页面的链接

### 3. 文件命名规范

- **项目目录**：使用小写字母和连字符（如 `power-calculator`）
- **图片目录**：与项目目录同名
- **博客文章**：使用描述性名称（如 `power-consume-calculator-guide.md`）
- **项目页面**：使用简短名称（如 `power-calculator.md`）

### 4. 引用路径规范

- **项目页面引用博客文章**：`./<project-name>/<article>.md`
- **博客文章引用图片**：`../images/<project-name>/<image>.png`
- **项目页面引用图片**：`./images/<project-name>/<image>.png`

## 示例：添加气体换算项目

```bash
# 1. 创建目录结构
mkdir docs/open-source/gas-converter
mkdir docs/open-source/images/gas-converter

# 2. 复制文件
cp /path/to/gas-converter/README.md docs/open-source/gas-converter/
cp /path/to/gas-converter/blog/*.md docs/open-source/gas-converter/
cp /path/to/gas-converter/images/*.png docs/open-source/images/gas-converter/

# 3. 创建项目页面
# 在 docs/open-source/ 创建 gas-converter.md

# 4. AI 辅助优化
# 让 AI 参考 gas-converter/ 中的文件生成优化的项目页面
```

## 注意事项

1. **图片路径**：确保图片引用路径正确，特别是相对路径
2. **链接更新**：移动文件后及时更新所有引用链接
3. **备份原文件**：在移动或删除文件前建议备份
4. **版本控制**：所有更改都应提交到 Git

## 常见问题

### Q: 如何处理多个项目的同名文件？

A: 每个项目独立目录，文件名可以相同，不会冲突。

### Q: 图片可以放在项目目录下吗？

A: 可以，但建议统一放在 `images/` 目录下，便于管理和复用。

### Q: AI 如何知道参考哪些文件？

A: 在对话中明确告诉 AI 文件路径，或让 AI 搜索特定目录。

---

*本指南将随项目发展持续更新*
