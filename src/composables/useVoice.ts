import { ref, onUnmounted } from 'vue'

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event & { error: string }) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export function useVoice() {
  const isListening = ref(false)
  const isSpeaking = ref(false)
  const transcript = ref('')
  const error = ref<string | null>(null)
  const isSupported = ref(false)

  let recognition: SpeechRecognition | null = null
  let synthesis: SpeechSynthesis | null = null

  // Check browser support
  if (typeof window !== 'undefined') {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognitionAPI) {
      recognition = new SpeechRecognitionAPI()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-IN' // English (India)
      isSupported.value = true
    }

    if ('speechSynthesis' in window) {
      synthesis = window.speechSynthesis
    }
  }

  // Setup recognition handlers
  if (recognition) {
    recognition.onstart = () => {
      isListening.value = true
      error.value = null
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < results.length; i++) {
        const result = results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      transcript.value = finalTranscript || interimTranscript
    }

    recognition.onerror = (event) => {
      error.value = `Speech recognition error: ${event.error}`
      isListening.value = false
    }

    recognition.onend = () => {
      isListening.value = false
    }
  }

  function startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!recognition) {
        reject(new Error('Speech recognition not supported'))
        return
      }

      if (isListening.value) {
        stopListening()
      }

      transcript.value = ''
      error.value = null

      const originalOnEnd = recognition.onend
      recognition.onend = () => {
        isListening.value = false
        if (originalOnEnd) originalOnEnd()
        resolve(transcript.value)
      }

      const originalOnError = recognition.onerror
      recognition.onerror = (event) => {
        if (originalOnError) originalOnError(event)
        reject(new Error(event.error))
      }

      try {
        recognition.start()
      } catch (err) {
        reject(err)
      }
    })
  }

  function stopListening() {
    if (recognition && isListening.value) {
      recognition.stop()
    }
  }

  function speak(text: string, rate: number = 1): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!synthesis) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // Cancel any ongoing speech
      synthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = 1
      utterance.volume = 1
      utterance.lang = 'en-IN'

      // Try to get an Indian English voice
      const voices = synthesis.getVoices()
      const indianVoice = voices.find(v => v.lang === 'en-IN') ||
                          voices.find(v => v.lang.startsWith('en'))
      if (indianVoice) {
        utterance.voice = indianVoice
      }

      utterance.onstart = () => {
        isSpeaking.value = true
      }

      utterance.onend = () => {
        isSpeaking.value = false
        resolve()
      }

      utterance.onerror = (event) => {
        isSpeaking.value = false
        reject(new Error(event.error))
      }

      synthesis.speak(utterance)
    })
  }

  function stopSpeaking() {
    if (synthesis) {
      synthesis.cancel()
      isSpeaking.value = false
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopListening()
    stopSpeaking()
  })

  return {
    isListening,
    isSpeaking,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  }
}
