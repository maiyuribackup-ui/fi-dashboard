import { ref, computed } from 'vue'
import { useSupabase } from './useSupabase'
import type { FinancialAsset } from '@/types/database'

export const ASSET_TYPES = [
  { value: 'fd', label: 'Fixed Deposit' },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'stock', label: 'Stock' },
  { value: 'rental', label: 'Rental Property' },
  { value: 'business', label: 'Business' },
  { value: 'other', label: 'Other' },
] as const

export function useAssets() {
  const { supabase, userId } = useSupabase()

  const assets = ref<FinancialAsset[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const totalAssets = computed(() => {
    return assets.value.reduce((sum, asset) => {
      return sum + (asset.current_value || asset.principal || 0)
    }, 0)
  })

  const assetsByType = computed(() => {
    const grouped: Record<string, number> = {}
    assets.value.forEach(asset => {
      const value = asset.current_value || asset.principal || 0
      grouped[asset.asset_type] = (grouped[asset.asset_type] || 0) + value
    })
    return grouped
  })

  async function fetchAssets() {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('financial_assets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      assets.value = data || []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch assets'
    } finally {
      loading.value = false
    }
  }

  async function addAsset(asset: Omit<FinancialAsset, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('financial_assets')
        .insert({
          ...asset,
          user_id: userId,
        })
        .select()
        .single()

      if (insertError) throw insertError

      assets.value.unshift(data)
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add asset'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    assets,
    loading,
    error,
    totalAssets,
    assetsByType,
    fetchAssets,
    addAsset,
  }
}
