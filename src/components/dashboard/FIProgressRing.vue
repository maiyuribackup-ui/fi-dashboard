<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  progress: number
  monthlyIncome: number
  targetIncome: number
  gap: number
}>()

const circumference = 2 * Math.PI * 90
const strokeDashoffset = computed(() => {
  return circumference - (props.progress / 100) * circumference
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('₹', 'Rs ')
}
</script>

<template>
  <div class="card text-center">
    <h2 class="text-lg font-semibold text-slate-300 mb-4">FI Progress</h2>

    <div class="relative inline-flex items-center justify-center">
      <svg width="220" height="220" class="transform -rotate-90">
        <!-- Background circle -->
        <circle
          cx="110"
          cy="110"
          r="90"
          fill="none"
          stroke="#1e293b"
          stroke-width="12"
        />
        <!-- Progress circle -->
        <circle
          cx="110"
          cy="110"
          r="90"
          fill="none"
          stroke="url(#progressGradient)"
          stroke-width="12"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          class="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#22c55e" />
            <stop offset="100%" stop-color="#d946ef" />
          </linearGradient>
        </defs>
      </svg>

      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-4xl font-bold text-gradient">{{ progress.toFixed(1) }}%</span>
        <span class="text-sm text-slate-500 mt-1">of FI Goal</span>
      </div>
    </div>

    <div class="mt-6 space-y-2">
      <div class="flex justify-between items-center px-4 py-2 bg-slate-800/50 rounded-lg">
        <span class="text-slate-400">Monthly Income</span>
        <span class="font-semibold text-primary-400">{{ formatCurrency(monthlyIncome) }}</span>
      </div>
      <div class="flex justify-between items-center px-4 py-2 bg-slate-800/50 rounded-lg">
        <span class="text-slate-400">Target</span>
        <span class="font-semibold text-slate-300">{{ formatCurrency(targetIncome) }}</span>
      </div>
      <div class="flex justify-between items-center px-4 py-2 bg-slate-800/50 rounded-lg">
        <span class="text-slate-400">Gap to FI</span>
        <span class="font-semibold text-amber-400">{{ formatCurrency(gap) }}/mo</span>
      </div>
    </div>
  </div>
</template>
