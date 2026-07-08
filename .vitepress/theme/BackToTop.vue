<template>
  <div
    class="back-to-top"
    :class="{ visible: isVisible }"
    @click="scrollToTop"
    :style="{ '--progress': `${progress}deg` }"
  >
    <svg class="progress-ring" width="44" height="44" viewBox="0 0 44 44">
      <circle
        class="progress-bg"
        cx="22" cy="22" r="19"
        fill="none"
        stroke="var(--vp-c-bg-soft)"
        stroke-width="3"
      />
      <circle
        class="progress-fill"
        cx="22" cy="22" r="19"
        fill="none"
        stroke="var(--vp-c-brand)"
        stroke-width="3"
        stroke-linecap="round"
        :stroke-dasharray="`${dashArray} 119.38`"
        transform="rotate(-90 22 22)"
      />
    </svg>
    <span class="arrow">↑</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const isVisible = ref(false)
const progress = ref(0)

const circumference = 2 * Math.PI * 19 // ~119.38
const dashArray = computed(() => (progress.value / 100) * circumference)

const updateProgress = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
  progress.value = scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0
  isVisible.value = scrollTop > 200
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', updateProgress, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress)
})
</script>

<style scoped>
.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 80px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s, transform 0.3s;
  z-index: 999;
  pointer-events: none;
}

.back-to-top.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.back-to-top:hover {
  transform: scale(1.1);
}

.back-to-top:hover .progress-bg {
  stroke: var(--vp-c-brand-soft);
}

.progress-ring {
  position: absolute;
  top: 0;
  left: 0;
}

.progress-fill {
  transition: stroke-dasharray 0.15s ease;
}

.arrow {
  font-size: 18px;
  color: var(--vp-c-brand);
  font-weight: 700;
  z-index: 1;
  line-height: 1;
}
</style>
