<script setup lang="ts">
defineProps<{
  progress: number
  color?: string
  height?: string
}>()
</script>

<template>
  <div
    class="bg-slate-800 rounded-full overflow-hidden"
    :style="{ height: height || '8px' }"
  >
    <div
      class="h-full rounded-full transition-all duration-500"
      :class="color || 'bg-primary-500'"
      :style="{ width: `${Math.min(progress, 100)}%` }"
    />
  </div>
</template>
