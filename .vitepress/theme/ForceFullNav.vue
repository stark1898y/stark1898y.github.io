<script setup lang="ts">
import { onMounted } from 'vue'

/**
 * 静态工具页整页导航拦截器
 *
 * public/dev-tools/<tool>/ 下的工具页是纯静态 HTML，不在 VitePress 路由表内。
 * VitePress 的路由拦截器挂在 window 捕获阶段（先于 document 执行），会将站内
 * 链接当作 SPA 路由加载，找不到页面模块时渲染内置 404。
 *
 * 首选方案：所有入口链接显式加 target="_self"（VitePress 对带 target 的链接
 * 直接跳过拦截，浏览器走整页导航）。已在 dev-tools/index.md、首页 index.md、
 * config.mts 导航中处理。
 *
 * 本组件作为兜底：若未来新增入口链接漏写 target，在 document 捕获阶段拦截并
 * 强制整页导航（location.assign 覆盖已被 VitePress preventDefault 的默认行为），
 * 确保静态工具页永远不走 SPA 路由。
 *
 * 注意：此处路径必须与 public/dev-tools/ 下的目录一一对应，新增工具页时需同步维护。
 */
const STATIC_TOOL_PATHS = [
  '/dev-tools/json-formatter/',
  '/dev-tools/timestamp-converter/',
  '/dev-tools/base64/',
]

onMounted(() => {
  document.addEventListener(
    'click',
    (e) => {
      const anchor = (e.target as Element | null)?.closest?.('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || !STATIC_TOOL_PATHS.includes(href)) return

      // 链接已带 target（_self/_blank），VitePress 不拦截，浏览器正常整页导航，无需干预
      if (anchor.hasAttribute('target')) return

      // 兜底：缺 target 的链接会被 VitePress 当 SPA 路由导致 404，
      // 这里强制整页导航覆盖其默认行为
      e.preventDefault()
      window.location.assign(href)
    },
    true,
  )
})
</script>

<template>
  <slot />
</template>
