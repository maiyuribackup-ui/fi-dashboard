<script setup lang="ts">
import { X } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4"
        @click.self="emit('close')"
      >
        <div class="bg-slate-900 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <h2 class="text-lg font-semibold text-slate-200">{{ title }}</h2>
            <button
              @click="emit('close')"
              class="p-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Content -->
          <div class="p-4 overflow-y-auto max-h-[70vh]">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .modal-enter-from > div,
  .modal-leave-to > div {
    transform: scale(0.95);
  }
}
</style>
