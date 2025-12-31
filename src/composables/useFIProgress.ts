import { ref, computed, onMounted } from 'vue'
import { useSupabase } from './useSupabase'
import type { FIProgress, PassiveIncome } from '@/types/database'

export function useFIProgress() {
  const { supabase, userId, fiTarget } = useSupabase()

  const loading = ref(true)
  const error = ref<string | null>(null)
  const monthlyIncome = ref<PassiveIncome[]>([])

  const fiProgress = computed<FIProgress>(() => {
    const breakdown = {
      fd_interest: 0,
      dividend: 0,
      rental: 0,
      business: 0,
      other: 0,
    }

    monthlyIncome.value.forEach(income => {
      const type = income.source_type as keyof typeof breakdown
      if (type in breakdown) {
        breakdown[type] += income.amount
      } else {
        breakdown.other += income.amount
      }
    })

    const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0)
    const progress = (total / fiTarget) * 100

    return {
      monthlyIncome: total,
      targetIncome: fiTarget,
      progress: Math.min(progress, 100),
      gap: Math.max(fiTarget - total, 0),
      incomeBreakdown: breakdown,
    }
  })

  async function fetchMonthlyIncome() {
    loading.value = true
    error.value = null

    try {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data, error: fetchError } = await supabase
        .from('passive_income')
        .select('*')
        .eq('user_id', userId)
        .gte('income_date', startOfMonth.toISOString().split('T')[0])

      if (fetchError) throw fetchError

      monthlyIncome.value = data || []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch income'
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchMonthlyIncome)

  return {
    fiProgress,
    loading,
    error,
    refresh: fetchMonthlyIncome,
  }
}
