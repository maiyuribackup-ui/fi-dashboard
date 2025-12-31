<script setup lang="ts">
import { TrendingUp, TrendingDown, Target } from 'lucide-vue-next'

defineProps<{
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number
}>()

function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `Rs ${(amount / 100000).toFixed(1)}L`
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('₹', 'Rs ')
}
</script>

<template>
  <div class="grid grid-cols-3 gap-3">
    <div class="card flex flex-col items-center py-4">
      <div class="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
        <TrendingUp class="w-5 h-5 text-green-400" />
      </div>
      <p class="text-lg font-semibold text-green-400">{{ formatCurrency(monthlyIncome) }}</p>
      <p class="text-xs text-slate-500">Income</p>
    </div>

    <div class="card flex flex-col items-center py-4">
      <div class="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
        <TrendingDown class="w-5 h-5 text-red-400" />
      </div>
      <p class="text-lg font-semibold text-red-400">{{ formatCurrency(monthlyExpenses) }}</p>
      <p class="text-xs text-slate-500">Expenses</p>
    </div>

    <div class="card flex flex-col items-center py-4">
      <div class="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center mb-2">
        <Target class="w-5 h-5 text-primary-400" />
      </div>
      <p class="text-lg font-semibold text-primary-400">{{ savingsRate.toFixed(0) }}%</p>
      <p class="text-xs text-slate-500">Savings Rate</p>
    </div>
  </div>
</template>
