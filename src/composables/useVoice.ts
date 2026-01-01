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

// Singleton state to prevent multiple instances causing ref issues
let _isListening = ref(false)
let _isSpeaking = ref(false)
let _transcript = ref('')
let _error = ref<string | null>(null)
let _isSupported = ref(false)
let _recognition: SpeechRecognition | null = null
let _synthesis: SpeechSynthesis | null = null
let _initialized = false

function initializeVoice() {
  if (_initialized) return
  _initialized = true

  // Check browser support
  if (typeof window !== 'undefined') {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognitionAPI) {
      _recognition = new SpeechRecognitionAPI()
      _recognition.continuous = false
      _recognition.interimResults = true
      _recognition.lang = 'en-IN' // English (India)
      _isSupported.value = true

      // Setup recognition handlers with singleton refs
      _recognition.onstart = () => {
        _isListening.value = true
        _error.value = null
      }

      _recognition.onresult = (event: SpeechRecognitionEvent) => {
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

        _transcript.value = finalTranscript || interimTranscript
      }

      _recognition.onerror = (event) => {
        _error.value = `Speech recognition error: ${event.error}`
        _isListening.value = false
      }

      _recognition.onend = () => {
        _isListening.value = false
      }
    }

    if ('speechSynthesis' in window) {
      _synthesis = window.speechSynthesis
    }
  }
}

export function useVoice() {
  // Initialize on first use
  initializeVoice()

  function startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!_recognition) {
        reject(new Error('Speech recognition not supported'))
        return
      }

      if (_isListening.value) {
        stopListening()
      }

      _transcript.value = ''
      _error.value = null

      // Store resolve/reject for use in handlers
      const handleEnd = () => {
        _isListening.value = false
        resolve(_transcript.value)
      }

      const handleError = (event: Event & { error: string }) => {
        _isListening.value = false
        reject(new Error(event.error))
      }

      // Temporarily override handlers for this promise
      const origOnEnd = _recognition.onend
      const origOnError = _recognition.onerror

      _recognition.onend = () => {
        _recognition!.onend = origOnEnd
        _recognition!.onerror = origOnError
        handleEnd()
      }

      _recognition.onerror = (event) => {
        _recognition!.onend = origOnEnd
        _recognition!.onerror = origOnError
        handleError(event)
      }

      try {
        _recognition.start()
      } catch (err) {
        _recognition.onend = origOnEnd
        _recognition.onerror = origOnError
        reject(err)
      }
    })
  }

  function stopListening() {
    if (_recognition && _isListening.value) {
      _recognition.stop()
    }
  }

  function speak(text: string, rate: number = 1): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!_synthesis) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // Cancel any ongoing speech
      _synthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = 1
      utterance.volume = 1
      utterance.lang = 'en-IN'

      // Try to get an Indian English voice
      const voices = _synthesis.getVoices()
      const indianVoice = voices.find(v => v.lang === 'en-IN') ||
                          voices.find(v => v.lang.startsWith('en'))
      if (indianVoice) {
        utterance.voice = indianVoice
      }

      utterance.onstart = () => {
        _isSpeaking.value = true
      }

      utterance.onend = () => {
        _isSpeaking.value = false
        resolve()
      }

      utterance.onerror = (event) => {
        _isSpeaking.value = false
        reject(new Error(event.error))
      }

      _synthesis.speak(utterance)
    })
  }

  function stopSpeaking() {
    if (_synthesis) {
      _synthesis.cancel()
      _isSpeaking.value = false
    }
  }

  // Cleanup on unmount - only stop, don't destroy singleton
  onUnmounted(() => {
    stopListening()
    stopSpeaking()
  })

  return {
    isListening: _isListening,
    isSpeaking: _isSpeaking,
    transcript: _transcript,
    error: _error,
    isSupported: _isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  }
}
