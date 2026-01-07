/**
 * Utility to add timeout to async operations
 * Prevents 502 errors from long-running API calls
 */

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(errorMessage || `Operation timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  return Promise.race([promise, timeout])
}

type TimeoutConfig = {
  OPENAI_TRANSCRIBE: number
  OPENAI_CHAT: number
  OPENAI_ANALYSIS: number
  OPENAI_REALTIME_SESSION: number
  PDF_PARSE: number
  FIREBASE_OPERATION: number
}

const TIMEOUT_PRESETS: Record<string, TimeoutConfig> = {
  /**
   * Original 10s-limited configuration for Netlify free tier
   */
  netlify: {
    OPENAI_TRANSCRIBE: 7000,
    OPENAI_CHAT: 7000,
    OPENAI_ANALYSIS: 7000,
    OPENAI_REALTIME_SESSION: 5000,
    PDF_PARSE: 7000,
    FIREBASE_OPERATION: 3000,
  },
  /**
   * Railway/General server preset with higher limits
   */
  railway: {
    OPENAI_TRANSCRIBE: 60000,
    OPENAI_CHAT: 45000,
    OPENAI_ANALYSIS: 60000,
    OPENAI_REALTIME_SESSION: 45000,
    PDF_PARSE: 45000,
    FIREBASE_OPERATION: 10000,
  },
}

const resolvePreset = () => {
  const explicit = process.env.TIMEOUT_PRESET?.toLowerCase()
  if (explicit && TIMEOUT_PRESETS[explicit]) {
    return explicit
  }
  if (process.env.RAILWAY_ENVIRONMENT) {
    return 'railway'
  }
  return 'netlify'
}

export const TIMEOUTS = TIMEOUT_PRESETS[resolvePreset()]

// Maximum content length to prevent timeout (in characters)
// Reduced aggressively for Netlify's 10-second FREE TIER limit
export const MAX_CONTENT_LENGTH = 8000 // ~8k chars to stay within Netlify free tier timeout

