<script setup lang="ts">
import { onMounted } from 'vue'

/**
 * 404 兜底渲染脚本
 *
 * VitePress 2.0.0-alpha.18 的 lean 模式缺陷：直接访问 /404.html 时，
 * 构建产物无 SSR 预渲染内容，客户端水合后正文为空。
 * 本脚本检测该场景，若主内容区为空则注入自定义中文 404 页面。
 * （直接访问未知 URL 时已由 themeConfig.notFound 覆盖，无需兜底。）
 */
const NOT_FOUND_HTML = `
<div style="text-align:center;padding:60px 20px">
  <h1 style="font-size:72px;margin-bottom:8px;background:linear-gradient(135deg,#4f46e5,#7c3aed);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">404</h1>
  <p style="font-size:18px;color:#6b7280;margin-bottom:24px">抱歉，你访问的页面不存在或已被移动。</p>
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
    <a href="/" style="display:inline-block;padding:10px 24px;border-radius:10px;background:#4f46e5;color:#fff;text-decoration:none;font-weight:600">🏠 返回首页</a>
    <a href="/dev-tools/" style="display:inline-block;padding:10px 24px;border-radius:10px;border:1px solid #e5e7eb;color:#4f46e5;text-decoration:none;font-weight:600">🛠️ 开发工具</a>
    <a href="/docs/intro" style="display:inline-block;padding:10px 24px;border-radius:10px;border:1px solid #e5e7eb;color:#4f46e5;text-decoration:none;font-weight:600">📚 知识库</a>
  </div>
  <p style="margin-top:32px;font-size:13px;color:#9ca3af">如果这是从一个链接进入的，可能该页面已更新路径。<br>工具页入口请从 <a href="/dev-tools/" style="color:#4f46e5">开发工具概览</a> 进入。</p>
</div>`

onMounted(() => {
  // 仅处理直接访问 404 页面的场景
  if (!/\/404(\.html)?\/?$/.test(window.location.pathname)) return

  let attempts = 0
  const timer = window.setInterval(() => {
    attempts++
    const content = document.querySelector('.VPContent')
    if (!content) return

    // 用 textContent 判断是否真的有内容（lean 模式会留下空占位 div，children 判断会误报）
    const page = content.querySelector('.VPPage')
    const hasContent = !!(page && page.textContent && page.textContent.trim().length > 0)
    const injected = document.getElementById('custom404')

    if (injected) {
      clearInterval(timer)
      return
    }
    if (hasContent) {
      // 内容已正常渲染（例如已修复的版本），无需兜底
      clearInterval(timer)
      return
    }

    // 主内容为空：注入自定义 404
    const target = page || content
    const div = document.createElement('div')
    div.id = 'custom404'
    div.innerHTML = NOT_FOUND_HTML
    target.appendChild(div)
    clearInterval(timer)
  }, 100)

  // 最多等待 5 秒
  setTimeout(() => clearInterval(timer), 5000)
})
</script>

<template>
  <slot />
</template>
