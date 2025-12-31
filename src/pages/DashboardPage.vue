<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { RefreshCw } from 'lucide-vue-next'

import FIProgressRing from '../components/dashboard/FIProgressRing.vue'
import NetWorthCard from '../components/dashboard/NetWorthCard.vue'
import IncomeBreakdown from '../components/dashboard/IncomeBreakdown.vue'
import QuickStats from '../components/dashboard/QuickStats.vue'

import { useFIProgress } from '../composables/useFIProgress'
import { useAssets } from '../composables/useAssets'
import { useExpenses } from '../composables/useExpenses'

const { fiProgress, loading: fiLoading, refresh: refreshFI } = useFIProgress()
const { totalAssets, assetsByType, fetchAssets, loading: assetsLoading } = useAssets()
const { expenses, fetchExpenses, loading: expensesLoading } = useExpenses()

const isLoading = computed(() => fiLoading.value || assetsLoading.value || expensesLoading.value)

const monthlyExpenses = computed(() => {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  return expenses.value
    .filter(e => new Date(e.expense_date) >= startOfMonth)
    .reduce((sum, e) => sum + e.amount, 0)
})

const savingsRate = computed(() => {
  const income = fiProgress.value.monthlyIncome
  const expense = monthlyExpenses.value
  if (income <= 0) return 0
  return ((income - expense) / income) * 100
})

async function refreshAll() {
  await Promise.all([
    refreshFI(),
    fetchAssets(),
    fetchExpenses({ limit: 100 }),
  ])
}

onMounted(() => {
  fetchAssets()
  fetchExpenses({ limit: 100 })
})
</script>

<template>
  <div class="space-y-6">
    <!-- Refresh Button -->
    <div class="flex justify-end">
      <button
        @click="refreshAll"
        :disabled="isLoading"
        class="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <RefreshCw :class="['w-4 h-4', { 'animate-spin': isLoading }]" />
        Refresh
      </button>
    </div>

    <!-- FI Progress Ring -->
    <FIProgressRing
      :progress="fiProgress.progress"
      :monthly-income="fiProgress.monthlyIncome"
      :target-income="fiProgress.targetIncome"
      :gap="fiProgress.gap"
    />

    <!-- Quick Stats -->
    <QuickStats
      :monthly-income="fiProgress.monthlyIncome"
      :monthly-expenses="monthlyExpenses"
      :savings-rate="savingsRate"
    />

    <!-- Net Worth & Income Breakdown -->
    <div class="grid md:grid-cols-2 gap-6">
      <NetWorthCard
        :total-assets="totalAssets"
        :assets-by-type="assetsByType"
      />

      <IncomeBreakdown
        :breakdown="fiProgress.incomeBreakdown"
      />
    </div>
  </div>
</template>
