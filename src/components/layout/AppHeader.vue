<script setup lang="ts">
import { TrendingUp } from 'lucide-vue-next'
</script>

<template>
  <header class="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
    <div class="container mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <TrendingUp class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-lg font-semibold text-white">FI Tracker</h1>
          <p class="text-xs text-slate-500">Financial Freedom Dashboard</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-sm text-slate-400">Target</p>
        <p class="text-lg font-semibold text-primary-400">Rs 2,00,000/mo</p>
      </div>
    </div>
  </header>
</template>
