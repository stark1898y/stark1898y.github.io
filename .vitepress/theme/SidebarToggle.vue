<!--
 * @Author: stark1898y 1658608470@qq.com
 * @Date: 2026-07-08 17:03:08
 * @LastEditors: stark1898y 1658608470@qq.com
 * @LastEditTime: 2026-07-08 17:07:27
 * @FilePath: \my_site\.vitepress\theme\SidebarToggle.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="sidebar-toggle" v-if="mounted">
    <button @click="toggleAll" class="toggle-btn">
      <span class="toggle-icon">{{ isCollapsed ? '▸' : '▾' }}</span>
      <span>{{ isCollapsed ? '展开全部' : '收起全部' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const mounted = ref(false)
const isCollapsed = ref(false)

function toggleAll() {
  const sidebar = document.querySelector('.VPSidebar')
  if (!sidebar) return

  const buttons = sidebar.querySelectorAll<HTMLElement>('.VPSidebarItem .caret')
  if (buttons.length === 0) return

  buttons.forEach((btn) => {
    const item = btn.closest('.VPSidebarItem')
    if (!item) return
    if (isCollapsed.value && item.classList.contains('collapsed')) {
      btn.click()
    } else if (!isCollapsed.value && !item.classList.contains('collapsed')) {
      btn.click()
    }
  })
  isCollapsed.value = !isCollapsed.value
}

onMounted(() => { mounted.value = true })
</script>

<style scoped>
.sidebar-toggle {
  padding-bottom: 8px;
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  cursor: pointer;
  border-radius: 6px;
  transition: color 0.15s, border-color 0.15s;
  line-height: 1;
}

.toggle-btn:hover {
  color: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
}

.toggle-icon {
  font-size: 10px;
  line-height: 1;
}
</style>
