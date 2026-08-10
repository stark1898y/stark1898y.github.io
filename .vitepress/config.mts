import { defineConfig } from 'vitepress'
import { generateSidebar } from './sidebar'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/',
  title: "Stark's 知识库",
  description: '嵌入式开发笔记与在线工具集',
  lang: 'zh-CN',
  ignoreDeadLinks: true,
  srcExclude: ['README.md'],

  sitemap: {
    hostname: 'https://stark1898y.github.io',
  },

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],

  themeConfig: {
    // 网站标题栏 Logo
    logo: '/logo.svg',
    siteTitle: "Stark's 知识库",

    // 顶部导航栏
    nav: [
      { text: '首页', link: '/' },
      {
        text: '知识库',
        items: [
          { text: '知识库简介', link: '/docs/intro' },
          { text: '硬件设计', link: '/docs/hardware/' },
          { text: 'MCU 开发', link: '/docs/mcu/' },
          { text: '软件开发', link: '/docs/software/' },
          { text: 'RTOS 系统', link: '/docs/rtos/' },
          { text: '开发工具', link: '/docs/tools/' },
          { text: 'Linux 开发', link: '/docs/linux/' },
          { text: 'AI & Python', link: '/docs/ai-python/' },
          { text: '学习资源', link: '/docs/resources/' },
        ],
      },
      {
        text: '开源项目',
        activeMatch: '/open-source/',
        items: [
          { text: '项目概览', link: '/open-source/' },
          { text: '功耗计算器', link: '/open-source/power-calculator/' },
          { text: '气体浓度换算', link: '/open-source/gas-converter/' },
        ],
      },
      {
        text: '开发工具',
        activeMatch: '/dev-tools/',
        items: [
          { text: '工具集概览', link: '/dev-tools/' },
          { text: '时间戳转换', link: '/dev-tools/timestamp-converter/' },
          { text: 'JSON 格式化', link: '/dev-tools/json-formatter/' },
          { text: 'Base64 编解码', link: '/dev-tools/base64/' },
        ],
      },
      {
        text: '相关链接',
        items: [
          { text: 'CSDN 博客', link: 'https://blog.csdn.net/gg1658608470?spm=1000.2115.3001.10640' },
          { text: 'Gitee', link: 'https://gitee.com/stark1898' },
        ],
      },
    ],

    // 侧边栏 —— 自动根据 docs/ 和 open-source/ 目录结构生成
    sidebar: generateSidebar(),

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/stark1898y' },
    ],

    // 本地搜索
    search: {
      provider: 'local',
    },

    // 外部链接图标
    externalLinkIcon: true,

    // 页脚
    footer: {
      message: '基于 VitePress 构建 | 托管于 GitHub Pages',
      copyright: 'Copyright © 2026-present Stark1898y',
    },

    // 上次更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'full',   // 显示完整日期 (如：2026年7月8日)
        timeStyle: 'short',  // 显示短时间 (如：下午 5:30)
      },
    },

    // 大纲层级
    outline: {
      level: [2, 3],
      label: '本页目录',
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/stark1898y/stark1898y.github.io/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    // 文档页脚
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },

    // 其他中文标签
    darkModeSwitchLabel: '深色模式',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',

    // 404 页面文案（VitePress 内置 NotFound 组件，直接访问未知 URL 时回退显示）
    notFound: {
      code: '404',
      title: '页面不存在',
      quote: '抱歉，你访问的页面不存在或已被移动。',
      link: '/',
      linkText: '返回首页',
      linkLabel: '返回首页',
    },
  },

  // Markdown 配置
  markdown: {
    lineNumbers: true,
  },
})
