<script setup lang="ts">
import { ref } from 'vue'
import { useExpenses, EXPENSE_CATEGORIES } from '../../composables/useExpenses'

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const { addExpense, loading } = useExpenses()

const form = ref({
  category: 'food',
  subcategory: '',
  amount: '',
  description: '',
  expense_date: new Date().toISOString().split('T')[0],
  payment_method: 'upi',
  is_recurring: false,
})

const categoryLabels: Record<string, string> = {
  housing: 'Housing',
  utilities: 'Utilities',
  food: 'Food & Groceries',
  transport: 'Transport',
  healthcare: 'Healthcare',
  education: 'Education',
  entertainment: 'Entertainment',
  personal: 'Personal',
  other: 'Other',
}

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
]

async function handleSubmit() {
  if (!form.value.amount || !form.value.description) {
    return
  }

  try {
    await addExpense({
      category: form.value.category,
      subcategory: form.value.subcategory || undefined,
      amount: parseFloat(form.value.amount),
      description: form.value.description,
      expense_date: form.value.expense_date,
      payment_method: form.value.payment_method,
      is_recurring: form.value.is_recurring,
    })
    emit('success')
  } catch (e) {
    console.error('Failed to add expense:', e)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Category -->
    <div>
      <label class="block text-sm text-slate-400 mb-1">Category</label>
      <select
        v-model="form.category"
        class="input-field"
      >
        <option v-for="cat in EXPENSE_CATEGORIES" :key="cat" :value="cat">
          {{ categoryLabels[cat] || cat }}
        </option>
      </select>
    </div>

    <!-- Description -->
    <div>
      <label class="block text-sm text-slate-400 mb-1">Description</label>
      <input
        v-model="form.description"
        type="text"
        placeholder="What was this expense for?"
        class="input-field"
        required
      />
    </div>

    <!-- Amount -->
    <div>
      <label class="block text-sm text-slate-400 mb-1">Amount (Rs)</label>
      <input
        v-model="form.amount"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        class="input-field"
        required
      />
    </div>

    <!-- Date -->
    <div>
      <label class="block text-sm text-slate-400 mb-1">Date</label>
      <input
        v-model="form.expense_date"
        type="date"
        class="input-field"
        required
      />
    </div>

    <!-- Payment Method -->
    <div>
      <label class="block text-sm text-slate-400 mb-1">Payment Method</label>
      <select
        v-model="form.payment_method"
        class="input-field"
      >
        <option v-for="method in paymentMethods" :key="method.value" :value="method.value">
          {{ method.label }}
        </option>
      </select>
    </div>

    <!-- Recurring -->
    <div class="flex items-center gap-2">
      <input
        v-model="form.is_recurring"
        type="checkbox"
        id="is_recurring"
        class="w-4 h-4 rounded bg-slate-800 border-slate-700 text-primary-600 focus:ring-primary-500"
      />
      <label for="is_recurring" class="text-sm text-slate-400">This is a recurring expense</label>
    </div>

    <!-- Actions -->
    <div class="flex gap-3 pt-2">
      <button
        type="button"
        @click="emit('cancel')"
        class="flex-1 btn-secondary"
        :disabled="loading"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="flex-1 btn-danger"
        :disabled="loading"
      >
        {{ loading ? 'Saving...' : 'Save Expense' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.input-field {
  @apply w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors;
}

.btn-secondary {
  @apply px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-danger {
  @apply px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
