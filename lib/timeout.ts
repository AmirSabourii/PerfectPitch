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
 * Increased significantly to prevent timeout errors during startup
 */
export const TIMEOUTS = {
  OPENAI_TRANSCRIBE: 300000, // 300 seconds (5 minutes) for audio transcription
  OPENAI_CHAT: 120000, // 120 seconds (2 minutes) for chat completion
  OPENAI_ANALYSIS: 300000, // 300 seconds (5 minutes) for pitch analysis - unlimited for startup
  OPENAI_REALTIME_SESSION: 60000, // 60 seconds for session creation
  PDF_PARSE: 120000, // 120 seconds (2 minutes) for PDF parsing
  FIREBASE_OPERATION: 30000, // 30 seconds for Firebase operations
}

// Maximum content length to prevent timeout (in characters)
export const MAX_CONTENT_LENGTH = 30000 // ~30k chars to prevent timeout

