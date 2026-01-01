<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import type { ChatMessage } from '@/composables/useChatbot'
import type { ParsedIntent } from '@/composables/useGemini'
import MessageBubble from './MessageBubble.vue'
import VoiceButton from './VoiceButton.vue'

const props = defineProps<{
  messages: ChatMessage[]
  isProcessing: boolean
  isListening: boolean
  isSpeaking: boolean
  voiceSupported: boolean
  isConfigured: boolean
  pendingAction: { intent: ParsedIntent; messageId: string } | null
}>()

const emit = defineEmits<{
  send: [text: string]
  voice: []
  confirm: []
  cancel: []
  close: []
}>()

const inputText = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

// Auto-scroll to bottom when new messages arrive
watch(() => props.messages.length, async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
})

function handleSubmit() {
  if (!inputText.value.trim() || props.isProcessing) return

  // Check if confirming/cancelling
  const lower = inputText.value.toLowerCase().trim()
  if (props.pendingAction) {
    if (lower === 'yes' || lower === 'confirm' || lower === 'save') {
      emit('confirm')
      inputText.value = ''
      return
    } else if (lower === 'no' || lower === 'cancel') {
      emit('cancel')
      inputText.value = ''
      return
    }
  }

  emit('send', inputText.value)
  inputText.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}
</script>

<template>
  <div class="absolute bottom-20 right-0 w-[380px] max-h-[600px] bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <div>
          <h3 class="font-semibold text-sm">FI Assistant</h3>
          <p class="text-xs text-emerald-100 opacity-80">
            {{ isProcessing ? 'Thinking...' : isListening ? 'Listening...' : 'Ready to help' }}
          </p>
        </div>
      </div>
      <button
        @click="emit('close')"
        class="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- API not configured warning -->
    <div v-if="!isConfigured" class="px-4 py-2 bg-amber-500/20 border-b border-amber-500/30">
      <p class="text-xs text-amber-300">
        <span class="font-medium">Note:</span> Set VITE_GEMINI_API_KEY in .env for AI features
      </p>
    </div>

    <!-- Messages -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[400px]"
    >
      <MessageBubble
        v-for="message in messages"
        :key="message.id"
        :message="message"
      />

      <!-- Typing indicator -->
      <div v-if="isProcessing" class="flex justify-start">
        <div class="bg-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
          <div class="flex gap-1">
            <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
            <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
            <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation buttons when pending action -->
    <div
      v-if="pendingAction"
      class="px-4 py-2 border-t border-slate-700 bg-slate-800/80"
    >
      <div class="flex gap-2">
        <button
          @click="emit('confirm')"
          class="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Yes, Save
        </button>
        <button
          @click="emit('cancel')"
          class="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Input area -->
    <div class="p-3 border-t border-slate-700 bg-slate-800/50">
      <div class="flex items-end gap-2">
        <!-- Voice button -->
        <VoiceButton
          v-if="voiceSupported"
          :is-listening="isListening"
          :disabled="isProcessing"
          @click="emit('voice')"
        />

        <!-- Text input -->
        <div class="flex-1 relative">
          <textarea
            v-model="inputText"
            @keydown="handleKeydown"
            :disabled="isProcessing"
            placeholder="Type a message or use voice..."
            rows="1"
            class="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
          ></textarea>
        </div>

        <!-- Send button -->
        <button
          @click="handleSubmit"
          :disabled="!inputText.trim() || isProcessing"
          class="flex items-center justify-center w-10 h-10 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:opacity-50 text-white rounded-xl transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </button>
      </div>

      <!-- Quick suggestions -->
      <div class="mt-2 flex flex-wrap gap-1.5">
        <button
          v-for="suggestion in ['Add expense', 'My net worth', 'FI progress']"
          :key="suggestion"
          @click="inputText = suggestion; handleSubmit()"
          class="px-2.5 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full transition-colors"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>
  </div>
</template>
