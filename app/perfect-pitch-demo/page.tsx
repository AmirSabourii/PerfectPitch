'use client'

import { useState } from 'react'
import { usePerfectPitch } from '@/hooks/usePerfectPitch'
import PerfectPitchResult from '@/components/PerfectPitchResult'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Loader2, Upload, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PerfectPitchDemo() {
  const { analyze, reset, loading, error, analysis, progress } = usePerfectPitch()
  const [pitchContent, setPitchContent] = useState('')
  const [stage, setStage] = useState('seed')
  const [industry, setIndustry] = useState('Tech/SaaS')

  const handleAnalyze = () => {
    if (!pitchContent.trim()) {
      alert('Please enter pitch deck content')
      return
    }

    analyze({
      pitchDeckContent: pitchContent,
      stage,
      industry,
      targetInvestorType: 'VC',
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    setPitchContent(text)
  }

  if (analysis) {
    return <PerfectPitchResult analysis={analysis} onReset={reset} />
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">PerfectPitch Analysis</h1>
          <p className="text-zinc-400">
            Three-stage investor-grade pitch deck analysis powered by advanced AI
          </p>
        </div>

        {/* Input Form */}
        <Card className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Pitch Deck Content
              </label>
              <textarea
                value={pitchContent}
                onChange={(e) => setPitchContent(e.target.value)}
                placeholder="Paste your pitch deck content here (slides text, transcript, etc.)"
                className="w-full h-64 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                <Upload className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-300">Upload Text File</span>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pre-seed">Pre-Seed</option>
                <option value="seed">Seed</option>
                <option value="series-a">Series A</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Industry
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Tech/SaaS, FinTech, HealthTech"
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={loading || !pitchContent.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {progress.message || 'Analyzing...'}
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Analyze Pitch Deck
              </>
            )}
          </Button>

          {/* Progress Indicator */}
          <AnimatePresence>
            {loading && progress.stage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Stage {progress.stage} of 3</span>
                  <span className="text-zinc-500">{Math.round((progress.stage / 3) * 100)}%</span>
                </div>
                <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(progress.stage / 3) * 100}%` }}
                    className="h-full bg-indigo-500"
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-zinc-500 text-center">{progress.message}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-zinc-900/50">
            <h3 className="text-sm font-semibold text-white mb-2">Stage 1</h3>
            <p className="text-xs text-zinc-400">
              Investor simulation and truth extraction from your pitch
            </p>
          </Card>
          <Card className="p-6 bg-zinc-900/50">
            <h3 className="text-sm font-semibold text-white mb-2">Stage 2</h3>
            <p className="text-xs text-zinc-400">
              Scorecard generation and prioritized action checklist
            </p>
          </Card>
          <Card className="p-6 bg-zinc-900/50">
            <h3 className="text-sm font-semibold text-white mb-2">Stage 3</h3>
            <p className="text-xs text-zinc-400">
              Six critical investor tests and final gate verdict
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
