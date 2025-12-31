<script setup lang="ts">
import { ref } from 'vue'
import { usePassiveIncome } from '../../composables/usePassiveIncome'

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const { addIncome, loading } = usePassiveIncome()

const form = ref({
  source_type: 'fd_interest',
  source_name: '',
  amount: '',
  income_date: new Date().toISOString().split('T')[0],
  frequency: 'one_time',
  notes: '',
})

const sourceTypes = [
  { value: 'fd_interest', label: 'FD Interest' },
  { value: 'dividend', label: 'Dividend' },
  { value: 'rental', label: 'Rental Income' },
  { value: 'business', label: 'Business Distribution' },
  { value: 'other', label: 'Other' },
]

const frequencies = [
  { value: 'one_time', label: 'One-time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
]

async function handleSubmit() {
  if (!form.value.source_name || !form.value.amount) {
    return
  }

  try {
    await addIncome({
      source_type: form.value.source_type as 'fd_interest' | 'dividend' | 'rental' | 'business' | 'other',
      source_name: form.value.source_name,
      amount: parseFloat(form.value.amount),
      income_date: form.value.income_date,
      frequency: form.value.frequency as 'monthly' | 'quarterly' | 'annually' | 'one_time',
      notes: form.value.notes || undefined,
    })
    emit('success')
  } catch (e) {
    console.error('Failed to add income:', e)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Source Type -->
    <div>
      <label class="block text-sm text-slate-400 mb-1">Income Type</label>
      <select
        v-model="form.source_type"
        class="input-field"
      >
        <option v-for="type in sourceTypes" :key="type.value" :value="type.value">
          {{ type.label }}
        </option>
      </select>
    </div>

    <!-- Source Name -->
    <div>
      <label class="block text-sm text-slate-400 mb-1">Source Name</label>
      <input
        v-model="form.source_name"
        type="text"
        placeholder="e.g., SBI FD Interest"
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
        v-model="form.income_date"
        type="date"
        class="input-field"
        required
      />
    </div>

    <!-- Frequency -->
    <div>
      <label class="block text-sm text-slate-400 mb-1">Frequency</label>
      <select
        v-model="form.frequency"
        class="input-field"
      >
        <option v-for="freq in frequencies" :key="freq.value" :value="freq.value">
          {{ freq.label }}
        </option>
      </select>
    </div>

    <!-- Notes -->
    <div>
      <label class="block text-sm text-slate-400 mb-1">Notes (optional)</label>
      <textarea
        v-model="form.notes"
        rows="2"
        placeholder="Any additional notes..."
        class="input-field"
      />
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
        class="flex-1 btn-primary"
        :disabled="loading"
      >
        {{ loading ? 'Saving...' : 'Save' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.input-field {
  @apply w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors;
}

.btn-primary {
  @apply px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
