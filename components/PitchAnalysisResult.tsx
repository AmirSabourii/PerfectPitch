'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { 
  ArrowRight, RotateCcw, BarChart3, Lightbulb, Target, MessageSquare, 
  CheckCircle2, AlertCircle, AlertTriangle, CheckSquare, TrendingUp, 
  Users, Zap, Shield, Download, Copy
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Perfect Pitch Analysis Structure
interface PerfectPitchAnalysis {
  stage1?: {
    startupReconstruction?: {
      problem?: string
      solution?: string
      customer?: string
      market?: string
      businessModel?: string
    }
    ideaQuality?: {
      score?: number
      reasoning?: string
      fundamentalStrength?: string
    }
    pitchQuality?: {
      score?: number
      reasoning?: string
      presentationEffectiveness?: string
    }
    investorSignals?: {
      positive?: string[]
      negative?: string[]
      critical?: string[]
    }
    patternMatching?: {
      similarSuccesses?: string[]
      similarFailures?: string[]
      uniqueAspects?: string[]
    }
    investmentReadiness?: {
      stage?: string
      readiness?: string
      gapToFundable?: string
    }
    rawVerdict?: {
      decision?: string
      confidence?: number
      keyReason?: string
    }
  }
  stage2?: {
    scorecard?: Record<string, { score?: number; reasoning?: string }>
    gapDiagnosis?: {
      biggestGap?: string
      fastestWin?: string
      dangerousIllusions?: string
    }
    prioritizedChecklist?: {
      high?: string[]
      medium?: string[]
      low?: string[]
    }
    decisionLogic?: {
      decision?: string
      reasoning?: string
      conditions?: string
    }
    improvementPotential?: {
      current?: number
      target?: number
      ceiling?: number
      confidence?: string
    }
  }
  stage3?: {
    consistency_test?: {
      score?: number
      critical_issue?: string
    }
    assumption_stress_test?: {
      score?: number
      fatal_dependency?: string
    }
    objection_coverage_test?: {
      score?: number
      missed_high_impact_item?: string
    }
    clarity_under_pressure_test?: {
      score?: number
      '30s_takeaway'?: string
    }
    market_believability_test?: {
      score?: number
      unconvincing_claim?: string
    }
    story_coherence_test?: {
      score?: number
      flow_break_point?: string
    }
    final_readiness_scoring?: {
      overall_readiness?: number
      readiness_band?: string
      critical_issue_penalties?: boolean
    }
    investor_gate_verdict?: {
      pass_human_review?: boolean
      confidence_level?: string
      main_blocking_reason?: string
    }
  }
  metadata?: {
    analyzedAt?: string
    pitchDeckLength?: number
    processingTimeMs?: number
  }
}

interface PitchAnalysisResultProps {
  analysis: PerfectPitchAnalysis
  transcript: string
  documentContext?: string
  onStartQnA: () => void
  onReset: () => void
}

