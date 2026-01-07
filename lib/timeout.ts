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

/**
 * Timeout values for different operations (in milliseconds)
 */
export const TIMEOUTS = {
  OPENAI_TRANSCRIBE: 60000, // 60 seconds for audio transcription
  OPENAI_CHAT: 30000, // 30 seconds for chat completion
  OPENAI_ANALYSIS: 120000, // 120 seconds for pitch analysis (can be long)
  OPENAI_REALTIME_SESSION: 15000, // 15 seconds for session creation
  PDF_PARSE: 30000, // 30 seconds for PDF parsing
  FIREBASE_OPERATION: 10000, // 10 seconds for Firebase operations
}

