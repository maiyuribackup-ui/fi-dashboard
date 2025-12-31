import { ref } from 'vue'
import { useSupabase } from './useSupabase'
import type { Expense } from '@/types/database'

export const EXPENSE_CATEGORIES = [
  'housing',
  'utilities',
  'food',
  'transport',
  'healthcare',
  'education',
  'entertainment',
  'personal',
  'other',
] as const

export function useExpenses() {
  const { supabase, userId } = useSupabase()

  const expenses = ref<Expense[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchExpenses(options?: { limit?: number; startDate?: string; endDate?: string; category?: string }) {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('expense_date', { ascending: false })

      if (options?.startDate) {
        query = query.gte('expense_date', options.startDate)
      }
      if (options?.endDate) {
        query = query.lte('expense_date', options.endDate)
      }
      if (options?.category) {
        query = query.eq('category', options.category)
      }
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      expenses.value = data || []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch expenses'
    } finally {
      loading.value = false
    }
  }

  async function addExpense(expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>) {
    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('expenses')
        .insert({
          ...expense,
          user_id: userId,
        })
        .select()
        .single()

      if (insertError) throw insertError

      expenses.value.unshift(data)
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add expense'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    addExpense,
  }
}
