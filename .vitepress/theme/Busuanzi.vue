<template>
  <div class="busuanzi-counter">
    <span class="busuanzi-item">
      <span class="busuanzi-icon">👁</span>
      本站访客数 <span id="busuanzi_value_site_uv">-</span> 人次
    </span>
    <span class="divider">|</span>
    <span class="busuanzi-item">
      <span class="busuanzi-icon">📊</span>
      本站总访问量 <span id="busuanzi_value_site_pv">-</span> 次
    </span>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js'
  script.async = true
  document.head.appendChild(script)
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

.busuanzi-counter .busuanzi-item span {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.busuanzi-icon {
  margin-right: 2px;
  font-size: 12px;
}
</style>
