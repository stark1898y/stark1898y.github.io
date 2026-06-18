// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// 动态判断部署环境：Vercel 使用自定义域名，GitHub Pages 使用仓库路径
const isVercel = process.env.VERCEL === '1';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Stark1898y 的个人知识库',
  tagline: '记录学习，沉淀知识',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: isVercel ? 'https://stark1898y.cc' : 'https://stark1898y.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: isVercel ? '/' : '/stark1898y.github.io/',
  trailingSlash: false,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'stark1898y', // Usually your GitHub org/user name.
  projectName: 'stark1898y.github.io', // Usually your repo name.
  deploymentBranch: 'gh-pages', 
  onBrokenLinks: 'throw',

  // 中文站点设置
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  // SEO：全局 headTags 配置
  headTags: [
    // Google Search Console 验证标签
    {
      tagName: 'meta',
      attributes: {
        name: 'google-site-verification',
        content: '5eeYVfB9QKwQO2A5HcxSw6_Ak8k0bqvNLByYGZN7L70',
      },
    },
    // 非 Vercel 环境添加 noindex，避免搜索引擎重复惩罚
    // 所有 SEO 权重集中在 stark1898y.cc，GitHub Pages 仅作为备份/测试站
    ...(!isVercel ? [{
      tagName: 'meta',
      attributes: {
        name: 'robots',
        content: 'noindex, nofollow',
      },
    }] : []),
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/stark1898y/stark1898y.github.io/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl:
            'https://github.com/stark1898y/stark1898y.github.io/tree/main/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        // sitemap 始终启用（Vercel 和本地构建都会生成）
        // GitHub Pages 通过 noindex 标签避免被搜索引擎索引
        sitemap: {
          changefreq: 'weekly',
          priority: 0.7,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Stark1898y',
        logo: {
          alt: 'Stark1898y Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '文档',
          },
          {to: '/blog', label: '博客', position: 'left'},
          {
            href: 'https://github.com/stark1898y/stark1898y.github.io',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '文档',
            items: [
              {
                label: '入门教程',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: '更多',
            items: [
              {
                label: '博客',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/stark1898y/stark1898y.github.io',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Stark1898y. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
