'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PerfectPitchAnalysis } from '@/lib/perfectPitchTypes'
import { useLanguage } from '@/contexts/LanguageContext'
import { analysisResultCopy } from '@/lib/i18n-analysis'
import { ReasoningDisplay } from './ReasoningDisplay'
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Target,
  TrendingUp,
  Shield,
  Zap,
  Eye,
  MessageSquare,
  ArrowRight,
  RotateCcw,
  FileText,
  AlertCircle,
  Brain,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PerfectPitchResultProps {
  analysis: PerfectPitchAnalysis
  onReset: () => void
}

export default function PerfectPitchResult({
  analysis,
  onReset,
}: PerfectPitchResultProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'stage1' | 'stage2' | 'stage3' | 'raw_data'>('overview')
  const { language } = useLanguage()
  const copy = analysisResultCopy[language]

  // SAFE DISPLAY HELPER - نمایش امن با fallback به "-"
  const safeDisplay = (value: any, fallback: string = '-'): string => {
    if (value === null || value === undefined || value === '') return fallback
    if (typeof value === 'string') return value
    if (typeof value === 'number') return value.toString()
    if (typeof value === 'boolean') return value ? '✓' : '✗'
    return fallback
  }

  // SAFE ARRAY CHECK - بررسی امن array
  const safeArray = (arr: any): any[] => {
    return Array.isArray(arr) && arr.length > 0 ? arr : []
  }

  // SAFE OBJECT CHECK - بررسی امن object
  const safeObject = (obj: any): boolean => {
    return obj !== null && obj !== undefined && typeof obj === 'object'
  }

  // CRITICAL: Safe extraction - support BOTH flat and nested structures
  const stage1 = analysis?.stage1
  const stage2 = analysis?.stage2
  const stage3 = analysis?.stage3
  
  // Stage 3 can have tests at root OR nested - support both
  const tests = stage3?.final_investor_tests || {
    consistency_test: stage3?.consistency_test,
    assumption_stress_test: stage3?.assumption_stress_test,
    objection_coverage_test: stage3?.objection_coverage_test,
    clarity_under_pressure_test: stage3?.clarity_under_pressure_test,
    market_believability_test: stage3?.market_believability_test,
    story_coherence_test: stage3?.story_coherence_test,
  }
  
  // Readiness score can be in different fields
  const readinessScoring = stage3?.final_readiness_score || stage3?.final_readiness_scoring
  const readinessScore = readinessScoring?.score_0_to_100 ?? readinessScoring?.overall_readiness ?? null
  const readinessBand = readinessScoring?.readiness_band ?? null
  
  // Gate verdict - با fallback به null
  const passReview = stage3?.investor_gate_verdict?.pass_human_review ?? null
  const confidenceLevel = stage3?.investor_gate_verdict?.confidence_level ?? null
  const blockingReason = stage3?.investor_gate_verdict?.main_blocking_reason ?? null
  
  // Stage 1 scores - با fallback به null
  const ideaScore = stage1?.ideaQuality?.score ?? null
  const pitchScore = stage1?.pitchQuality?.score ?? null

  const tabs = [
    { id: 'overview', label: copy.tabs.overview, icon: Eye },
    { id: 'stage1', label: copy.tabs.stage1, icon: Target },
    { id: 'stage2', label: copy.tabs.stage2, icon: TrendingUp },
    { id: 'stage3', label: copy.tabs.stage3, icon: Shield },
    { id: 'raw_data', label: copy.tabs.rawData, icon: FileText },
  ]

  const getScoreColor = (score: number, max: number = 10) => {
    const percentage = (score / max) * 100
    if (percentage >= 75) return 'text-emerald-400'
    if (percentage >= 50) return 'text-amber-400'
    return 'text-red-400'
  }

  const getReadinessBadge = (band: string) => {
    const styles = {
      human_review_ready: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      review: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      weak: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      reject: 'bg-red-500/10 text-red-400 border-red-500/20',
    }
    const labels = {
      human_review_ready: copy.readinessBands.human_review_ready,
      review: copy.readinessBands.review,
      weak: copy.readinessBands.weak,
      reject: copy.readinessBands.reject,
    }
    return { style: styles[band as keyof typeof styles] || styles.reject, label: labels[band as keyof typeof labels] || band }
  }

  // If no analysis data, show error state
  if (!analysis || !stage1 || !stage2 || !stage3) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950 rounded-3xl border border-zinc-900">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">{copy.common.analysisDataMissing}</h3>
          <p className="text-zinc-400 mb-6">{copy.common.analysisIncomplete}</p>
          <button
            onClick={onReset}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            {copy.common.tryAgain}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-900 shadow-2xl">
      {/* Top Navigation Bar */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02] backdrop-blur-xl shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">PerfectPitch</h2>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
              {analysis?.metadata?.analyzedAt ? new Date(analysis.metadata.analyzedAt).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US') : '-'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center p-1 rounded-full bg-black/40 border border-white/5 backdrop-blur-md">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-2',
                  activeTab === tab.id
                    ? 'bg-white text-black shadow-lg shadow-white/10'
                    : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="p-2 text-zinc-500 hover:text-white transition-colors"
            title={copy.common.resetAnalysis}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative scrollbar-hide">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-zinc-950/0 to-zinc-950/0 pointer-events-none" />

        <div className="p-8 max-w-6xl mx-auto space-y-12 pb-24">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Hero Score Section */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="col-span-12 md:col-span-5">
                  <div className="relative aspect-square flex items-center justify-center">
                    <div className="absolute inset-0 border border-white/5 rounded-full" />
                    <div className="absolute inset-4 border border-white/5 rounded-full border-dashed animate-[spin_60s_linear_infinite]" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full blur-2xl" />

                    <div className="text-center relative z-10">
                      <span className={cn('text-8xl font-light tracking-tighter block leading-none', readinessScore !== null ? getScoreColor(readinessScore, 100) : 'text-zinc-600')}>
                        {readinessScore !== null ? readinessScore : '-'}
                      </span>
                      <span className="text-sm text-zinc-500 font-medium uppercase tracking-widest mt-2 block">
                        {copy.overview.readinessScore}
                      </span>
                    </div>

                    {readinessBand && (
                      <div className="absolute top-0 right-0">
                        <div className={cn('px-3 py-1 rounded-full border text-xs font-semibold', getReadinessBadge(readinessBand).style)}>
                          {getReadinessBadge(readinessBand).label}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-12 md:col-span-7 flex flex-col justify-center space-y-6">
                  {/* Investor Gate Verdict */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
                      {copy.overview.investorGateVerdict}
                    </h3>
                    <div className="flex items-center gap-4 mb-4">
                      {passReview !== null ? (
                        passReview ? (
                          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        ) : (
                          <XCircle className="w-8 h-8 text-red-400" />
                        )
                      ) : (
                        <AlertCircle className="w-8 h-8 text-zinc-600" />
                      )}
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {passReview !== null ? (passReview ? copy.overview.pass : copy.overview.needsWork) : '-'}
                        </p>
                        {confidenceLevel && (
                          <p className="text-xs text-zinc-500">
                            {copy.overview.confidence}: {confidenceLevel.toUpperCase()}
                          </p>
                        )}
                      </div>
                    </div>
                    {blockingReason && (
                      <p className="text-sm text-zinc-300 bg-black/20 p-3 rounded-lg mb-4">
                        {blockingReason}
                      </p>
                    )}
                    {/* Display Verdict Reasoning if available */}
                    {stage3?.investor_gate_verdict?.verdictReasoning && (
                      <div className="mt-4">
                        <ReasoningDisplay 
                          title="Verdict Analysis" 
                          reasoning={stage3.investor_gate_verdict.verdictReasoning}
                          type="decision"
                          defaultExpanded={false}
                        />
                      </div>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <h4 className="flex items-center gap-2 text-white text-xs font-bold uppercase mb-2">
                        <TrendingUp className="w-4 h-4" /> {copy.overview.ideaQuality}
                      </h4>
                      <p className={cn('text-2xl font-light', ideaScore !== null ? getScoreColor(ideaScore) : 'text-zinc-600')}>
                        {ideaScore !== null ? `${ideaScore}/10` : '-'}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <h4 className="flex items-center gap-2 text-white text-xs font-bold uppercase mb-2">
                        <MessageSquare className="w-4 h-4" /> {copy.overview.pitchQuality}
                      </h4>
                      <p className={cn('text-2xl font-light', pitchScore !== null ? getScoreColor(pitchScore) : 'text-zinc-600')}>
                        {pitchScore !== null ? `${pitchScore}/10` : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investor Signals */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {copy.overview.positiveSignals}
                  </h4>
                  <ul className="space-y-2">
                    {safeArray(stage1?.investorSignals?.positive).length > 0 ? (
                      safeArray(stage1.investorSignals.positive).map((signal, i) => (
                        <li key={i} className="text-sm text-zinc-300 pl-3 border-l border-emerald-500/30">
                          {typeof signal === 'string' ? signal : (safeObject(signal) ? safeDisplay(signal.signal) : '-')}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-zinc-500 italic">-</li>
                    )}
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                  <h4 className="text-xs font-bold text-amber-400 uppercase mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {copy.overview.concerns}
                  </h4>
                  <ul className="space-y-2">
                    {safeArray(stage1?.investorSignals?.negative).length > 0 ? (
                      safeArray(stage1.investorSignals.negative).map((signal, i) => (
                        <li key={i} className="text-sm text-zinc-300 pl-3 border-l border-amber-500/30">
                          {typeof signal === 'string' ? signal : (safeObject(signal) ? safeDisplay(signal.signal) : '-')}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-zinc-500 italic">-</li>
                    )}
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10">
                  <h4 className="text-xs font-bold text-red-400 uppercase mb-4 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> {copy.overview.criticalIssues}
                  </h4>
                  <ul className="space-y-2">
                    {safeArray(stage1?.investorSignals?.critical).length > 0 ? (
                      safeArray(stage1.investorSignals.critical).map((signal, i) => (
                        <li key={i} className="text-sm text-zinc-300 pl-3 border-l border-red-500/30">
                          {typeof signal === 'string' ? signal : (safeObject(signal) ? safeDisplay(signal.signal) : '-')}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-zinc-500 italic">-</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Reasoning Transparency Section */}
              {safeObject(stage1?.overallReasoningTransparency) && (
                <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-400" />
                    Analysis Transparency
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {safeArray(stage1.overallReasoningTransparency.keyAssumptions).length > 0 && (
                      <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">Key Assumptions</h4>
                        <ul className="space-y-1">
                          {safeArray(stage1.overallReasoningTransparency.keyAssumptions).map((item, i) => (
                            <li key={i} className="text-xs text-zinc-300 pl-2 border-l border-indigo-500/30">
                              {safeDisplay(item)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {safeArray(stage1.overallReasoningTransparency.uncertaintyAreas).length > 0 && (
                      <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">Uncertainty Areas</h4>
                        <ul className="space-y-1">
                          {safeArray(stage1.overallReasoningTransparency.uncertaintyAreas).map((item, i) => (
                            <li key={i} className="text-xs text-zinc-300 pl-2 border-l border-amber-500/30">
                              {safeDisplay(item)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {safeDisplay(stage1.overallReasoningTransparency.dataQuality) !== '-' && (
                      <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">Data Quality Assessment</h4>
                        <p className="text-xs text-zinc-300">{safeDisplay(stage1.overallReasoningTransparency.dataQuality)}</p>
                      </div>
                    )}
                    {safeDisplay(stage1.overallReasoningTransparency.biasCheck) !== '-' && (
                      <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">Bias Check</h4>
                        <p className="text-xs text-zinc-300">{safeDisplay(stage1.overallReasoningTransparency.biasCheck)}</p>
                      </div>
                    )}
                  </div>
                  {safeArray(stage1.overallReasoningTransparency.alternativeInterpretations).length > 0 && (
                    <div className="mt-4 p-4 rounded-xl bg-black/20 border border-white/5">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">Alternative Interpretations Considered</h4>
                      <ul className="space-y-1">
                        {safeArray(stage1.overallReasoningTransparency.alternativeInterpretations).map((item, i) => (
                          <li key={i} className="text-xs text-zinc-300 pl-2 border-l border-purple-500/30">
                            {safeDisplay(item)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* RAW DATA TAB - Always show this so user can see what AI returned */}
          {activeTab === 'raw_data' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {copy.rawData.completeAnalysisData}
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(analysis, null, 2))
                      alert(copy.rawData.copied)
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
                  >
                    {copy.rawData.copyJson}
                  </button>
                </div>
                <pre className="bg-black/40 p-6 rounded-xl overflow-x-auto text-xs text-zinc-300 font-mono border border-white/5 max-h-[600px] overflow-y-auto">
                  {JSON.stringify(analysis, null, 2)}
                </pre>
              </div>

              {/* Metadata */}
              {analysis?.metadata && (
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-4">{copy.rawData.analysisMetadata}</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">{copy.rawData.analyzedAt}</h4>
                      <p className="text-sm text-zinc-300">{new Date(analysis.metadata.analyzedAt).toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US')}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">{copy.rawData.pitchDeckLength}</h4>
                      <p className="text-sm text-zinc-300">{analysis.metadata.pitchDeckLength} {copy.rawData.characters}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">{copy.rawData.processingTime}</h4>
                      <p className="text-sm text-zinc-300">{(analysis.metadata.processingTimeMs / 1000).toFixed(2)}{copy.rawData.seconds}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Other tabs - Show actual data if available */}
          {activeTab === 'stage3' && tests && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-6">Six Critical Investor Tests</h3>
                
                <div className="space-y-6">
                  {/* Consistency Test */}
                  {tests.consistency_test && (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-sm font-semibold text-white">1. Consistency Test</h4>
                        <span className={cn('text-lg font-mono font-semibold', getScoreColor(tests.consistency_test.score))}>
                          {tests.consistency_test.score}/10
                        </span>
                      </div>
                      {tests.consistency_test.critical_issue && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-3">
                          <p className="text-xs text-red-200">{tests.consistency_test.critical_issue}</p>
                        </div>
                      )}
                      {tests.consistency_test.reasoning && (
                        <ReasoningDisplay 
                          title="Test Reasoning" 
                          reasoning={tests.consistency_test.reasoning}
                          type="test"
                        />
                      )}
                    </div>
                  )}

                  {/* Assumption Stress Test */}
                  {tests.assumption_stress_test && (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-sm font-semibold text-white">2. Assumption Stress Test</h4>
                        <span className={cn('text-lg font-mono font-semibold', getScoreColor(tests.assumption_stress_test.score))}>
                          {tests.assumption_stress_test.score}/10
                        </span>
                      </div>
                      {tests.assumption_stress_test.fatal_dependency && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-3">
                          <p className="text-xs text-red-200">{tests.assumption_stress_test.fatal_dependency}</p>
                        </div>
                      )}
                      {tests.assumption_stress_test.reasoning && (
                        <ReasoningDisplay 
                          title="Test Reasoning" 
                          reasoning={tests.assumption_stress_test.reasoning}
                          type="test"
                        />
                      )}
                    </div>
                  )}

                  {/* Objection Coverage Test */}
                  {tests.objection_coverage_test && (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-sm font-semibold text-white">3. Objection Coverage Test</h4>
                        <span className={cn('text-lg font-mono font-semibold', getScoreColor(tests.objection_coverage_test.score))}>
                          {tests.objection_coverage_test.score}/10
                        </span>
                      </div>
                      {tests.objection_coverage_test.missed_high_impact_item && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-3">
                          <p className="text-xs text-amber-200">{tests.objection_coverage_test.missed_high_impact_item}</p>
                        </div>
                      )}
                      {tests.objection_coverage_test.reasoning && (
                        <ReasoningDisplay 
                          title="Test Reasoning" 
                          reasoning={tests.objection_coverage_test.reasoning}
                          type="test"
                        />
                      )}
                    </div>
                  )}

                  {/* Clarity Under Pressure Test */}
                  {tests.clarity_under_pressure_test && (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-sm font-semibold text-white">4. Clarity Under Pressure Test</h4>
                        <span className={cn('text-lg font-mono font-semibold', getScoreColor(tests.clarity_under_pressure_test.score))}>
                          {tests.clarity_under_pressure_test.score}/10
                        </span>
                      </div>
                      {tests.clarity_under_pressure_test['30s_takeaway'] && (
                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg mb-3">
                          <p className="text-xs text-zinc-400 mb-1">30-Second Takeaway:</p>
                          <p className="text-sm text-indigo-200">{tests.clarity_under_pressure_test['30s_takeaway']}</p>
                        </div>
                      )}
                      {tests.clarity_under_pressure_test.reasoning && (
                        <ReasoningDisplay 
                          title="Test Reasoning" 
                          reasoning={tests.clarity_under_pressure_test.reasoning}
                          type="test"
                        />
                      )}
                    </div>
                  )}

                  {/* Market Believability Test */}
                  {tests.market_believability_test && (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-sm font-semibold text-white">5. Market Believability Test</h4>
                        <span className={cn('text-lg font-mono font-semibold', getScoreColor(tests.market_believability_test.score))}>
                          {tests.market_believability_test.score}/10
                        </span>
                      </div>
                      {tests.market_believability_test.unconvincing_claim && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-3">
                          <p className="text-xs text-amber-200">{tests.market_believability_test.unconvincing_claim}</p>
                        </div>
                      )}
                      {tests.market_believability_test.reasoning && (
                        <ReasoningDisplay 
                          title="Test Reasoning" 
                          reasoning={tests.market_believability_test.reasoning}
                          type="test"
                        />
                      )}
                    </div>
                  )}

                  {/* Story Coherence Test */}
                  {tests.story_coherence_test && (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-sm font-semibold text-white">6. Story Coherence Test</h4>
                        <span className={cn('text-lg font-mono font-semibold', getScoreColor(tests.story_coherence_test.score))}>
                          {tests.story_coherence_test.score}/10
                        </span>
                      </div>
                      {tests.story_coherence_test.flow_break_point && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-3">
                          <p className="text-xs text-amber-200">{tests.story_coherence_test.flow_break_point}</p>
                        </div>
                      )}
                      {tests.story_coherence_test.reasoning && (
                        <ReasoningDisplay 
                          title="Test Reasoning" 
                          reasoning={tests.story_coherence_test.reasoning}
                          type="test"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Final Readiness Score Details */}
              {readinessScoring && (
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-400" />
                    Final Readiness Score
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Overall Score</h4>
                      <p className={cn('text-4xl font-light', readinessScore !== undefined ? getScoreColor(readinessScore, 100) : 'text-zinc-600')}>
                        {readinessScore !== undefined ? `${readinessScore}/100` : copy.common.na}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Readiness Band</h4>
                      {readinessBand && (
                        <div className={cn('inline-block px-4 py-2 rounded-full border text-sm font-semibold', getReadinessBadge(readinessBand).style)}>
                          {getReadinessBadge(readinessBand).label}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Test Scores Breakdown */}
                  {readinessScoring.testScores && (
                    <div className="mt-6 p-4 rounded-xl bg-black/20 border border-white/5">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3">Individual Test Scores</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(readinessScoring.testScores).map(([key, score]) => (
                          <div key={key} className="flex justify-between items-center p-2 bg-white/5 rounded">
                            <span className="text-xs text-zinc-400">{key}</span>
                            <span className={cn('text-sm font-mono font-semibold', getScoreColor(score as number))}>
                              {score}/10
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scoring Methodology */}
                  {readinessScoring.scoringMethodology && (
                    <div className="mt-6">
                      <ReasoningDisplay 
                        title="Scoring Methodology" 
                        reasoning={readinessScoring.scoringMethodology}
                        type="score"
                        defaultExpanded={false}
                      />
                    </div>
                  )}

                  {/* Band Reasoning */}
                  {readinessScoring.bandReasoning && (
                    <div className="mt-6">
                      <ReasoningDisplay 
                        title="Band Assignment Reasoning" 
                        reasoning={readinessScoring.bandReasoning}
                        type="decision"
                        defaultExpanded={false}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Investor Gate Verdict - Detailed */}
              {stage3?.investor_gate_verdict && (
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    Final Investor Gate Verdict
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3">Pass Human Review</h4>
                      <div className="flex items-center gap-3">
                        {passReview !== undefined ? (
                          passReview ? (
                            <>
                              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                              <span className="text-xl font-semibold text-emerald-400">YES</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-8 h-8 text-red-400" />
                              <span className="text-xl font-semibold text-red-400">NO</span>
                            </>
                          )
                        ) : (
                          <>
                            <AlertCircle className="w-8 h-8 text-zinc-600" />
                            <span className="text-xl font-semibold text-zinc-600">N/A</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3">Confidence Level</h4>
                      <span className={cn(
                        'text-xl font-semibold uppercase',
                        confidenceLevel === 'high' ? 'text-emerald-400' :
                        confidenceLevel === 'medium' ? 'text-amber-400' : 'text-red-400'
                      )}>
                        {confidenceLevel || copy.common.na}
                      </span>
                    </div>
                  </div>

                  {blockingReason && (
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 mb-6">
                      <h4 className="text-xs font-bold text-red-400 uppercase mb-2">Main Blocking Reason</h4>
                      <p className="text-sm text-zinc-300">{blockingReason}</p>
                    </div>
                  )}

                  {/* Verdict Reasoning - Full Display */}
                  {stage3.investor_gate_verdict.verdictReasoning && (
                    <div className="mt-6">
                      <ReasoningDisplay 
                        title="Complete Verdict Reasoning" 
                        reasoning={stage3.investor_gate_verdict.verdictReasoning}
                        type="decision"
                        defaultExpanded={true}
                      />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* STAGE 1 TAB - Investor Simulation */}
          {activeTab === 'stage1' && stage1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Startup Reconstruction */}
              {safeObject(stage1.startupReconstruction) && (
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-400" />
                    Startup Reconstruction
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Problem</h4>
                      <p className="text-sm text-zinc-300">{safeDisplay(stage1.startupReconstruction.problem)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Solution</h4>
                      <p className="text-sm text-zinc-300">{safeDisplay(stage1.startupReconstruction.solution)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Customer</h4>
                      <p className="text-sm text-zinc-300">{safeDisplay(stage1.startupReconstruction.customer)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Market</h4>
                      <p className="text-sm text-zinc-300">{safeDisplay(stage1.startupReconstruction.market)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5 md:col-span-2">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Business Model</h4>
                      <p className="text-sm text-zinc-300">{safeDisplay(stage1.startupReconstruction.businessModel)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Idea & Pitch Quality */}
              <div className="grid md:grid-cols-2 gap-6">
                {safeObject(stage1.ideaQuality) && (
                  <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Idea Quality
                      </h3>
                      <span className={cn('text-3xl font-light', getScoreColor(stage1.ideaQuality.score))}>
                        {safeDisplay(stage1.ideaQuality.score)}/10
                      </span>
                    </div>
                    <div className="space-y-3">
                      {typeof stage1.ideaQuality.reasoning === 'object' ? (
                        <ReasoningDisplay 
                          title="Detailed Reasoning" 
                          reasoning={stage1.ideaQuality.reasoning}
                          type="score"
                          defaultExpanded={false}
                        />
                      ) : (
                        <div>
                          <h4 className="text-xs font-bold text-zinc-500 uppercase mb-1">Reasoning</h4>
                          <p className="text-sm text-zinc-300">{safeDisplay(stage1.ideaQuality.reasoning)}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-1">Fundamental Strength</h4>
                        <p className="text-sm text-zinc-300">{safeDisplay(stage1.ideaQuality.fundamentalStrength)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {safeObject(stage1.pitchQuality) && (
                  <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Pitch Quality
                      </h3>
                      <span className={cn('text-3xl font-light', getScoreColor(stage1.pitchQuality.score))}>
                        {safeDisplay(stage1.pitchQuality.score)}/10
                      </span>
                    </div>
                    <div className="space-y-3">
                      {typeof stage1.pitchQuality.reasoning === 'object' ? (
                        <ReasoningDisplay 
                          title="Detailed Reasoning" 
                          reasoning={stage1.pitchQuality.reasoning}
                          type="score"
                          defaultExpanded={false}
                        />
                      ) : (
                        <div>
                          <h4 className="text-xs font-bold text-zinc-500 uppercase mb-1">Reasoning</h4>
                          <p className="text-sm text-zinc-300">{safeDisplay(stage1.pitchQuality.reasoning)}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-1">Presentation Effectiveness</h4>
                        <p className="text-sm text-zinc-300">{safeDisplay(stage1.pitchQuality.presentationEffectiveness)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pattern Matching */}
              {safeObject(stage1.patternMatching) && (
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-6">Pattern Matching</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2">Similar Successes</h4>
                      <ul className="space-y-1">
                        {safeArray(stage1.patternMatching.similarSuccesses).length > 0 ? (
                          safeArray(stage1.patternMatching.similarSuccesses).map((item, i) => (
                            <li key={i} className="text-xs text-zinc-300">• {typeof item === 'string' ? item : (safeObject(item) ? safeDisplay(item.company) : '-')}</li>
                          ))
                        ) : (
                          <li className="text-xs text-zinc-500 italic">-</li>
                        )}
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                      <h4 className="text-xs font-bold text-red-400 uppercase mb-2">Similar Failures</h4>
                      <ul className="space-y-1">
                        {safeArray(stage1.patternMatching.similarFailures).length > 0 ? (
                          safeArray(stage1.patternMatching.similarFailures).map((item, i) => (
                            <li key={i} className="text-xs text-zinc-300">• {typeof item === 'string' ? item : (safeObject(item) ? safeDisplay(item.company) : '-')}</li>
                          ))
                        ) : (
                          <li className="text-xs text-zinc-500 italic">-</li>
                        )}
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                      <h4 className="text-xs font-bold text-indigo-400 uppercase mb-2">Unique Aspects</h4>
                      <ul className="space-y-1">
                        {safeArray(stage1.patternMatching.uniqueAspects).length > 0 ? (
                          safeArray(stage1.patternMatching.uniqueAspects).map((item, i) => (
                            <li key={i} className="text-xs text-zinc-300">• {safeDisplay(item)}</li>
                          ))
                        ) : (
                          <li className="text-xs text-zinc-500 italic">-</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Investment Readiness & Raw Verdict */}
              <div className="grid md:grid-cols-2 gap-6">
                {safeObject(stage1.investmentReadiness) && (
                  <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Investment Readiness</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-xs text-zinc-500">Stage</span>
                        <span className="text-sm text-white font-medium">{safeDisplay(stage1.investmentReadiness.stage)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-xs text-zinc-500">Readiness</span>
                        <span className="text-sm text-white font-medium">{safeDisplay(stage1.investmentReadiness.readiness)}</span>
                      </div>
                      <div className="pt-2">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Gap to Fundable</h4>
                        <p className="text-sm text-zinc-300">{safeDisplay(stage1.investmentReadiness.gapToFundable)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {safeObject(stage1.rawVerdict) && (
                  <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Raw Verdict</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-xs text-zinc-500">Decision</span>
                        <span className={cn(
                          'text-sm font-bold uppercase',
                          stage1.rawVerdict.decision?.toLowerCase() === 'pass' ? 'text-red-400' : 
                          stage1.rawVerdict.decision?.toLowerCase() === 'proceed' ? 'text-emerald-400' : 'text-amber-400'
                        )}>
                          {safeDisplay(stage1.rawVerdict.decision)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-xs text-zinc-500">Confidence</span>
                        <span className="text-sm text-white font-medium">{safeDisplay(stage1.rawVerdict.confidence)}</span>
                      </div>
                      <div className="pt-2">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Key Reason</h4>
                        <p className="text-sm text-zinc-300">{safeDisplay(stage1.rawVerdict.keyReason)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STAGE 2 TAB - Decision Engine */}
          {activeTab === 'stage2' && stage2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Scorecard */}
              {stage2.scorecard && (
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    Investment Scorecard
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(stage2.scorecard).map(([key, data]: [string, any]) => (
                      <div key={key} className="p-4 rounded-xl bg-black/20 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-white">{key}</h4>
                          <span className={cn('text-2xl font-light', getScoreColor(data.score))}>
                            {data.score}/10
                          </span>
                        </div>
                        {typeof data.reasoning === 'object' ? (
                          <ReasoningDisplay 
                            title="Score Reasoning" 
                            reasoning={data.reasoning}
                            type="score"
                          />
                        ) : (
                          <p className="text-xs text-zinc-400">{data.reasoning || copy.common.na}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gap Diagnosis */}
              {safeObject(stage2.gapDiagnosis) && (
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-6">Gap Diagnosis</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                      <h4 className="text-xs font-bold text-red-400 uppercase mb-2">Biggest Value Gap</h4>
                      <p className="text-sm text-zinc-300">{typeof stage2.gapDiagnosis.biggestValueGap === 'string' ? safeDisplay(stage2.gapDiagnosis.biggestValueGap) : (safeObject(stage2.gapDiagnosis.biggestValueGap) ? safeDisplay(stage2.gapDiagnosis.biggestValueGap.issue) : '-')}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2">Fastest Credibility Win</h4>
                      <p className="text-sm text-zinc-300">{typeof stage2.gapDiagnosis.fastestCredibilityWin === 'string' ? safeDisplay(stage2.gapDiagnosis.fastestCredibilityWin) : (safeObject(stage2.gapDiagnosis.fastestCredibilityWin) ? safeDisplay(stage2.gapDiagnosis.fastestCredibilityWin.action) : '-')}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <h4 className="text-xs font-bold text-amber-400 uppercase mb-2">Dangerous Illusions</h4>
                      {safeArray(stage2.gapDiagnosis.dangerousIllusions).length > 0 ? (
                        <ul className="space-y-1">
                          {safeArray(stage2.gapDiagnosis.dangerousIllusions).map((item, i) => (
                            <li key={i} className="text-xs text-zinc-300">• {typeof item === 'string' ? item : (safeObject(item) ? safeDisplay(item.illusion) : '-')}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-zinc-300">-</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Prioritized Checklist */}
              {safeObject(stage2.prioritizedChecklist) && (
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-6">Prioritized Action Checklist</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                      <h4 className="text-xs font-bold text-red-400 uppercase mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" /> High Priority (Must Fix)
                      </h4>
                      <ul className="space-y-2">
                        {safeArray(stage2.prioritizedChecklist.high).length > 0 ? (
                          safeArray(stage2.prioritizedChecklist.high).map((item, i) => (
                            <li key={i} className="text-xs text-zinc-300 pl-3 border-l border-red-500/30">{typeof item === 'string' ? item : (safeObject(item) ? safeDisplay(item.item) : '-')}</li>
                          ))
                        ) : (
                          <li className="text-xs text-zinc-500 italic">-</li>
                        )}
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <h4 className="text-xs font-bold text-amber-400 uppercase mb-3 flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" /> Medium Priority (Should Fix)
                      </h4>
                      <ul className="space-y-2">
                        {safeArray(stage2.prioritizedChecklist.medium).length > 0 ? (
                          safeArray(stage2.prioritizedChecklist.medium).map((item, i) => (
                            <li key={i} className="text-xs text-zinc-300 pl-3 border-l border-amber-500/30">{typeof item === 'string' ? item : (safeObject(item) ? safeDisplay(item.item) : '-')}</li>
                          ))
                        ) : (
                          <li className="text-xs text-zinc-500 italic">-</li>
                        )}
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                      <h4 className="text-xs font-bold text-blue-400 uppercase mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" /> Low Priority (Nice to Have)
                      </h4>
                      <ul className="space-y-2">
                        {safeArray(stage2.prioritizedChecklist.low).length > 0 ? (
                          safeArray(stage2.prioritizedChecklist.low).map((item, i) => (
                            <li key={i} className="text-xs text-zinc-300 pl-3 border-l border-blue-500/30">{typeof item === 'string' ? item : (safeObject(item) ? safeDisplay(item.item) : '-')}</li>
                          ))
                        ) : (
                          <li className="text-xs text-zinc-500 italic">-</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Decision Logic & Improvement Potential */}
              <div className="grid md:grid-cols-2 gap-6">
                {safeObject(stage2.decisionLogic) && (
                  <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Decision Logic</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-xs text-zinc-500">Decision</span>
                        <span className={cn(
                          'text-sm font-bold uppercase',
                          stage2.decisionLogic.decision?.toLowerCase() === 'pass' ? 'text-red-400' : 
                          stage2.decisionLogic.decision?.toLowerCase() === 'proceed' ? 'text-emerald-400' : 'text-amber-400'
                        )}>
                          {safeDisplay(stage2.decisionLogic.decision)}
                        </span>
                      </div>
                      <div className="pt-2">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Reasoning</h4>
                        <p className="text-sm text-zinc-300">{typeof stage2.decisionLogic.reasoning === 'string' ? safeDisplay(stage2.decisionLogic.reasoning) : '-'}</p>
                      </div>
                      {safeArray(stage2.decisionLogic.conditions).length > 0 && (
                        <div className="pt-2">
                          <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Conditions</h4>
                          <ul className="space-y-1">
                            {safeArray(stage2.decisionLogic.conditions).map((condition, i) => (
                              <li key={i} className="text-xs text-zinc-300">• {safeDisplay(condition)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {typeof stage2.decisionLogic.conditions === 'string' && safeDisplay(stage2.decisionLogic.conditions) !== '-' && (
                        <div className="pt-2">
                          <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Conditions</h4>
                          <p className="text-sm text-zinc-300">{safeDisplay(stage2.decisionLogic.conditions)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {safeObject(stage2.improvementPotential) && (
                  <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Improvement Potential</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-500">Current Score</span>
                        <span className={cn('text-3xl font-light', stage2.improvementPotential.current !== null && stage2.improvementPotential.current !== undefined ? getScoreColor(stage2.improvementPotential.current) : 'text-zinc-600')}>
                          {safeDisplay(stage2.improvementPotential.current)}/10
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-500">Realistic Target</span>
                        <span className="text-2xl font-light text-emerald-400">
                          {safeDisplay(stage2.improvementPotential.target)}/10
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-500">Best Case Ceiling</span>
                        <span className="text-2xl font-light text-indigo-400">
                          {safeDisplay(stage2.improvementPotential.ceiling)}/10
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-white/5">
                        <span className="text-xs text-zinc-500">Confidence</span>
                        <span className="text-sm text-white font-medium">{safeDisplay(stage2.improvementPotential.confidence)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'stage3' && !tests && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Data Incomplete</h3>
              <p className="text-zinc-400 mb-4">
                Some analysis data is missing. Please check the Raw Data tab to see what was returned.
              </p>
              <button
                onClick={() => setActiveTab('raw_data')}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                View Raw Data
              </button>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}
