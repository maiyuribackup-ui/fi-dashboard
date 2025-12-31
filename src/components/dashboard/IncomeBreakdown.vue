<script setup lang="ts">
import { computed } from 'vue'
import { Landmark, TrendingUp, Home, Briefcase, MoreHorizontal } from 'lucide-vue-next'

const props = defineProps<{
  breakdown: {
    fd_interest: number
    dividend: number
    rental: number
    business: number
    other: number
  }
}>()

const sources = computed(() => {
  const total = Object.values(props.breakdown).reduce((sum, val) => sum + val, 0)

  return [
    {
      type: 'fd_interest',
      label: 'FD Interest',
      icon: Landmark,
      amount: props.breakdown.fd_interest,
      percentage: total > 0 ? (props.breakdown.fd_interest / total) * 100 : 0,
      color: 'bg-amber-500',
    },
    {
      type: 'dividend',
      label: 'Dividends',
      icon: TrendingUp,
      amount: props.breakdown.dividend,
      percentage: total > 0 ? (props.breakdown.dividend / total) * 100 : 0,
      color: 'bg-blue-500',
    },
    {
      type: 'rental',
      label: 'Rental',
      icon: Home,
      amount: props.breakdown.rental,
      percentage: total > 0 ? (props.breakdown.rental / total) * 100 : 0,
      color: 'bg-green-500',
    },
    {
      type: 'business',
      label: 'Business',
      icon: Briefcase,
      amount: props.breakdown.business,
      percentage: total > 0 ? (props.breakdown.business / total) * 100 : 0,
      color: 'bg-purple-500',
    },
    {
      type: 'other',
      label: 'Other',
      icon: MoreHorizontal,
      amount: props.breakdown.other,
      percentage: total > 0 ? (props.breakdown.other / total) * 100 : 0,
      color: 'bg-slate-500',
    },
  ].filter(s => s.amount > 0)
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
  <div class="card">
    <h2 class="text-lg font-semibold text-slate-300 mb-4">Income Sources</h2>

    <div v-if="sources.length === 0" class="text-center py-8 text-slate-500">
      <p>No income recorded this month</p>
      <p class="text-sm mt-1">Tap + to add income</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="source in sources"
        :key="source.type"
        class="space-y-2"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div :class="[source.color, 'w-8 h-8 rounded-lg flex items-center justify-center']">
              <component :is="source.icon" class="w-4 h-4 text-white" />
            </div>
            <span class="text-slate-300">{{ source.label }}</span>
          </div>
          <span class="font-medium text-slate-200">{{ formatCurrency(source.amount) }}</span>
        </div>
        <div class="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            :class="[source.color, 'h-full rounded-full transition-all duration-500']"
            :style="{ width: `${source.percentage}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
