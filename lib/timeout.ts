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
 * Adjusted for Netlify's 10-second FREE TIER limit
 * 
 * CRITICAL: Netlify free tier has 10-second HARD LIMIT
 * These timeouts must be LESS than 10 seconds to allow for:
 * - Auth verification (~1-2s)
 * - Request parsing (~0.5s)
 * - Response overhead (~0.5s)
 * - Total budget: ~7-8 seconds for OpenAI
 */
export const TIMEOUTS = {
  OPENAI_TRANSCRIBE: 7000, // 7 seconds for audio transcription (Netlify free tier)
  OPENAI_CHAT: 7000, // 7 seconds for chat completion (Netlify free tier)
  OPENAI_ANALYSIS: 7000, // 7 seconds for pitch analysis (Netlify free tier)
  OPENAI_REALTIME_SESSION: 5000, // 5 seconds for session creation
  PDF_PARSE: 7000, // 7 seconds for PDF parsing (Netlify free tier)
  FIREBASE_OPERATION: 3000, // 3 seconds for Firebase operations (Netlify free tier)
}

// Maximum content length to prevent timeout (in characters)
// Reduced aggressively for Netlify's 10-second FREE TIER limit
export const MAX_CONTENT_LENGTH = 8000 // ~8k chars to stay within Netlify free tier timeout

