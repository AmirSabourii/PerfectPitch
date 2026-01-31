'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  RotateCcw,
  Search,
  ShieldAlert,
  TrendingUp,
  Scale,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VCPipelineResult as VCPipelineResultType, DeepResearchOutput, PersonalityOutput, AdjudicatorOutput } from '@/lib/vcPipelineTypes'

interface VCPipelineResultProps {
  result: VCPipelineResultType
  onReset: () => void
}

const tabs = [
  { id: 'deepResearch', label: 'Deep Research', icon: Search },
  { id: 'riskFirst', label: 'Risk-First VC', icon: ShieldAlert },
  { id: 'upsideFirst', label: 'Upside-First VC', icon: TrendingUp },
  { id: 'adjudicator', label: 'Final Verdict', icon: Scale },
] as const

type TabId = (typeof tabs)[number]['id']

function safeStr(v: unknown): string {
  if (v == null) return '—'
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (Array.isArray(v)) return v.map(safeStr).join(', ')
  if (typeof v === 'object') return JSON.stringify(v)
  return '—'
}

function JsonBlock({
  data,
  depth = 0,
  label,
  defaultOpen = true,
}: {
  data: unknown
  depth?: number
  label?: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  if (data == null) {
    return (
      <div className="text-zinc-500 italic text-sm">
        {label && <span className="text-zinc-400">{label}: </span>}
        —
      </div>
    )
  }

  if (typeof data !== 'object') {
    return (
      <div className="text-sm">
        {label && <span className="text-zinc-400 font-medium">{label}: </span>}
        <span className="text-zinc-200">{safeStr(data)}</span>
      </div>
    )
  }

  if (Array.isArray(data)) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 text-left w-full text-sm text-zinc-300 hover:text-white"
        >
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {label && <span className="font-medium text-zinc-400">{label}</span>}
          <span className="text-zinc-500">[{data.length}]</span>
        </button>
        {open && (
          <div className="pl-5 space-y-2 border-l border-white/10 ml-1">
            {data.map((item, i) => (
              <JsonBlock key={i} data={item} depth={depth + 1} defaultOpen={depth < 2} />
            ))}
          </div>
        )}
      </div>
    )
  }

  const entries = Object.entries(data as Record<string, unknown>)
  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-left w-full text-sm text-zinc-300 hover:text-white"
      >
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        {label && <span className="font-medium text-zinc-400">{label}</span>}
        <span className="text-zinc-500">{entries.length} keys</span>
      </button>
      {open && (
        <div className="pl-5 space-y-2 border-l border-white/10 ml-1">
          {entries.map(([k, v]) => (
            <JsonBlock
              key={k}
              data={v}
              depth={depth + 1}
              label={k}
              defaultOpen={depth < 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const DEEP_RESEARCH_SECTION_LABELS: Record<string, string> = {
  competitorAnalysis: 'Competitor Analysis',
  targetAudienceAnalysis: 'Target Audience',
  valuePropositionAnalysis: 'Value Proposition',
  marketAnalysis: 'Market Analysis',
  competitiveAdvantage: 'Competitive Advantage',
  risksAndChallenges: 'Risks & Challenges',
  strategicRecommendations: 'Strategic Recommendations',
}

function DeepResearchTab({ data }: { data: DeepResearchOutput }) {
  const sectionKeys = Object.keys(DEEP_RESEARCH_SECTION_LABELS)
  const hasStructuredSections = sectionKeys.some((k) => data[k] != null && typeof data[k] === 'object')

  return (
    <div className="space-y-6">
      <p className="text-zinc-500 text-sm">
        Market research, competitors, risks, and strategic recommendations from web research.
      </p>
      {hasStructuredSections ? (
        <div className="space-y-4">
          {sectionKeys.map((key) => {
            const value = data[key]
            if (value == null) return null
            const label = DEEP_RESEARCH_SECTION_LABELS[key]
            return (
              <div key={key} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="px-4 py-2 border-b border-white/10 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {label}
                </div>
                <div className="p-4">
                  <JsonBlock data={value} defaultOpen={true} />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <JsonBlock data={data} defaultOpen={true} />
      )}
      <details className="mt-6">
        <summary className="text-sm text-zinc-500 cursor-pointer hover:text-zinc-300">View full JSON</summary>
        <pre className="mt-2 p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-400 overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  )
}

function PersonalityTab({ data, role }: { data: PersonalityOutput; role: string }) {
  const dimLabels: Record<string, string> = {
    problemUrgency: 'Problem & Urgency',
    marketSizeTiming: 'Market Size & Timing',
    solutionFit: 'Solution & Fit',
    businessModel: 'Business Model',
    executionTeam: 'Execution / Team',
    riskAssumptions: 'Risk & Assumptions',
    tractionEvidence: 'Traction & Evidence',
  }
  const dims = data.dimensionScores ? Object.entries(data.dimensionScores) : []
  const chain = data.chainOfReasoning && data.chainOfReasoning.length > 0 ? data.chainOfReasoning : []
  return (
    <div className="space-y-6">
      {/* Chain of Reasoning - primary, step by step */}
      {chain.length > 0 && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Chain of Reasoning</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Step-by-step analysis — evidence and logic</p>
          </div>
          <div className="p-4 space-y-3">
            {chain.map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-white/10 text-zinc-400 text-xs font-mono flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-zinc-300 leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score summary - secondary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Overall Score</p>
          <p className={cn(
            'text-2xl font-light',
            (data.overallScore ?? 0) >= 7 ? 'text-emerald-400' : (data.overallScore ?? 0) >= 5 ? 'text-amber-400' : 'text-red-400'
          )}>
            {data.overallScore ?? '—'}/10
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Verdict</p>
          <p className="text-lg font-medium text-white capitalize">{data.verdict ?? '—'}</p>
          {data.verdictReasoning && (
            <p className="text-sm text-zinc-400 mt-2">{data.verdictReasoning}</p>
          )}
        </div>
      </div>
      {data.overallReasoning && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Overall Reasoning</p>
          <p className="text-sm text-zinc-300">{data.overallReasoning}</p>
        </div>
      )}
      {dims.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-zinc-400 uppercase">Dimension Scores</h4>
          <div className="space-y-3">
            {dims.map(([key, val]) => {
              const score = typeof val === 'object' && val !== null && 'score' in val ? (val as { score: number }).score : null
              const reasoning = typeof val === 'object' && val !== null && 'reasoning' in val ? (val as { reasoning: string }).reasoning : ''
              const evidence = typeof val === 'object' && val !== null && 'evidence' in val ? (val as { evidence: string[] }).evidence : []
              return (
                <div key={key} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">{dimLabels[key] ?? key}</span>
                    <span className={cn(
                      'text-lg font-medium',
                      (score ?? 0) >= 7 ? 'text-emerald-400' : (score ?? 0) >= 5 ? 'text-amber-400' : 'text-red-400'
                    )}>
                      {score ?? '—'}/10
                    </span>
                  </div>
                  {reasoning && <p className="text-sm text-zinc-400">{reasoning}</p>}
                  {Array.isArray(evidence) && evidence.length > 0 && (
                    <ul className="text-xs text-zinc-500 list-disc list-inside">
                      {evidence.slice(0, 3).map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
      {(data.criticalRisks?.length || data.upsideDrivers?.length) ? (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-zinc-400 uppercase">
            {data.criticalRisks?.length ? 'Critical Risks' : 'Upside Drivers'}
          </h4>
          <ul className="space-y-2">
            {(data.criticalRisks ?? data.upsideDrivers ?? []).map((item: { risk?: string; driver?: string; reasoning?: string }, i: number) => (
              <li key={i} className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm">
                <span className="text-white font-medium">{('risk' in item ? item.risk : item.driver) ?? '—'}</span>
                {item.reasoning && <p className="text-zinc-400 mt-1">{item.reasoning}</p>}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {data.biasCheck && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Bias Check</p>
          <p className="text-sm text-zinc-300">{data.biasCheck}</p>
        </div>
      )}
      <details className="mt-6">
        <summary className="text-sm text-zinc-500 cursor-pointer hover:text-zinc-300">View full JSON</summary>
        <pre className="mt-2 p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-400 overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  )
}

function AdjudicatorTab({ data }: { data: AdjudicatorOutput }) {
  const chain = data.chainOfReasoning && data.chainOfReasoning.length > 0 ? data.chainOfReasoning : []
  return (
    <div className="space-y-6">
      {/* Chain of Reasoning - primary */}
      {chain.length > 0 && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Synthesis Chain of Reasoning</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Step-by-step: agreement, disagreement, resolution, verdict</p>
          </div>
          <div className="p-4 space-y-3">
            {chain.map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-white/10 text-zinc-400 text-xs font-mono flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-zinc-300 leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score summary - secondary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Final Score</p>
          <p className={cn(
            'text-2xl font-light',
            (data.finalScore ?? 0) >= 7 ? 'text-emerald-400' : (data.finalScore ?? 0) >= 5 ? 'text-amber-400' : 'text-red-400'
          )}>
            {data.finalScore ?? '—'}/10
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Final Verdict</p>
          <p className="text-lg font-medium text-white capitalize">{data.finalVerdict ?? '—'}</p>
          <p className="text-xs text-zinc-500 mt-1">Confidence: {data.confidence ?? '—'}</p>
        </div>
      </div>
      {data.verdictReasoning && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Verdict Reasoning</p>
          <p className="text-sm text-zinc-300">{data.verdictReasoning}</p>
        </div>
      )}
      {data.finalScoreReasoning && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Score Reasoning</p>
          <p className="text-sm text-zinc-300">{data.finalScoreReasoning}</p>
        </div>
      )}
      {data.agreement?.length ? (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs font-semibold text-zinc-400 uppercase mb-2">Agreement</p>
          <ul className="space-y-2">
            {data.agreement.map((a, i) => (
              <li key={i} className="text-sm">
                <span className="text-white font-medium">{a.point}</span>
                {a.evidence && <span className="text-zinc-400"> — {a.evidence}</span>}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {data.disagreement?.length ? (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs font-semibold text-zinc-400 uppercase mb-2">Disagreement & Resolution</p>
          <ul className="space-y-3">
            {data.disagreement.map((d, i) => (
              <li key={i} className="text-sm space-y-1">
                <span className="text-white font-medium">{d.topic}</span>
                <p className="text-zinc-500">Risk-First: {d.riskFirstView}</p>
                <p className="text-zinc-500">Upside-First: {d.upsideFirstView}</p>
                <p className="text-zinc-300">Resolution: {d.resolution}</p>
                {d.reasoning && <p className="text-zinc-400 italic">{d.reasoning}</p>}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {data.useOfResearch && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Use of Research</p>
          <p className="text-sm text-zinc-300">{data.useOfResearch}</p>
        </div>
      )}
      {data.biasCheck && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Bias Check</p>
          <p className="text-sm text-zinc-300">{data.biasCheck}</p>
        </div>
      )}
      {(data.prioritizedChecklist?.ideaImprovements?.length || data.prioritizedChecklist?.pitchImprovements?.length) ? (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Prioritized Checklist</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Actionable improvements — idea vs pitch</p>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.prioritizedChecklist?.ideaImprovements?.length ? (
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase mb-3">Idea Improvements</p>
                <ul className="space-y-2">
                  {[...(data.prioritizedChecklist.ideaImprovements || [])]
                    .sort((a, b) => a.priority - b.priority)
                    .map((x, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-white/10 text-zinc-400 text-xs font-mono flex items-center justify-center">
                          {x.priority || i + 1}
                        </span>
                        <div>
                          <p className="text-sm text-white">{x.item}</p>
                          {x.reasoning && <p className="text-xs text-zinc-500 mt-0.5">{x.reasoning}</p>}
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            ) : null}
            {data.prioritizedChecklist?.pitchImprovements?.length ? (
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase mb-3">Pitch Improvements</p>
                <ul className="space-y-2">
                  {[...(data.prioritizedChecklist.pitchImprovements || [])]
                    .sort((a, b) => a.priority - b.priority)
                    .map((x, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-white/10 text-zinc-400 text-xs font-mono flex items-center justify-center">
                          {x.priority || i + 1}
                        </span>
                        <div>
                          <p className="text-sm text-white">{x.item}</p>
                          {x.reasoning && <p className="text-xs text-zinc-500 mt-0.5">{x.reasoning}</p>}
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      <details className="mt-6">
        <summary className="text-sm text-zinc-500 cursor-pointer hover:text-zinc-300">View full JSON</summary>
        <pre className="mt-2 p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-400 overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  )
}

export default function VCPipelineResult({ result, onReset }: VCPipelineResultProps) {
  const [activeTab, setActiveTab] = useState<TabId>('deepResearch')

  if (!result?.deepResearch || !result?.riskFirst || !result?.upsideFirst || !result?.adjudicator) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950 rounded-3xl border border-zinc-900">
        <div className="text-center p-8">
          <p className="text-zinc-400 mb-4">Incomplete VC Pipeline result.</p>
          <button
            onClick={onReset}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            Start over
          </button>
        </div>
      </div>
    )
  }

  const { deepResearch, riskFirst, upsideFirst, adjudicator, metadata } = result

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-900 shadow-2xl">
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02] shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">VC Pipeline</h2>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
              {metadata?.analyzedAt ? new Date(metadata.analyzedAt).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>
        <div className="flex items-center p-1 rounded-full bg-black/40 border border-white/5">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-2',
                  activeTab === tab.id ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            )
          })}
        </div>
        <button
          onClick={onReset}
          className="p-2 text-zinc-500 hover:text-white transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto pb-24">
          {activeTab === 'deepResearch' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <DeepResearchTab data={deepResearch} />
            </motion.div>
          )}
          {activeTab === 'riskFirst' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <PersonalityTab data={riskFirst} role="Risk-First" />
            </motion.div>
          )}
          {activeTab === 'upsideFirst' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <PersonalityTab data={upsideFirst} role="Upside-First" />
            </motion.div>
          )}
          {activeTab === 'adjudicator' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <AdjudicatorTab data={adjudicator} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
