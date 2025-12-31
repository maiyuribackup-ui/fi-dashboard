import { ref, computed } from 'vue'
import { useSupabase } from './useSupabase'
import type { FDTracker } from '@/types/database'

export function useFDs() {
  const { supabase, userId } = useSupabase()

  const fds = ref<FDTracker[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const activeFDs = computed(() => fds.value.filter(fd => fd.status === 'active'))

  const totalFDValue = computed(() => {
    return activeFDs.value.reduce((sum, fd) => sum + fd.principal, 0)
  })

  const upcomingMaturities = computed(() => {
    const today = new Date()
    const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)

    return activeFDs.value
      .filter(fd => {
        const maturity = new Date(fd.maturity_date)
        return maturity >= today && maturity <= ninetyDaysFromNow
      })
      .sort((a, b) => new Date(a.maturity_date).getTime() - new Date(b.maturity_date).getTime())
  })

  async function fetchFDs(status?: 'active' | 'matured' | 'closed') {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('fd_tracker')
        .select('*')
        .eq('user_id', userId)
        .order('maturity_date', { ascending: true })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      fds.value = data || []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch FDs'
    } finally {
      loading.value = false
    }
  }

  async function addFD(fd: Omit<FDTracker, 'id' | 'user_id' | 'created_at'>) {
    loading.value = true
    error.value = null

    try {
      // Calculate maturity amount if not provided
      const maturityAmount = fd.maturity_amount || calculateMaturityAmount(fd.principal, fd.interest_rate, fd.start_date, fd.maturity_date)

      const { data, error: insertError } = await supabase
        .from('fd_tracker')
        .insert({
          ...fd,
          maturity_amount: maturityAmount,
          user_id: userId,
        })
        .select()
        .single()

      if (insertError) throw insertError

      fds.value.unshift(data)
      fds.value.sort((a, b) => new Date(a.maturity_date).getTime() - new Date(b.maturity_date).getTime())
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add FD'
      throw e
    } finally {
      loading.value = false
    }
  }

  function calculateMaturityAmount(principal: number, rate: number, startDate: string, maturityDate: string): number {
    const start = new Date(startDate)
    const end = new Date(maturityDate)
    const years = (end.getTime() - start.getTime()) / (365 * 24 * 60 * 60 * 1000)
    // Simple interest calculation
    return Math.round(principal * (1 + (rate / 100) * years))
  }

  function getDaysUntilMaturity(maturityDate: string): number {
    const today = new Date()
    const maturity = new Date(maturityDate)
    return Math.ceil((maturity.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
  }

  return {
    fds,
    activeFDs,
    loading,
    error,
    totalFDValue,
    upcomingMaturities,
    fetchFDs,
    addFD,
    getDaysUntilMaturity,
  }
}
