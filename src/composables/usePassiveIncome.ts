import { ref } from 'vue'
import { useSupabase } from './useSupabase'
import type { PassiveIncome } from '@/types/database'

export function usePassiveIncome() {
  const { supabase, userId } = useSupabase()

  const incomes = ref<PassiveIncome[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchIncomes(options?: { limit?: number; startDate?: string; endDate?: string }) {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('passive_income')
        .select('*')
        .eq('user_id', userId)
        .order('income_date', { ascending: false })

      if (options?.startDate) {
        query = query.gte('income_date', options.startDate)
      }
      if (options?.endDate) {
        query = query.lte('income_date', options.endDate)
      }
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      incomes.value = data || []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch incomes'
    } finally {
      loading.value = false
    }
  }

  async function addIncome(income: Omit<PassiveIncome, 'id' | 'user_id' | 'created_at'>) {
    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('passive_income')
        .insert({
          ...income,
          user_id: userId,
        })
        .select()
        .single()

      if (insertError) throw insertError

      incomes.value.unshift(data)
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add income'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    incomes,
    loading,
    error,
    fetchIncomes,
    addIncome,
  }
}
