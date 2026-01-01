<script setup lang="ts">
import { onMounted } from 'vue'
import ChatWindow from './ChatWindow.vue'
import { useChatbot } from '@/composables/useChatbot'

const chatbot = useChatbot()

onMounted(() => {
  chatbot.initialize()
})
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50">
    <!-- Chat Window -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-4"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-4"
    >
      <ChatWindow
        v-if="chatbot.isOpen.value"
        :messages="chatbot.messages.value"
        :is-processing="chatbot.isProcessing.value"
        :is-listening="chatbot.isListening.value"
        :is-speaking="chatbot.isSpeaking.value"
        :voice-supported="chatbot.voiceSupported.value"
        :is-configured="chatbot.isConfigured.value"
        :pending-action="chatbot.pendingAction.value"
        @send="chatbot.sendMessage"
        @voice="chatbot.handleVoiceInput"
        @confirm="chatbot.confirmAction"
        @cancel="chatbot.cancelAction"
        @close="chatbot.toggle"
      />
    </Transition>

    <!-- Toggle Button -->
    <button
      @click="chatbot.toggle"
      class="group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      :class="[
        chatbot.isOpen.value
          ? 'bg-slate-700 hover:bg-slate-600'
          : 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500'
      ]"
    >
      <!-- Pulse animation when closed -->
      <span
        v-if="!chatbot.isOpen.value"
        class="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-25"
      ></span>

      <!-- Icon -->
      <svg
        v-if="!chatbot.isOpen.value"
        class="w-7 h-7 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      <svg
        v-else
        class="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>

      <!-- Tooltip -->
      <span
        v-if="!chatbot.isOpen.value"
        class="absolute right-full mr-3 px-3 py-1.5 text-sm font-medium text-white bg-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
      >
        FI Assistant
      </span>
    </button>
  </div>
</template>
