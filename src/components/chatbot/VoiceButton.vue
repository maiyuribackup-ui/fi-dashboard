<script setup lang="ts">
defineProps<{
  isListening: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    @click="emit('click')"
    :disabled="disabled"
    class="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
    :class="[
      isListening
        ? 'bg-red-500 hover:bg-red-600 text-white'
        : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white',
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    ]"
    :title="isListening ? 'Stop listening' : 'Start voice input'"
  >
    <!-- Pulse animation when listening -->
    <span
      v-if="isListening"
      class="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-50"
    ></span>

    <!-- Microphone icon -->
    <svg
      class="w-5 h-5 relative z-10"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        v-if="!isListening"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
      <!-- Stop icon when listening -->
      <rect
        v-else
        x="6"
        y="6"
        width="12"
        height="12"
        rx="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      />
    </svg>

    <!-- Sound wave animation when listening -->
    <div
      v-if="isListening"
      class="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5"
    >
      <span class="w-0.5 h-2 bg-red-300 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
      <span class="w-0.5 h-3 bg-red-300 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
      <span class="w-0.5 h-2 bg-red-300 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
    </div>
  </button>
</template>
