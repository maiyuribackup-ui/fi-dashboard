// Database types matching Supabase schema

export interface FinancialAsset {
  id: string
  user_id: string
  asset_type: 'fd' | 'mutual_fund' | 'stock' | 'rental' | 'business' | 'other'
  name: string
  institution?: string
  principal?: number
  current_value?: number
  interest_rate?: number
  start_date?: string
  maturity_date?: string
  notes?: string
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface PassiveIncome {
  id: string
  user_id: string
  asset_id?: string
  source_type: 'fd_interest' | 'dividend' | 'rental' | 'business' | 'other'
  source_name: string
  amount: number
  income_date: string
  frequency?: 'monthly' | 'quarterly' | 'annually' | 'one_time'
  notes?: string
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  category: string
  subcategory?: string
  amount: number
  description?: string
  expense_date: string
  payment_method?: string
  is_recurring: boolean
  tags?: string[]
  created_at: string
}

export interface NetWorthSnapshot {
  id: string
  user_id: string
  snapshot_date: string
  total_assets?: number
  total_liabilities?: number
  net_worth?: number
  breakdown?: Record<string, number>
  created_at: string
}

export interface FinancialGoal {
  id: string
  user_id: string
  goal_name: string
  goal_type: string
  target_value: number
  current_value: number
  target_date?: string
  priority: number
  status: 'active' | 'achieved' | 'paused'
  created_at: string
  updated_at: string
}

export interface FDTracker {
  id: string
  user_id: string
  bank_name: string
  fd_number?: string
  principal: number
  interest_rate: number
  start_date: string
  maturity_date: string
  maturity_amount?: number
  interest_payout: 'monthly' | 'quarterly' | 'maturity'
  status: 'active' | 'matured' | 'closed'
  auto_renew: boolean
  notes?: string
  created_at: string
}

export interface InvestmentTransaction {
  id: string
  user_id: string
  asset_id?: string
  transaction_type: 'buy' | 'sell' | 'dividend' | 'interest'
  amount: number
  units?: number
  price_per_unit?: number
  transaction_date: string
  notes?: string
  created_at: string
}

export interface DashboardMetric {
  id: string
  user_id: string
  metric_name: string
  metric_value?: number
  metric_data?: Record<string, unknown>
  calculated_at: string
}

// Aggregated types for dashboard
export interface FIProgress {
  monthlyIncome: number
  targetIncome: number
  progress: number
  gap: number
  incomeBreakdown: {
    fd_interest: number
    dividend: number
    rental: number
    business: number
    other: number
  }
}

export interface IncomeSource {
  type: string
  amount: number
  percentage: number
}
