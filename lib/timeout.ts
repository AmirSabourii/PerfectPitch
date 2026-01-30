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

// Unlimited timeouts - no artificial constraints
const UNLIMITED_CONFIG: TimeoutConfig = {
  OPENAI_TRANSCRIBE: 600000, // 10 minutes
  OPENAI_CHAT: 600000, // 10 minutes
  OPENAI_ANALYSIS: 600000, // 10 minutes - enough for complex analysis
  OPENAI_REALTIME_SESSION: 300000, // 5 minutes
  PDF_PARSE: 300000, // 5 minutes
  FIREBASE_OPERATION: 60000, // 1 minute
}

export const TIMEOUTS = UNLIMITED_CONFIG

// No content length restrictions - let OpenAI handle it
export const MAX_CONTENT_LENGTH = 100000 // 100k chars - reasonable limit for token constraints

