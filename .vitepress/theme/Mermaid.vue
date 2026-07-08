<template>
  <slot />
</template>

<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()

async function renderAll() {
  if (typeof window === 'undefined') return
  await nextTick()
  await new Promise((r) => setTimeout(r, 300))

  const mermaid = await import('mermaid')
  mermaid.default.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
  })

  // VitePress v2 渲染 mermaid 代码块的结构是 div.language-mermaid > pre > code
  const containers = document.querySelectorAll('div.language-mermaid')
  for (const container of containers) {
    if (container.querySelector('.mermaid-rendered')) continue

    const code = container.querySelector('code')
    if (!code) continue

    // 从 code 中提取纯文本（去除语法高亮的 span 标签）
    const lines = code.querySelectorAll('.line')
    const text = Array.from(lines)
      .map((line) => line.textContent || '')
      .join('\n')

    if (!text.trim()) continue

    const id = 'mermaid-' + Math.random().toString(36).slice(2, 11)
    try {
      const { svg } = await mermaid.default.render(id, text)
      const div = document.createElement('div')
      div.className = 'mermaid-rendered'
      div.innerHTML = svg
      div.style.cssText = 'text-align: center; margin: 16px 0; overflow-x: auto;'
      container.replaceWith(div)
    } catch (e) {
      console.warn('Mermaid render failed:', e)
    }
  }
}

onMounted(renderAll)
watch(() => route.path, renderAll)
</script>
