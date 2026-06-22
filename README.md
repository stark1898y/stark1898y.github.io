# Stark1898y 的个人知识库

基于 [Docusaurus](https://docusaurus.io/) 构建的个人知识库，记录学习笔记和技术文档。

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（支持热更新）
npm start

# 如果需要局域网访问（手机预览等）
npm start --host 0.0.0.0
```

访问 http://localhost:3000 预览。

## 构建部署

### 本地验证生产构建

```bash
npm run build
npm run serve
```

### 部署到 Vercel

绑定 GitHub 仓库后会自动部署，push 到 main 分支即触发。

## 部署说明

| 场景 | 执行命令 | 预期结果 |
|------|----------|----------|
| 日常写文档/改样式 | `npm start` | 浏览器秒开，保存即刷新 |
| 提交代码后自动上线 | `git push` | Vercel 自动构建，1分钟内生效 |
| 本地验证生产构建 | `npm run build && npm run serve` | 模拟真实线上环境 |

## 项目结构

```
├── blog/           # 博客文章
├── docs/           # 文档内容
├── src/
│   ├── components/ # 自定义组件
│   ├── css/        # 自定义样式
│   └── pages/      # 自定义页面
├── static/         # 静态资源
└── docusaurus.config.js  # 站点配置
```

## 声明

本知识库内容仅供学习参考，欢迎阅读和分享。
