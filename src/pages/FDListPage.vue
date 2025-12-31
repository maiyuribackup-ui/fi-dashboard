<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { Landmark, Calendar, Percent, AlertCircle, Plus, RefreshCw } from 'lucide-vue-next'
import { useFDs } from '../composables/useFDs'

const { fds, activeFDs, loading, totalFDValue, upcomingMaturities, fetchFDs, getDaysUntilMaturity } = useFDs()

const activeTab = ref<'active' | 'all'>('active')

const displayFDs = computed(() => {
  return activeTab.value === 'active' ? activeFDs.value : fds.value
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getMaturityClass(maturityDate: string): string {
  const days = getDaysUntilMaturity(maturityDate)
  if (days < 0) return 'text-slate-500'
  if (days <= 30) return 'text-red-400'
  if (days <= 90) return 'text-amber-400'
  return 'text-green-400'
}

function getStatusBadge(status: string): { class: string; label: string } {
  switch (status) {
    case 'active':
      return { class: 'bg-green-500/20 text-green-400', label: 'Active' }
    case 'matured':
      return { class: 'bg-amber-500/20 text-amber-400', label: 'Matured' }
    case 'closed':
      return { class: 'bg-slate-500/20 text-slate-400', label: 'Closed' }
    default:
      return { class: 'bg-slate-500/20 text-slate-400', label: status }
  }
}

onMounted(() => {
  fetchFDs()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold text-slate-200">Fixed Deposits</h1>
      <button
        @click="fetchFDs()"
        :disabled="loading"
        class="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <RefreshCw :class="['w-4 h-4', { 'animate-spin': loading }]" />
      </button>
    </div>

    <!-- Summary Card -->
    <div class="card">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
          <Landmark class="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <p class="text-2xl font-bold text-gradient">{{ formatCurrency(totalFDValue) }}</p>
          <p class="text-sm text-slate-500">Total FD Value</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
        <div>
          <p class="text-2xl font-semibold text-slate-200">{{ activeFDs.length }}</p>
          <p class="text-sm text-slate-500">Active FDs</p>
        </div>
        <div>
          <p class="text-2xl font-semibold text-amber-400">{{ upcomingMaturities.length }}</p>
          <p class="text-sm text-slate-500">Maturing in 90 days</p>
        </div>
      </div>
    </div>

    <!-- Upcoming Maturities Alert -->
    <div v-if="upcomingMaturities.length > 0" class="card border border-amber-500/30 bg-amber-500/5">
      <div class="flex items-center gap-2 text-amber-400 mb-3">
        <AlertCircle class="w-5 h-5" />
        <h3 class="font-semibold">Upcoming Maturities</h3>
      </div>
      <div class="space-y-2">
        <div
          v-for="fd in upcomingMaturities.slice(0, 3)"
          :key="fd.id"
          class="flex items-center justify-between text-sm"
        >
          <span class="text-slate-300">{{ fd.bank_name }}</span>
          <span class="text-amber-400">{{ formatDate(fd.maturity_date) }}</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2">
      <button
        @click="activeTab = 'active'"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === 'active'
            ? 'bg-primary-500/20 text-primary-400'
            : 'text-slate-400 hover:text-slate-200'
        ]"
      >
        Active ({{ activeFDs.length }})
      </button>
      <button
        @click="activeTab = 'all'"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === 'all'
            ? 'bg-primary-500/20 text-primary-400'
            : 'text-slate-400 hover:text-slate-200'
        ]"
      >
        All ({{ fds.length }})
      </button>
    </div>

    <!-- FD List -->
    <div v-if="loading" class="text-center py-8 text-slate-500">
      <RefreshCw class="w-6 h-6 animate-spin mx-auto mb-2" />
      Loading FDs...
    </div>

    <div v-else-if="displayFDs.length === 0" class="text-center py-12 text-slate-500">
      <Landmark class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p>No FDs found</p>
      <p class="text-sm mt-1">Add your first FD to start tracking</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="fd in displayFDs"
        :key="fd.id"
        class="card hover:border-slate-700 transition-colors"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-semibold text-slate-200">{{ fd.bank_name }}</h3>
            <p v-if="fd.fd_number" class="text-sm text-slate-500">{{ fd.fd_number }}</p>
          </div>
          <span :class="['text-xs px-2 py-1 rounded-full', getStatusBadge(fd.status).class]">
            {{ getStatusBadge(fd.status).label }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-slate-500">Principal</p>
            <p class="font-medium text-slate-200">{{ formatCurrency(fd.principal) }}</p>
          </div>
          <div>
            <p class="text-slate-500">Maturity</p>
            <p class="font-medium text-slate-200">{{ formatCurrency(fd.maturity_amount || 0) }}</p>
          </div>
          <div class="flex items-center gap-1">
            <Percent class="w-3 h-3 text-slate-500" />
            <span class="text-slate-500">Rate</span>
            <span class="ml-auto font-medium text-green-400">{{ fd.interest_rate }}%</span>
          </div>
          <div class="flex items-center gap-1">
            <Calendar class="w-3 h-3 text-slate-500" />
            <span class="text-slate-500">Matures</span>
            <span :class="['ml-auto font-medium', getMaturityClass(fd.maturity_date)]">
              {{ formatDate(fd.maturity_date) }}
            </span>
          </div>
        </div>

        <div v-if="fd.status === 'active'" class="mt-3 pt-3 border-t border-slate-800">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500">Days until maturity</span>
            <span :class="getMaturityClass(fd.maturity_date)">
              {{ getDaysUntilMaturity(fd.maturity_date) }} days
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
