import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'
import { ref } from 'vue'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

let genAI: GoogleGenerativeAI | null = null
let model: GenerativeModel | null = null

// Debug: Log API key status (not the key itself)
console.log('[Gemini] API Key configured:', !!apiKey, apiKey ? `(${apiKey.substring(0, 8)}...)` : '')

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey)
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    console.log('[Gemini] Model initialized successfully')
  } catch (err) {
    console.error('[Gemini] Failed to initialize:', err)
  }
}

export interface ParsedIntent {
  action: 'add_expense' | 'add_income' | 'add_fd' | 'query' | 'unknown'
  data?: {
    amount?: number
    category?: string
    description?: string
    source_type?: string
    source_name?: string
    bank_name?: string
    principal?: number
    interest_rate?: number
    maturity_date?: string
    query_type?: 'net_worth' | 'expenses' | 'income' | 'fd_maturity' | 'fi_progress'
  }
  confidence: number
  rawResponse?: string
}

const SYSTEM_PROMPT = `You are a financial assistant for a personal finance dashboard. Your job is to parse natural language into structured financial data.

When the user wants to:
1. ADD EXPENSE - Extract: amount (number), category (food/transport/utilities/entertainment/healthcare/education/personal/other), description
2. ADD INCOME - Extract: amount (number), source_type (fd_interest/dividend/rental/business/other), source_name
3. ADD FD - Extract: bank_name, principal (number), interest_rate (number), maturity_date (YYYY-MM-DD format)
4. QUERY - Identify what they're asking about: net_worth, expenses, income, fd_maturity, fi_progress

Respond ONLY with valid JSON in this exact format:
{
  "action": "add_expense" | "add_income" | "add_fd" | "query" | "unknown",
  "data": { ... extracted fields ... },
  "confidence": 0.0 to 1.0,
  "message": "Human readable confirmation or clarification"
}

Examples:
User: "Spent 500 on groceries"
Response: {"action":"add_expense","data":{"amount":500,"category":"food","description":"groceries"},"confidence":0.95,"message":"Recording Rs 500 expense for groceries under Food category."}

User: "Received 10000 rent from tenant"
Response: {"action":"add_income","data":{"amount":10000,"source_type":"rental","source_name":"tenant rent"},"confidence":0.95,"message":"Recording Rs 10,000 rental income."}

User: "Add FD in SBI for 1 lakh at 7% maturing March 2026"
Response: {"action":"add_fd","data":{"bank_name":"SBI","principal":100000,"interest_rate":7,"maturity_date":"2026-03-31"},"confidence":0.9,"message":"Creating FD in SBI: Rs 1,00,000 at 7% maturing March 2026."}

User: "What's my net worth?"
Response: {"action":"query","data":{"query_type":"net_worth"},"confidence":1.0,"message":"Let me check your current net worth."}

Always use INR (Indian Rupees). Convert lakhs/crores to numbers (1 lakh = 100000, 1 crore = 10000000).`

export function useGemini() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isConfigured = ref(!!apiKey)

  async function parseUserInput(input: string): Promise<ParsedIntent> {
    console.log('[Gemini] parseUserInput called with:', input)

    if (!model) {
      console.warn('[Gemini] Model not initialized')
      return {
        action: 'unknown',
        confidence: 0,
        rawResponse: 'Gemini API not configured. Please set VITE_GEMINI_API_KEY.'
      }
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('[Gemini] Sending request to Gemini API...')
      const result = await model.generateContent([
        { text: SYSTEM_PROMPT },
        { text: `User: ${input}` }
      ])

      const response = result.response.text()
      console.log('[Gemini] Response received:', response.substring(0, 200))

      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = response
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim()
      } else {
        // Try to find JSON object directly
        const objectMatch = response.match(/\{[\s\S]*\}/)
        if (objectMatch) {
          jsonStr = objectMatch[0]
        }
      }

      const parsed = JSON.parse(jsonStr)
      console.log('[Gemini] Parsed intent:', parsed)

      return {
        action: parsed.action || 'unknown',
        data: parsed.data,
        confidence: parsed.confidence || 0.5,
        rawResponse: parsed.message || response
      }
    } catch (err) {
      console.error('[Gemini] Error:', err)
      error.value = err instanceof Error ? err.message : 'Failed to parse input'
      return {
        action: 'unknown',
        confidence: 0,
        rawResponse: error.value
      }
    } finally {
      isLoading.value = false
    }
  }

  async function generateResponse(context: string, question: string): Promise<string> {
    console.log('[Gemini] generateResponse called')

    if (!model) {
      console.warn('[Gemini] Model not initialized for response')
      return 'Gemini API not configured. Please set VITE_GEMINI_API_KEY.'
    }

    isLoading.value = true
    error.value = null

    try {
      const prompt = `You are a helpful financial assistant. Here's the user's financial context:

${context}

User's question: ${question}

Provide a helpful, concise response. Use Indian Rupees (Rs) format. Be encouraging about their financial journey.`

      console.log('[Gemini] Generating response...')
      const result = await model.generateContent(prompt)
      const response = result.response.text()
      console.log('[Gemini] Response generated:', response.substring(0, 100))
      return response
    } catch (err) {
      console.error('[Gemini] generateResponse error:', err)
      error.value = err instanceof Error ? err.message : 'Failed to generate response'
      return `Sorry, I encountered an error: ${error.value}`
    } finally {
      isLoading.value = false
    }
  }

  return {
    parseUserInput,
    generateResponse,
    isLoading,
    error,
    isConfigured
  }
}
