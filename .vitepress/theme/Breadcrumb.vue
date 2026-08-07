<template>
  <div class="breadcrumb" v-if="items.length > 0">
    <span v-for="(item, idx) in items" :key="item.link || idx">
      <span class="sep" v-if="idx > 0">/</span>
      <a v-if="item.link && idx < items.length - 1" :href="item.link">{{ item.text }}</a>
      <span v-else class="current">{{ item.text }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page, theme } = useData()

// 面包屑映射规则
const breadcrumbMap: Record<string, string> = {
  '/docs/hardware/': '硬件设计',
  '/docs/mcu/': 'MCU 开发',
  '/docs/software/': '软件开发',
  '/docs/rtos/': 'RTOS 系统',
  '/docs/tools/': '开发工具',
  '/docs/linux/': 'Linux 开发',
  '/docs/ai-python/': 'AI & Python',
  '/docs/resources/': '学习资源',
  '/open-source/power-calculator/': '功耗计算器',
  '/open-source/gas-converter/': '气体浓度换算',
  '/dev-tools/timestamp-converter/': '时间戳转换',
  '/dev-tools/json-formatter/': 'JSON 格式化',
  '/dev-tools/base64/': 'Base64 编解码',
}

const items = computed(() => {
  const path = page.value.relativePath
  const result: { text: string; link?: string }[] = []

  // 首页不显示面包屑
  if (path === 'index.md') return result

  result.push({ text: '首页', link: '/' })

  if (path.startsWith('docs/')) {
    result.push({ text: '知识库', link: '/docs/intro' })
  } else if (path.startsWith('open-source/')) {
    result.push({ text: '开源项目', link: '/open-source/' })
  } else if (path.startsWith('dev-tools/')) {
    result.push({ text: '开发工具', link: '/dev-tools/' })
  }

  // 匹配子路径
  for (const [prefix, label] of Object.entries(breadcrumbMap)) {
    const p = prefix.startsWith('/') ? prefix.slice(1) : prefix
    if (path.startsWith(p)) {
      result.push({ text: label, link: '/' + p })
      break
    }
  }

  // 当前页面标题
  const title = page.value.title || path.split('/').pop()?.replace('.md', '') || ''
  result.push({ text: title })

  return result
})
</script>

<style scoped>
.breadcrumb {
  padding: 8px 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
  user-select: none;
}

.breadcrumb a {
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb a:hover {
  color: var(--vp-c-brand);
}

.breadcrumb .sep {
  margin: 0 6px;
  opacity: 0.5;
}

.breadcrumb .current {
  color: var(--vp-c-text-1);
  font-weight: 500;
}
</style>
