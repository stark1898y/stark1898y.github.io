<!--
 * @Author: stark1898y 1658608470@qq.com
 * @Date: 2026-07-08 16:17:23
 * @LastEditors: stark1898y 1658608470@qq.com
 * @LastEditTime: 2026-07-08 17:03:30
 * @FilePath: \my_site\.vitepress\theme\Busuanzi.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="busuanzi-counter" v-if="mounted">
    <span class="busuanzi-item">
      本站访客数 <span id="busuanzi_value_site_uv">-</span> 人次
    </span>
    <span class="divider">|</span>
    <span class="busuanzi-item">
      本站总访问量 <span id="busuanzi_value_site_pv">-</span> 次
    </span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const mounted = ref(false)

onMounted(() => {
  // 加载不蒜子统计脚本
  const script = document.createElement('script')
  script.src = 'https://busuanzi.22web.org/bsz.js'
  script.async = true
  document.head.appendChild(script)
  mounted.value = true
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
</style>
