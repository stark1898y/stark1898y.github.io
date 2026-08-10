<script setup lang="ts">
import { onMounted } from 'vue'

/**
 * 静态工具页整页导航拦截器
 *
 * public/dev-tools/<tool>/ 下的工具页是纯静态 HTML，不在 VitePress 路由表内。
 * VitePress SPA 拦截站内链接后找不到页面模块，会渲染内置 404。
 * 因此在捕获阶段拦截指向这些路径的点击，强制整页加载（绕开 SPA 路由）。
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
      if (href && STATIC_TOOL_PATHS.includes(href)) {
        e.preventDefault()
        // 完整页面导航，避免 VitePress SPA 将其当作内部路由
        window.location.assign(href)
      }
    },
    true, // 捕获阶段，先于 VitePress 路由拦截器执行
  )
})
</script>

<template>
  <slot />
</template>
