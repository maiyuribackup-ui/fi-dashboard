import { ref, computed } from 'vue'
import { useGemini, type ParsedIntent } from './useGemini'
import { useVoice } from './useVoice'
import { useExpenses } from './useExpenses'
import { usePassiveIncome } from './usePassiveIncome'
import { useFDs } from './useFDs'
import { useFIProgress } from './useFIProgress'
import { useAssets } from './useAssets'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  intent?: ParsedIntent
  status?: 'pending' | 'confirmed' | 'cancelled'
}

interface PendingAction {
  intent: ParsedIntent
  messageId: string
}

export function useChatbot() {
  const messages = ref<ChatMessage[]>([])
  const isOpen = ref(false)
  const pendingAction = ref<PendingAction | null>(null)

  // Composables
  const { parseUserInput, generateResponse, isLoading: geminiLoading, isConfigured } = useGemini()
  const { isListening, isSpeaking, startListening, stopListening, speak, isSupported: voiceSupported } = useVoice()
  const { addExpense, fetchExpenses, expenses } = useExpenses()
  const { addIncome, fetchIncomes, incomes } = usePassiveIncome()
  const { addFD, fetchFDs, activeFDs, upcomingMaturities, totalFDValue } = useFDs()
  const { fiProgress } = useFIProgress()
  const { assets, netWorth, fetchAssets } = useAssets()

  const isProcessing = computed(() => geminiLoading.value)

  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  function addMessage(role: ChatMessage['role'], content: string, intent?: ParsedIntent): ChatMessage {
    const message: ChatMessage = {
      id: generateId(),
      role,
      content,
      timestamp: new Date(),
      intent,
      status: intent ? 'pending' : undefined
    }
    messages.value.push(message)
    return message
  }

  async function sendMessage(text: string): Promise<void> {
    if (!text.trim()) return

    // Add user message
    addMessage('user', text)

    // Parse with Gemini
    const intent = await parseUserInput(text)

    if (intent.action === 'unknown') {
      // General query - generate conversational response
      const context = buildContext()
      const response = await generateResponse(context, text)
      addMessage('assistant', response)
      return
    }

    if (intent.action === 'query') {
      // Handle query
      const response = await handleQuery(intent)
      addMessage('assistant', response)
      return
    }

    // Data entry action - ask for confirmation
    const confirmMessage = intent.rawResponse || getConfirmationMessage(intent)
    const assistantMsg = addMessage('assistant', `${confirmMessage}\n\nShould I save this? (Say "yes" to confirm or "no" to cancel)`, intent)

    pendingAction.value = {
      intent,
      messageId: assistantMsg.id
    }
  }

  async function confirmAction(): Promise<void> {
    if (!pendingAction.value) return

    const { intent, messageId } = pendingAction.value

    try {
      let result: string

      switch (intent.action) {
        case 'add_expense':
          await addExpense({
            category: intent.data?.category || 'other',
            amount: intent.data?.amount || 0,
            description: intent.data?.description || '',
            expense_date: new Date().toISOString().split('T')[0],
            is_recurring: false
          })
          result = `Expense of Rs ${intent.data?.amount?.toLocaleString('en-IN')} saved successfully!`
          break

        case 'add_income':
          await addIncome({
            source_type: (intent.data?.source_type as 'fd_interest' | 'dividend' | 'rental' | 'business' | 'other') || 'other',
            source_name: intent.data?.source_name || 'Unknown',
            amount: intent.data?.amount || 0,
            income_date: new Date().toISOString().split('T')[0]
          })
          result = `Income of Rs ${intent.data?.amount?.toLocaleString('en-IN')} recorded!`
          break

        case 'add_fd':
          const today = new Date().toISOString().split('T')[0]
          await addFD({
            bank_name: intent.data?.bank_name || 'Unknown Bank',
            principal: intent.data?.principal || 0,
            interest_rate: intent.data?.interest_rate || 0,
            start_date: today,
            maturity_date: intent.data?.maturity_date || today,
            interest_payout: 'maturity',
            status: 'active',
            auto_renew: false
          })
          result = `FD of Rs ${intent.data?.principal?.toLocaleString('en-IN')} created!`
          break

        default:
          result = 'Action completed.'
      }

      // Update message status
      const msg = messages.value.find(m => m.id === messageId)
      if (msg) msg.status = 'confirmed'

      addMessage('assistant', result)
    } catch (error) {
      addMessage('assistant', `Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    pendingAction.value = null
  }

  async function cancelAction(): Promise<void> {
    if (!pendingAction.value) return

    const { messageId } = pendingAction.value
    const msg = messages.value.find(m => m.id === messageId)
    if (msg) msg.status = 'cancelled'

    addMessage('assistant', 'Cancelled. Let me know if you need anything else!')
    pendingAction.value = null
  }

  async function handleVoiceInput(): Promise<void> {
    try {
      const text = await startListening()
      if (text.trim()) {
        // Check if user is confirming/cancelling
        const lower = text.toLowerCase().trim()
        if (pendingAction.value) {
          if (lower === 'yes' || lower.includes('confirm') || lower.includes('save')) {
            await confirmAction()
          } else if (lower === 'no' || lower.includes('cancel')) {
            await cancelAction()
          } else {
            await sendMessage(text)
          }
        } else {
          await sendMessage(text)
        }
      }
    } catch (error) {
      addMessage('system', `Voice input error: ${error instanceof Error ? error.message : 'Failed to recognize speech'}`)
    }
  }

  async function handleQuery(intent: ParsedIntent): Promise<string> {
    await Promise.all([
      fetchExpenses({ limit: 100 }),
      fetchIncomes({ limit: 100 }),
      fetchFDs(),
      fetchAssets()
    ])

    switch (intent.data?.query_type) {
      case 'net_worth':
        return `Your current net worth is Rs ${netWorth.value.toLocaleString('en-IN')}.\n\nThis includes ${assets.value.length} assets with total value of Rs ${assets.value.reduce((s, a) => s + (a.current_value || a.principal || 0), 0).toLocaleString('en-IN')}.`

      case 'expenses':
        const thisMonth = expenses.value.filter(e => {
          const expDate = new Date(e.expense_date)
          const now = new Date()
          return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()
        })
        const total = thisMonth.reduce((s, e) => s + e.amount, 0)
        return `This month's expenses: Rs ${total.toLocaleString('en-IN')}\n\nTop categories:\n${getExpenseBreakdown(thisMonth)}`

      case 'income':
        return `Monthly passive income: Rs ${fiProgress.value.monthlyIncome.toLocaleString('en-IN')}\n\nBreakdown:\n${getIncomeBreakdown(fiProgress.value.incomeBreakdown)}`

      case 'fd_maturity':
        if (upcomingMaturities.value.length === 0) {
          return 'No FDs maturing in the next 90 days.'
        }
        return `Upcoming FD Maturities:\n${upcomingMaturities.value.map(fd =>
          `- ${fd.bank_name}: Rs ${fd.principal.toLocaleString('en-IN')} on ${new Date(fd.maturity_date).toLocaleDateString('en-IN')}`
        ).join('\n')}`

      case 'fi_progress':
        const progress = fiProgress.value
        return `FI Progress: ${progress.progress.toFixed(1)}%\n\nMonthly Income: Rs ${progress.monthlyIncome.toLocaleString('en-IN')}\nTarget: Rs ${progress.targetIncome.toLocaleString('en-IN')}\nGap: Rs ${progress.gap.toLocaleString('en-IN')}`

      default:
        return buildContext()
    }
  }

  function buildContext(): string {
    return `User's Financial Summary:
- Net Worth: Rs ${netWorth.value.toLocaleString('en-IN')}
- Monthly Passive Income: Rs ${fiProgress.value.monthlyIncome.toLocaleString('en-IN')}
- FI Target: Rs ${fiProgress.value.targetIncome.toLocaleString('en-IN')}/month
- FI Progress: ${fiProgress.value.progress.toFixed(1)}%
- Active FDs: ${activeFDs.value.length} (Rs ${totalFDValue.value.toLocaleString('en-IN')})`
  }

  function getConfirmationMessage(intent: ParsedIntent): string {
    switch (intent.action) {
      case 'add_expense':
        return `I'll record an expense of Rs ${intent.data?.amount?.toLocaleString('en-IN')} for ${intent.data?.description || intent.data?.category}.`
      case 'add_income':
        return `I'll record income of Rs ${intent.data?.amount?.toLocaleString('en-IN')} from ${intent.data?.source_name}.`
      case 'add_fd':
        return `I'll create an FD in ${intent.data?.bank_name} for Rs ${intent.data?.principal?.toLocaleString('en-IN')} at ${intent.data?.interest_rate}%.`
      default:
        return 'Ready to save this entry.'
    }
  }

  function getExpenseBreakdown(expenses: { category: string; amount: number }[]): string {
    const byCategory: Record<string, number> = {}
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount
    })
    return Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, amt]) => `- ${cat}: Rs ${amt.toLocaleString('en-IN')}`)
      .join('\n')
  }

  function getIncomeBreakdown(breakdown: Record<string, number>): string {
    return Object.entries(breakdown)
      .filter(([_, amt]) => amt > 0)
      .map(([type, amt]) => `- ${type.replace('_', ' ')}: Rs ${amt.toLocaleString('en-IN')}`)
      .join('\n') || 'No income recorded this month.'
  }

  // Initialize with welcome message
  function initialize(): void {
    if (messages.value.length === 0) {
      addMessage('assistant', `Hello! I'm your FI Assistant. You can:\n\n- Add expenses: "Spent 500 on groceries"\n- Record income: "Received 10000 rent"\n- Add FDs: "Create FD in SBI for 1 lakh at 7%"\n- Ask questions: "What's my net worth?"\n\nTry the microphone button for voice input!`)
    }
  }

  return {
    // State
    messages,
    isOpen,
    isProcessing,
    isListening,
    isSpeaking,
    voiceSupported,
    isConfigured,
    pendingAction,

    // Actions
    sendMessage,
    handleVoiceInput,
    confirmAction,
    cancelAction,
    speak,
    stopListening,
    initialize,

    // Helpers
    toggle: () => { isOpen.value = !isOpen.value }
  }
}
