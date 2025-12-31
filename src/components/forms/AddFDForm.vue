<script setup lang="ts">
import { ref } from 'vue'
import { useFDs } from '../../composables/useFDs'

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const { addFD, loading } = useFDs()

const form = ref({
  bank_name: '',
  fd_number: '',
  principal: '',
  interest_rate: '',
  start_date: new Date().toISOString().split('T')[0],
  maturity_date: '',
  interest_payout: 'maturity',
  auto_renew: false,
  notes: '',
})

const payoutOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'maturity', label: 'At Maturity' },
]

async function handleSubmit() {
  if (!form.value.bank_name || !form.value.principal || !form.value.interest_rate || !form.value.maturity_date) {
    return
  }

  try {
    await addFD({
      bank_name: form.value.bank_name,
      fd_number: form.value.fd_number || undefined,
      principal: parseFloat(form.value.principal),
      interest_rate: parseFloat(form.value.interest_rate),
      start_date: form.value.start_date,
      maturity_date: form.value.maturity_date,
      interest_payout: form.value.interest_payout as 'monthly' | 'quarterly' | 'maturity',
      status: 'active',
      auto_renew: form.value.auto_renew,
      notes: form.value.notes || undefined,
    })
    emit('success')
  } catch (e) {
    console.error('Failed to add FD:', e)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Bank Name -->
    <div>
      <label class="block text-sm text-slate-400 mb-1">Bank Name</label>
      <input
        v-model="form.bank_name"
        type="text"
        placeholder="e.g., State Bank of India"
        class="input-field"
        required
      />
    </div>

    <!-- FD Number -->
    <div>
      <label class="block text-sm text-slate-400 mb-1">FD Number (optional)</label>
      <input
        v-model="form.fd_number"
        type="text"
        placeholder="FD account/receipt number"
        class="input-field"
      />
    </div>

    <!-- Principal -->
    <div>
      <label class="block text-sm text-slate-400 mb-1">Principal Amount (Rs)</label>
      <input
        v-model="form.principal"
        type="number"
        step="1"
        min="0"
        placeholder="100000"
        class="input-field"
        required
      />
    </div>

    <!-- Interest Rate -->
    <div>
      <label class="block text-sm text-slate-400 mb-1">Interest Rate (% p.a.)</label>
      <input
        v-model="form.interest_rate"
        type="number"
        step="0.01"
        min="0"
        max="20"
        placeholder="7.5"
        class="input-field"
        required
      />
    </div>

    <!-- Dates -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm text-slate-400 mb-1">Start Date</label>
        <input
          v-model="form.start_date"
          type="date"
          class="input-field"
          required
        />
      </div>
      <div>
        <label class="block text-sm text-slate-400 mb-1">Maturity Date</label>
        <input
          v-model="form.maturity_date"
          type="date"
          class="input-field"
          required
        />
      </div>
    </div>

    <!-- Interest Payout -->
    <div>
      <label class="block text-sm text-slate-400 mb-1">Interest Payout</label>
      <select
        v-model="form.interest_payout"
        class="input-field"
      >
        <option v-for="opt in payoutOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Auto Renew -->
    <div class="flex items-center gap-2">
      <input
        v-model="form.auto_renew"
        type="checkbox"
        id="auto_renew"
        class="w-4 h-4 rounded bg-slate-800 border-slate-700 text-primary-600 focus:ring-primary-500"
      />
      <label for="auto_renew" class="text-sm text-slate-400">Auto-renew on maturity</label>
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
        class="flex-1 btn-amber"
        :disabled="loading"
      >
        {{ loading ? 'Saving...' : 'Add FD' }}
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

.btn-amber {
  @apply px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
