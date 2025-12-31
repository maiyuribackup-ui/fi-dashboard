<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { TrendingUp, TrendingDown, RefreshCw, Landmark, Home, Briefcase, MoreHorizontal, ShoppingCart, Car, Heart, GraduationCap, Clapperboard, User } from 'lucide-vue-next'
import { usePassiveIncome } from '../composables/usePassiveIncome'
import { useExpenses } from '../composables/useExpenses'

const { incomes, loading: incomeLoading, fetchIncomes } = usePassiveIncome()
const { expenses, loading: expenseLoading, fetchExpenses } = useExpenses()

const activeTab = ref<'all' | 'income' | 'expenses'>('all')
const isLoading = computed(() => incomeLoading.value || expenseLoading.value)

interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  description: string
  amount: number
  date: string
}

const transactions = computed<Transaction[]>(() => {
  const allTx: Transaction[] = []

  incomes.value.forEach(income => {
    allTx.push({
      id: income.id,
      type: 'income',
      category: income.source_type,
      description: income.source_name,
      amount: income.amount,
      date: income.income_date,
    })
  })

  expenses.value.forEach(expense => {
    allTx.push({
      id: expense.id,
      type: 'expense',
      category: expense.category,
      description: expense.description || expense.category,
      amount: expense.amount,
      date: expense.expense_date,
    })
  })

  // Sort by date descending
  return allTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const filteredTransactions = computed(() => {
  if (activeTab.value === 'all') return transactions.value
  return transactions.value.filter(tx => tx.type === activeTab.value)
})

const totalIncome = computed(() => {
  return incomes.value.reduce((sum, i) => sum + i.amount, 0)
})

const totalExpenses = computed(() => {
  return expenses.value.reduce((sum, e) => sum + e.amount, 0)
})

const categoryIcons: Record<string, typeof TrendingUp> = {
  fd_interest: Landmark,
  dividend: TrendingUp,
  rental: Home,
  business: Briefcase,
  other: MoreHorizontal,
  housing: Home,
  food: ShoppingCart,
  transport: Car,
  healthcare: Heart,
  education: GraduationCap,
  entertainment: Clapperboard,
  personal: User,
  utilities: Home,
}

function getIcon(category: string) {
  return categoryIcons[category] || MoreHorizontal
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    fd_interest: 'FD Interest',
    dividend: 'Dividend',
    rental: 'Rental',
    business: 'Business',
    housing: 'Housing',
    utilities: 'Utilities',
    food: 'Food',
    transport: 'Transport',
    healthcare: 'Healthcare',
    education: 'Education',
    entertainment: 'Entertainment',
    personal: 'Personal',
    other: 'Other',
  }
  return labels[category] || category
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('₹', 'Rs ')
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

async function refreshAll() {
  await Promise.all([
    fetchIncomes({ limit: 50 }),
    fetchExpenses({ limit: 50 }),
  ])
}

onMounted(() => {
  refreshAll()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold text-slate-200">Transactions</h1>
      <button
        @click="refreshAll"
        :disabled="isLoading"
        class="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <RefreshCw :class="['w-4 h-4', { 'animate-spin': isLoading }]" />
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 gap-4">
      <div class="card">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <TrendingUp class="w-4 h-4 text-green-400" />
          </div>
          <span class="text-sm text-slate-500">Income</span>
        </div>
        <p class="text-xl font-bold text-green-400">{{ formatCurrency(totalIncome) }}</p>
      </div>
      <div class="card">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
            <TrendingDown class="w-4 h-4 text-red-400" />
          </div>
          <span class="text-sm text-slate-500">Expenses</span>
        </div>
        <p class="text-xl font-bold text-red-400">{{ formatCurrency(totalExpenses) }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2">
      <button
        @click="activeTab = 'all'"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === 'all'
            ? 'bg-primary-500/20 text-primary-400'
            : 'text-slate-400 hover:text-slate-200'
        ]"
      >
        All
      </button>
      <button
        @click="activeTab = 'income'"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === 'income'
            ? 'bg-green-500/20 text-green-400'
            : 'text-slate-400 hover:text-slate-200'
        ]"
      >
        Income
      </button>
      <button
        @click="activeTab = 'expenses'"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === 'expenses'
            ? 'bg-red-500/20 text-red-400'
            : 'text-slate-400 hover:text-slate-200'
        ]"
      >
        Expenses
      </button>
    </div>

    <!-- Transaction List -->
    <div v-if="isLoading" class="text-center py-8 text-slate-500">
      <RefreshCw class="w-6 h-6 animate-spin mx-auto mb-2" />
      Loading transactions...
    </div>

    <div v-else-if="filteredTransactions.length === 0" class="text-center py-12 text-slate-500">
      <TrendingUp class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p>No transactions found</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="tx in filteredTransactions"
        :key="tx.id"
        class="card flex items-center gap-4"
      >
        <div
          :class="[
            'w-10 h-10 rounded-lg flex items-center justify-center',
            tx.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
          ]"
        >
          <component
            :is="getIcon(tx.category)"
            :class="['w-5 h-5', tx.type === 'income' ? 'text-green-400' : 'text-red-400']"
          />
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-slate-200 font-medium truncate">{{ tx.description }}</p>
          <p class="text-sm text-slate-500">{{ getCategoryLabel(tx.category) }}</p>
        </div>

        <div class="text-right">
          <p :class="['font-semibold', tx.type === 'income' ? 'text-green-400' : 'text-red-400']">
            {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
          </p>
          <p class="text-xs text-slate-500">{{ formatDate(tx.date) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
