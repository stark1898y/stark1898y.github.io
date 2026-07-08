<template>
  <div class="busuanzi-counter">
    <span class="busuanzi-item">
      本站访客数 <span ref="uvEl" class="count">-</span> 人次
    </span>
    <span class="divider">|</span>
    <span class="busuanzi-item">
      本站总访问量 <span ref="pvEl" class="count">-</span> 次
    </span>
    <div class="busuanzi-error" v-if="error" :title="error">统计加载失败</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const uvEl = ref<HTMLElement>()
const pvEl = ref<HTMLElement>()
const error = ref('')

onMounted(async () => {
  // 方案1: 尝试 vercount API（更可靠）
  try {
    const res = await fetch(
      `https://vercount.one/hit?name=stark1898y-site&t=${Date.now()}`,
      { mode: 'cors' },
    )
    if (res.ok) {
      const data = await res.json()
      if (uvEl.value) uvEl.value.textContent = String(data.uv || 0)
      if (pvEl.value) pvEl.value.textContent = String(data.pv || 0)
      return
    }
  } catch {}

  // 方案2: 回退到不蒜子原始脚本
  try {
    const script = document.createElement('script')
    script.src = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js'
    script.async = true
    script.onload = () => {
      // 给不蒜子一点时间更新 DOM
      setTimeout(() => {
        if (uvEl.value && uvEl.value.textContent !== '-') return
        // 不蒜子没生效，隐藏计数
        error.value = 'counter-load-failed'
      }, 2000)
    }
    document.head.appendChild(script)
  } catch {
    error.value = 'script-load-failed'
  }
})
</script>

<style scoped>
.busuanzi-counter {
  text-align: center;
  padding: 0 0 32px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.busuanzi-counter .divider {
  margin: 0 12px;
  opacity: 0.4;
}

.busuanzi-counter .count {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.busuanzi-error {
  font-size: 11px;
  color: var(--vp-c-text-3);
  margin-top: 4px;
  opacity: 0;
}
</style>
