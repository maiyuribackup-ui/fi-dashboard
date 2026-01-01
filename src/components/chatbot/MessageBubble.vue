<script setup lang="ts">
import type { ChatMessage } from '@/composables/useChatbot'

defineProps<{
  message: ChatMessage
}>()

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>

<template>
  <div
    class="flex"
    :class="[
      message.role === 'user' ? 'justify-end' : 'justify-start',
      message.role === 'system' ? 'justify-center' : ''
    ]"
  >
    <!-- System message -->
    <div
      v-if="message.role === 'system'"
      class="max-w-[90%] px-3 py-2 text-xs text-slate-400 bg-slate-800/50 rounded-lg text-center"
    >
      {{ message.content }}
    </div>

    <!-- User/Assistant message -->
    <div
      v-else
      class="max-w-[85%] group"
    >
      <div
        class="px-4 py-2.5 rounded-2xl"
        :class="[
          message.role === 'user'
            ? 'bg-emerald-600 text-white rounded-br-md'
            : 'bg-slate-700 text-slate-100 rounded-bl-md'
        ]"
      >
        <!-- Message content with markdown-like formatting -->
        <div class="text-sm whitespace-pre-wrap">{{ message.content }}</div>

        <!-- Status indicator for pending actions -->
        <div
          v-if="message.status"
          class="mt-2 pt-2 border-t"
          :class="[
            message.role === 'user' ? 'border-emerald-500/30' : 'border-slate-600'
          ]"
        >
          <span
            class="inline-flex items-center gap-1.5 text-xs"
            :class="[
              message.status === 'pending' ? 'text-amber-400' : '',
              message.status === 'confirmed' ? 'text-emerald-400' : '',
              message.status === 'cancelled' ? 'text-slate-400' : ''
            ]"
          >
            <!-- Pending icon -->
            <svg v-if="message.status === 'pending'" class="w-3.5 h-3.5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
            <!-- Confirmed icon -->
            <svg v-else-if="message.status === 'confirmed'" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <!-- Cancelled icon -->
            <svg v-else-if="message.status === 'cancelled'" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            {{ message.status === 'pending' ? 'Awaiting confirmation' : message.status === 'confirmed' ? 'Saved' : 'Cancelled' }}
          </span>
        </div>
      </div>

      <!-- Timestamp -->
      <div
        class="mt-1 text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
        :class="[message.role === 'user' ? 'text-right pr-1' : 'text-left pl-1']"
      >
        {{ formatTime(message.timestamp) }}
      </div>
    </div>
  </div>
</template>
