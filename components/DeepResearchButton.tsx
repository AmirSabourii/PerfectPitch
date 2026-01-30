'use client'

import { useState } from 'react'
import { IdeaSummary } from '@/lib/types'
import { Button } from './ui/Button'

interface DeepResearchButtonProps {
  ideaSummary: IdeaSummary
  language: 'en' | 'fa'
  onResearchComplete: (result: any) => void
}

export default function DeepResearchButton({
  ideaSummary,
  language,
  onResearchComplete
}: DeepResearchButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartResearch = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/deep-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaSummary, language })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to perform deep research')
      }

      onResearchComplete(data)
    } catch (err: any) {
      console.error('Deep research error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleStartResearch}
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {language === 'fa' ? 'در حال تحقیق عمیق...' : 'Researching...'}
          </span>
        ) : (
          language === 'fa' ? '🔍 شروع تحقیق عمیق' : '🔍 Start Deep Research'
        )}
      </Button>

      {error && (
        <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}