export default function PitchAnalysisResult({
  analysis,
  transcript,
  documentContext,
  onStartQnA,
  onReset,
}: PitchAnalysisResultProps) {
  const [activeTab, setActiveTab] = useState('stage1')

  // Debug: Log the analysis structure
  console.log('PitchAnalysisResult received analysis:', JSON.stringify(analysis, null, 2))

  const tabs = [
    { id: 'stage1', label: 'Stage 1' },
    { id: 'stage2', label: 'Stage 2' },
    { id: 'stage3', label: 'Stage 3' },
    { id: 'metadata', label: 'Metadata' }
  ]

  // Helper function to safely display values
  const display = (value: any): string => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'string') return value || '-'
    if (typeof value === 'number') return value.toString()
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    return '-'
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
            <h2 className="text-sm font-semibold text-white tracking-tight">Perfect Pitch Analysis</h2>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
              {analysis.metadata?.analyzedAt ? new Date(analysis.metadata.analyzedAt).toLocaleDateString() : '-'}
            </p>
          </div>
        </div>

        {/* Floating Tabs */}
        <div className="flex items-center p-1 rounded-full bg-black/40 border border-white/5 backdrop-blur-md">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                activeTab === tab.id
                  ? "bg-white text-black shadow-lg shadow-white/10"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="p-2 text-zinc-500 hover:text-white transition-colors"
            title="Reset Analysis"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative scrollbar-hide">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-zinc-950/0 to-zinc-950/0 pointer-events-none" />

        <div className="p-8 max-w-6xl mx-auto space-y-8 pb-24">

          {/* STAGE 1 TAB */}
          {activeTab === 'stage1' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              {/* Startup Reconstruction */}
              <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Startup Reconstruction
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Problem</h4>
                    <p className="text-sm text-zinc-300">{display(analysis.stage1?.startupReconstruction?.problem)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Solution</h4>
                    <p className="text-sm text-zinc-300">{display(analysis.stage1?.startupReconstruction?.solution)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Customer</h4>
                    <p className="text-sm text-zinc-300">{display(analysis.stage1?.startupReconstruction?.customer)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Market</h4>
                    <p className="text-sm text-zinc-300">{display(analysis.stage1?.startupReconstruction?.market)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5 md:col-span-2">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Business Model</h4>
                    <p className="text-sm text-zinc-300">{display(analysis.stage1?.startupReconstruction?.businessModel)}</p>
                  </div>
                </div>
              </div>

              {/* Idea & Pitch Quality */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" /> Idea Quality
                    </h3>
                    <span className="text-3xl font-light text-white">{display(analysis.stage1?.ideaQuality?.score)}</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-1">Reasoning</h4>
                      <p className="text-sm text-zinc-300">{display(analysis.stage1?.ideaQuality?.reasoning)}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-1">Fundamental Strength</h4>
                      <p className="text-sm text-zinc-300">{display(analysis.stage1?.ideaQuality?.fundamentalStrength)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Pitch Quality
                    </h3>
                    <span className="text-3xl font-light text-white">{display(analysis.stage1?.pitchQuality?.score)}</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-1">Reasoning</h4>
                      <p className="text-sm text-zinc-300">{display(analysis.stage1?.pitchQuality?.reasoning)}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-1">Presentation Effectiveness</h4>
                      <p className="text-sm text-zinc-300">{display(analysis.stage1?.pitchQuality?.presentationEffectiveness)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investor Signals */}
              <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Investor Signals
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" /> Positive
                    </h4>
                    <ul className="space-y-2">
                      {(analysis.stage1?.investorSignals?.positive || []).map((item, i) => (
                        <li key={i} className="text-xs text-zinc-300 pl-3 border-l border-emerald-500/30">{item}</li>
                      ))}
                      {(!analysis.stage1?.investorSignals?.positive || analysis.stage1.investorSignals.positive.length === 0) && (
                        <li className="text-xs text-zinc-500 italic">-</li>
                      )}
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <h4 className="text-xs font-bold text-amber-400 uppercase mb-3 flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" /> Negative
                    </h4>
                    <ul className="space-y-2">
                      {(analysis.stage1?.investorSignals?.negative || []).map((item, i) => (
                        <li key={i} className="text-xs text-zinc-300 pl-3 border-l border-amber-500/30">{item}</li>
                      ))}
                      {(!analysis.stage1?.investorSignals?.negative || analysis.stage1.investorSignals.negative.length === 0) && (
                        <li className="text-xs text-zinc-500 italic">-</li>
                      )}
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                    <h4 className="text-xs font-bold text-red-400 uppercase mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" /> Critical
                    </h4>
                    <ul className="space-y-2">
                      {(analysis.stage1?.investorSignals?.critical || []).map((item, i) => (
                        <li key={i} className="text-xs text-zinc-300 pl-3 border-l border-red-500/30">{item}</li>
                      ))}
                      {(!analysis.stage1?.investorSignals?.critical || analysis.stage1.investorSignals.critical.length === 0) && (
                        <li className="text-xs text-zinc-500 italic">-</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Pattern Matching */}
              <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Pattern Matching</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Similar Successes</h4>
                    <ul className="space-y-1">
                      {(analysis.stage1?.patternMatching?.similarSuccesses || []).map((item, i) => (
                        <li key={i} className="text-xs text-zinc-300">• {item}</li>
                      ))}
                      {(!analysis.stage1?.patternMatching?.similarSuccesses || analysis.stage1.patternMatching.similarSuccesses.length === 0) && (
                        <li className="text-xs text-zinc-500 italic">-</li>
                      )}
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Similar Failures</h4>
                    <ul className="space-y-1">
                      {(analysis.stage1?.patternMatching?.similarFailures || []).map((item, i) => (
                        <li key={i} className="text-xs text-zinc-300">• {item}</li>
                      ))}
                      {(!analysis.stage1?.patternMatching?.similarFailures || analysis.stage1.patternMatching.similarFailures.length === 0) && (
                        <li className="text-xs text-zinc-500 italic">-</li>
                      )}
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Unique Aspects</h4>
                    <ul className="space-y-1">
                      {(analysis.stage1?.patternMatching?.uniqueAspects || []).map((item, i) => (
                        <li key={i} className="text-xs text-zinc-300">• {item}</li>
                      ))}
                      {(!analysis.stage1?.patternMatching?.uniqueAspects || analysis.stage1.patternMatching.uniqueAspects.length === 0) && (
                        <li className="text-xs text-zinc-500 italic">-</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Investment Readiness & Raw Verdict */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Investment Readiness</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-xs text-zinc-500">Stage</span>
                      <span className="text-sm text-white font-medium">{display(analysis.stage1?.investmentReadiness?.stage)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-xs text-zinc-500">Readiness</span>
                      <span className="text-sm text-white font-medium">{display(analysis.stage1?.investmentReadiness?.readiness)}</span>
                    </div>
                    <div className="pt-2">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Gap to Fundable</h4>
                      <p className="text-sm text-zinc-300">{display(analysis.stage1?.investmentReadiness?.gapToFundable)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Raw Verdict</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-xs text-zinc-500">Decision</span>
                      <span className={cn(
                        "text-sm font-bold uppercase",
                        analysis.stage1?.rawVerdict?.decision?.toLowerCase() === 'decline' ? 'text-red-400' : 'text-emerald-400'
                      )}>{display(analysis.stage1?.rawVerdict?.decision)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-xs text-zinc-500">Confidence</span>
                      <span className="text-sm text-white font-medium">{display(analysis.stage1?.rawVerdict?.confidence)}</span>
                    </div>
                    <div className="pt-2">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Key Reason</h4>
                      <p className="text-sm text-zinc-300">{display(analysis.stage1?.rawVerdict?.keyReason)}</p>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* STAGE 2 TAB */}
          {activeTab === 'stage2' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              {/* Scorecard */}
              <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Scorecard
                </h3>
                <div className="space-y-4">
                  {analysis.stage2?.scorecard && Object.entries(analysis.stage2.scorecard).map(([key, data]) => (
                    <div key={key} className="p-4 rounded-xl bg-black/20 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-white">{key}</h4>
                        <span className="text-2xl font-light text-white">{display(data.score)}</span>
                      </div>
                      <p className="text-xs text-zinc-400">{display(data.reasoning)}</p>
                    </div>
                  ))}
                  {(!analysis.stage2?.scorecard || Object.keys(analysis.stage2.scorecard).length === 0) && (
                    <div className="text-center text-zinc-500 py-8 italic">No scorecard data available</div>
                  )}
                </div>
              </div>

              {/* Gap Diagnosis */}
              <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Gap Diagnosis</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                    <h4 className="text-xs font-bold text-red-400 uppercase mb-2">Biggest Gap</h4>
                    <p className="text-sm text-zinc-300">{display(analysis.stage2?.gapDiagnosis?.biggestGap)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2">Fastest Win</h4>
                    <p className="text-sm text-zinc-300">{display(analysis.stage2?.gapDiagnosis?.fastestWin)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <h4 className="text-xs font-bold text-amber-400 uppercase mb-2">Dangerous Illusions</h4>
                    <p className="text-sm text-zinc-300">{display(analysis.stage2?.gapDiagnosis?.dangerousIllusions)}</p>
                  </div>
                </div>
              </div>

              {/* Prioritized Checklist */}
              <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" /> Prioritized Checklist
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                    <h4 className="text-xs font-bold text-red-400 uppercase mb-3">High Priority</h4>
                    <ul className="space-y-2">
                      {(analysis.stage2?.prioritizedChecklist?.high || []).map((item, i) => (
                        <li key={i} className="text-xs text-zinc-300 pl-3 border-l border-red-500/30">{item}</li>
                      ))}
                      {(!analysis.stage2?.prioritizedChecklist?.high || analysis.stage2.prioritizedChecklist.high.length === 0) && (
                        <li className="text-xs text-zinc-500 italic">-</li>
                      )}
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <h4 className="text-xs font-bold text-amber-400 uppercase mb-3">Medium Priority</h4>
                    <ul className="space-y-2">
                      {(analysis.stage2?.prioritizedChecklist?.medium || []).map((item, i) => (
                        <li key={i} className="text-xs text-zinc-300 pl-3 border-l border-amber-500/30">{item}</li>
                      ))}
                      {(!analysis.stage2?.prioritizedChecklist?.medium || analysis.stage2.prioritizedChecklist.medium.length === 0) && (
                        <li className="text-xs text-zinc-500 italic">-</li>
                      )}
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <h4 className="text-xs font-bold text-blue-400 uppercase mb-3">Low Priority</h4>
                    <ul className="space-y-2">
                      {(analysis.stage2?.prioritizedChecklist?.low || []).map((item, i) => (
                        <li key={i} className="text-xs text-zinc-300 pl-3 border-l border-blue-500/30">{item}</li>
                      ))}
                      {(!analysis.stage2?.prioritizedChecklist?.low || analysis.stage2.prioritizedChecklist.low.length === 0) && (
                        <li className="text-xs text-zinc-500 italic">-</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Decision Logic & Improvement Potential */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Decision Logic</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-xs text-zinc-500">Decision</span>
                      <span className={cn(
                        "text-sm font-bold uppercase",
                        analysis.stage2?.decisionLogic?.decision?.toLowerCase() === 'decline' ? 'text-red-400' : 'text-emerald-400'
                      )}>{display(analysis.stage2?.decisionLogic?.decision)}</span>
                    </div>
                    <div className="pt-2">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Reasoning</h4>
                      <p className="text-sm text-zinc-300">{display(analysis.stage2?.decisionLogic?.reasoning)}</p>
                    </div>
                    <div className="pt-2">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Conditions</h4>
                      <p className="text-sm text-zinc-300">{display(analysis.stage2?.decisionLogic?.conditions)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Improvement Potential</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-500">Current</span>
                      <span className="text-3xl font-light text-white">{display(analysis.stage2?.improvementPotential?.current)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-500">Target</span>
                      <span className="text-2xl font-light text-emerald-400">{display(analysis.stage2?.improvementPotential?.target)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-500">Ceiling</span>
                      <span className="text-2xl font-light text-indigo-400">{display(analysis.stage2?.improvementPotential?.ceiling)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-white/5">
                      <span className="text-xs text-zinc-500">Confidence</span>
                      <span className="text-sm text-white font-medium">{display(analysis.stage2?.improvementPotential?.confidence)}</span>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* STAGE 3 TAB */}
          {activeTab === 'stage3' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              {/* Test Results Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Consistency Test */}
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Consistency Test</h3>
                    <span className="text-3xl font-light text-white">{display(analysis.stage3?.consistency_test?.score)}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Critical Issue</h4>
                    <p className="text-sm text-zinc-300">{display(analysis.stage3?.consistency_test?.critical_issue)}</p>
                  </div>
                </div>

                {/* Assumption Stress Test */}
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Assumption Stress Test</h3>
                    <span className="text-3xl font-light text-white">{display(analysis.stage3?.assumption_stress_test?.score)}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Fatal Dependency</h4>
                    <p className="text-sm text-zinc-300">{display(analysis.stage3?.assumption_stress_test?.fatal_dependency)}</p>
                  </div>
                </div>

                {/* Objection Coverage Test */}
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Objection Coverage Test</h3>
                    <span className="text-3xl font-light text-white">{display(analysis.stage3?.objection_coverage_test?.score)}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Missed High Impact Item</h4>
                    <p className="text-sm text-zinc-300">{display(analysis.stage3?.objection_coverage_test?.missed_high_impact_item)}</p>
                  </div>
                </div>

                {/* Clarity Under Pressure Test */}
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Clarity Under Pressure</h3>
                    <span className="text-3xl font-light text-white">{display(analysis.stage3?.clarity_under_pressure_test?.score)}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">30s Takeaway</h4>
                    <p className="text-sm text-zinc-300 italic">&quot;{display(analysis.stage3?.clarity_under_pressure_test?.['30s_takeaway'])}&quot;</p>
                  </div>
                </div>

                {/* Market Believability Test */}
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Market Believability</h3>
                    <span className="text-3xl font-light text-white">{display(analysis.stage3?.market_believability_test?.score)}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Unconvincing Claim</h4>
                    <p className="text-sm text-zinc-300">{display(analysis.stage3?.market_believability_test?.unconvincing_claim)}</p>
                  </div>
                </div>

                {/* Story Coherence Test */}
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Story Coherence</h3>
                    <span className="text-3xl font-light text-white">{display(analysis.stage3?.story_coherence_test?.score)}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Flow Break Point</h4>
                    <p className="text-sm text-zinc-300">{display(analysis.stage3?.story_coherence_test?.flow_break_point)}</p>
                  </div>
                </div>

              </div>

              {/* Final Readiness Scoring */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                <div className="text-center space-y-4">
                  <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Final Readiness Scoring</h3>
                  <div className="text-6xl font-light text-white">{display(analysis.stage3?.final_readiness_scoring?.overall_readiness)}</div>
                  <div className="inline-block px-4 py-2 rounded-full bg-white/10 border border-white/20">
                    <span className="text-sm font-bold text-white uppercase tracking-wider">
                      Band: {display(analysis.stage3?.final_readiness_scoring?.readiness_band)}
                    </span>
                  </div>
                  {analysis.stage3?.final_readiness_scoring?.critical_issue_penalties && (
                    <div className="text-xs text-amber-400 flex items-center justify-center gap-2">
                      <AlertTriangle className="w-3 h-3" />
                      Critical Issue Penalties Applied
                    </div>
                  )}
                </div>
              </div>

              {/* Investor Gate Verdict */}
              <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Investor Gate Verdict
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-sm text-zinc-500">Pass Human Review</span>
                    <span className={cn(
                      "text-lg font-bold uppercase",
                      analysis.stage3?.investor_gate_verdict?.pass_human_review ? 'text-emerald-400' : 'text-red-400'
                    )}>
                      {display(analysis.stage3?.investor_gate_verdict?.pass_human_review)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-sm text-zinc-500">Confidence Level</span>
                    <span className="text-lg font-medium text-white">{display(analysis.stage3?.investor_gate_verdict?.confidence_level)}</span>
                  </div>
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Main Blocking Reason</h4>
                    <p className="text-sm text-zinc-300 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                      {display(analysis.stage3?.investor_gate_verdict?.main_blocking_reason)}
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* METADATA TAB */}
          {activeTab === 'metadata' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              <div className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Analysis Metadata</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 rounded-xl bg-black/20 border border-white/5">
                    <div className="text-xs text-zinc-500 uppercase mb-2">Analyzed At</div>
                    <div className="text-lg text-white font-medium">
                      {analysis.metadata?.analyzedAt 
                        ? new Date(analysis.metadata.analyzedAt).toLocaleString() 
                        : '-'}
                    </div>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-black/20 border border-white/5">
                    <div className="text-xs text-zinc-500 uppercase mb-2">Pitch Deck Length</div>
                    <div className="text-3xl text-white font-light">{display(analysis.metadata?.pitchDeckLength)}</div>
                    <div className="text-xs text-zinc-500 mt-1">characters</div>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-black/20 border border-white/5">
                    <div className="text-xs text-zinc-500 uppercase mb-2">Processing Time</div>
                    <div className="text-3xl text-white font-light">
                      {analysis.metadata?.processingTimeMs 
                        ? (analysis.metadata.processingTimeMs / 1000).toFixed(2) 
                        : '-'}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">seconds</div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}
