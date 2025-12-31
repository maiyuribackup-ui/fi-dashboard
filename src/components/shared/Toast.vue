<script setup lang="ts">
import { ref, watch } from 'vue'
import { CheckCircle, XCircle, X } from 'lucide-vue-next'

const props = defineProps<{
  message: string
  type: 'success' | 'error'
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

watch(() => props.show, (show) => {
  if (show) {
    setTimeout(() => emit('close'), 3000)
  }
})
</script>

<template>
  <Transition name="slide">
    <div
      v-if="show"
      class="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50"
    >
      <div
        class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg"
        :class="type === 'success' ? 'bg-green-600' : 'bg-red-600'"
      >
        <CheckCircle v-if="type === 'success'" class="w-5 h-5 text-white flex-shrink-0" />
        <XCircle v-else class="w-5 h-5 text-white flex-shrink-0" />
        <span class="flex-1 text-white font-medium">{{ message }}</span>
        <button @click="emit('close')" class="text-white/80 hover:text-white">
          <X class="w-5 h-5" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
