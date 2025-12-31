<script setup lang="ts">
import { computed } from 'vue'
import { Wallet } from 'lucide-vue-next'

const props = defineProps<{
  totalAssets: number
  assetsByType: Record<string, number>
}>()

const typeLabels: Record<string, { label: string; color: string }> = {
  fd: { label: 'Fixed Deposits', color: '#f59e0b' },
  mutual_fund: { label: 'Mutual Funds', color: '#3b82f6' },
  stock: { label: 'Stocks', color: '#22c55e' },
  rental: { label: 'Real Estate', color: '#8b5cf6' },
  business: { label: 'Business', color: '#ec4899' },
  other: { label: 'Other', color: '#64748b' },
}

const pieData = computed(() => {
  const total = props.totalAssets
  if (total === 0) return []

  let startAngle = 0
  return Object.entries(props.assetsByType).map(([type, value]) => {
    const percentage = (value / total) * 100
    const angle = (value / total) * 360
    const data = {
      type,
      value,
      percentage,
      startAngle,
      endAngle: startAngle + angle,
      color: typeLabels[type]?.color || '#64748b',
      label: typeLabels[type]?.label || type,
    }
    startAngle += angle
    return data
  })
})

function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `Rs ${(amount / 10000000).toFixed(2)} Cr`
  } else if (amount >= 100000) {
    return `Rs ${(amount / 100000).toFixed(2)} L`
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('₹', 'Rs ')
}

function describeArc(startAngle: number, endAngle: number, radius: number = 60): string {
  const start = polarToCartesian(70, 70, radius, endAngle)
  const end = polarToCartesian(70, 70, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ')
}

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  }
}
</script>

<template>
  <div class="card">
    <div class="flex items-center gap-2 mb-4">
      <Wallet class="w-5 h-5 text-primary-400" />
      <h2 class="text-lg font-semibold text-slate-300">Net Worth</h2>
    </div>

    <div class="text-center mb-4">
      <p class="text-3xl font-bold text-gradient">{{ formatCurrency(totalAssets) }}</p>
      <p class="text-sm text-slate-500 mt-1">Total Assets</p>
    </div>

    <div v-if="pieData.length === 0" class="text-center py-6 text-slate-500">
      <p>No assets recorded yet</p>
    </div>

    <div v-else class="flex items-center gap-6">
      <!-- Pie Chart -->
      <svg width="140" height="140" viewBox="0 0 140 140" class="flex-shrink-0">
        <circle cx="70" cy="70" r="60" fill="#1e293b" />
        <path
          v-for="(slice, index) in pieData"
          :key="index"
          :d="describeArc(slice.startAngle, slice.endAngle)"
          fill="none"
          :stroke="slice.color"
          stroke-width="24"
          class="transition-all duration-500"
        />
        <circle cx="70" cy="70" r="36" fill="#0f172a" />
      </svg>

      <!-- Legend -->
      <div class="flex-1 space-y-2">
        <div
          v-for="slice in pieData"
          :key="slice.type"
          class="flex items-center justify-between text-sm"
        >
          <div class="flex items-center gap-2">
            <div
              class="w-3 h-3 rounded-full"
              :style="{ backgroundColor: slice.color }"
            />
            <span class="text-slate-400">{{ slice.label }}</span>
          </div>
          <span class="text-slate-300 font-medium">{{ slice.percentage.toFixed(0) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>
