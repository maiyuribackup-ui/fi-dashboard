<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  amount: number
  compact?: boolean
}>()

const formatted = computed(() => {
  if (props.compact) {
    if (props.amount >= 10000000) {
      return `Rs ${(props.amount / 10000000).toFixed(2)} Cr`
    } else if (props.amount >= 100000) {
      return `Rs ${(props.amount / 100000).toFixed(1)} L`
    }
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(props.amount).replace('₹', 'Rs ')
})
</script>

<template>
  <span>{{ formatted }}</span>
</template>
