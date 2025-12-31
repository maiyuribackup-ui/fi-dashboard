<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LayoutDashboard, Landmark, Plus, History } from 'lucide-vue-next'
import FormModal from '../forms/FormModal.vue'
import RecordIncomeForm from '../forms/RecordIncomeForm.vue'
import RecordExpenseForm from '../forms/RecordExpenseForm.vue'
import AddFDForm from '../forms/AddFDForm.vue'

const router = useRouter()
const route = useRoute()

const showAddMenu = ref(false)
const showIncomeForm = ref(false)
const showExpenseForm = ref(false)
const showFDForm = ref(false)

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/fds', icon: Landmark, label: 'FDs' },
  { path: '/transactions', icon: History, label: 'History' },
]

function navigate(path: string) {
  router.push(path)
}

function openAddMenu() {
  showAddMenu.value = true
}

function closeAddMenu() {
  showAddMenu.value = false
}

function openIncomeForm() {
  closeAddMenu()
  showIncomeForm.value = true
}

function openExpenseForm() {
  closeAddMenu()
  showExpenseForm.value = true
}

function openFDForm() {
  closeAddMenu()
  showFDForm.value = true
}

function handleFormSuccess() {
  showIncomeForm.value = false
  showExpenseForm.value = false
  showFDForm.value = false
  // Emit event to refresh data
  window.dispatchEvent(new CustomEvent('data-updated'))
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 safe-area-pb z-50">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-around py-2">
        <button
          v-for="item in navItems.slice(0, 2)"
          :key="item.path"
          @click="navigate(item.path)"
          class="flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors"
          :class="route.path === item.path ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span class="text-xs">{{ item.label }}</span>
        </button>

        <!-- Add Button -->
        <button
          @click="openAddMenu"
          class="w-14 h-14 -mt-6 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center shadow-lg shadow-primary-600/30 transition-colors"
        >
          <Plus class="w-7 h-7 text-white" />
        </button>

        <button
          v-for="item in navItems.slice(2)"
          :key="item.path"
          @click="navigate(item.path)"
          class="flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors"
          :class="route.path === item.path ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span class="text-xs">{{ item.label }}</span>
        </button>
      </div>
    </div>
  </nav>

  <!-- Add Menu Overlay -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showAddMenu"
        class="fixed inset-0 bg-black/60 z-50"
        @click="closeAddMenu"
      >
        <div class="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col gap-3" @click.stop>
          <button
            @click="openIncomeForm"
            class="btn-primary flex items-center gap-2 px-6 py-3 rounded-full shadow-lg"
          >
            <span class="text-lg">+</span>
            <span>Record Income</span>
          </button>
          <button
            @click="openExpenseForm"
            class="btn-secondary flex items-center gap-2 px-6 py-3 rounded-full shadow-lg"
          >
            <span class="text-lg">-</span>
            <span>Record Expense</span>
          </button>
          <button
            @click="openFDForm"
            class="bg-amber-600 hover:bg-amber-700 text-white font-medium flex items-center gap-2 px-6 py-3 rounded-full shadow-lg transition-colors"
          >
            <Landmark class="w-5 h-5" />
            <span>Add FD</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Forms -->
  <FormModal :show="showIncomeForm" title="Record Income" @close="showIncomeForm = false">
    <RecordIncomeForm @success="handleFormSuccess" @cancel="showIncomeForm = false" />
  </FormModal>

  <FormModal :show="showExpenseForm" title="Record Expense" @close="showExpenseForm = false">
    <RecordExpenseForm @success="handleFormSuccess" @cancel="showExpenseForm = false" />
  </FormModal>

  <FormModal :show="showFDForm" title="Add Fixed Deposit" @close="showFDForm = false">
    <AddFDForm @success="handleFormSuccess" @cancel="showFDForm = false" />
  </FormModal>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
