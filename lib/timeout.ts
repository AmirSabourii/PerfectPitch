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
 * Adjusted for Netlify's 10-second free tier / 26-second Pro tier limits
 * 
 * IMPORTANT: Netlify free tier has 10-second timeout, Pro has 26 seconds
 * These timeouts must be LESS than the platform limit to allow for overhead
 */
export const TIMEOUTS = {
  OPENAI_TRANSCRIBE: 20000, // 20 seconds for audio transcription (reduced for Netlify)
  OPENAI_CHAT: 15000, // 15 seconds for chat completion (reduced for Netlify)
  OPENAI_ANALYSIS: 20000, // 20 seconds for pitch analysis (reduced for Netlify)
  OPENAI_REALTIME_SESSION: 8000, // 8 seconds for session creation
  PDF_PARSE: 15000, // 15 seconds for PDF parsing (reduced for Netlify)
  FIREBASE_OPERATION: 5000, // 5 seconds for Firebase operations (reduced for Netlify)
}

// Maximum content length to prevent timeout (in characters)
// Reduced for Netlify's shorter timeout limits
export const MAX_CONTENT_LENGTH = 15000 // ~15k chars to stay within Netlify timeout

