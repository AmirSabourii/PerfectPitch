import { useState } from 'react'
import { PerfectPitchAnalysis, PerfectPitchInput } from '@/lib/perfectPitchTypes'

export function usePerfectPitch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<PerfectPitchAnalysis | null>(null)
  const [progress, setProgress] = useState<{
    stage: 1 | 2 | 3 | null
    message: string
  }>({ stage: null, message: '' })

  const analyze = async (input: PerfectPitchInput) => {
    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      // Simulate progress updates (since we can't get real-time updates from API)
      setProgress({ stage: 1, message: 'Running investor simulation...' })

      const response = await fetch('/api/perfect-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }

      setProgress({ stage: 2, message: 'Generating scorecard and checklist...' })

      const result: PerfectPitchAnalysis = await response.json()

      setProgress({ stage: 3, message: 'Running final validation tests...' })

      setAnalysis(result)
      setProgress({ stage: null, message: 'Analysis complete!' })
    } catch (err: any) {
      console.error('PerfectPitch analysis error:', err)
      setError(err.message || 'Failed to analyze pitch deck')
      setProgress({ stage: null, message: '' })
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setAnalysis(null)
    setError(null)
    setProgress({ stage: null, message: '' })
  }

  return {
    analyze,
    reset,
    loading,
    error,
    analysis,
    progress,
  }
}
