'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, RotateCcw, BarChart3, Lightbulb, Target, MessageSquare, Menu, FileText, CheckCircle2, AlertCircle, AlertTriangle, CheckSquare, Mail, Copy, Check, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

import { DeepAnalysisResult } from '@/lib/types'

interface PitchAnalysisResultProps {
  analysis: DeepAnalysisResult
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
  const [activeTab, setActiveTab] = useState('overview')

  // Helper to safely access analysis data structure
  const pillars = analysis.pillars || {}
  const structure = pillars.structure || {}
  const clarity = pillars.clarity || {}
  const logic = pillars.logic || {}
  const persuasion = pillars.persuasion || {}
  const audience = pillars.audience || {}

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'structure', label: 'Structure' },
    { id: 'content', label: 'Content' },
    { id: 'persuasion', label: 'Persuasion' },
    { id: 'action_plan', label: 'Action Plan' },
    { id: 'assets', label: 'Assets' }
  ]

  const handleDownloadDoc = () => {
    // Generate text content from analysis
    const content = generateDocContent()
    
    // Create blob and download
    const blob = new Blob([content], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pitch-analysis-${new Date().toISOString().split('T')[0]}.doc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generateDocContent = () => {
    const lines: string[] = []
    
    lines.push('PITCH ANALYSIS REPORT')
    lines.push('=' .repeat(50))
    lines.push(`Date: ${new Date().toLocaleDateString()}`)
    lines.push('')
    
    // Overview
    lines.push('OVERVIEW')
    lines.push('-'.repeat(30))
    lines.push(`Overall Score: ${analysis.overallScore || 0}/100`)
    lines.push(`Grade: ${analysis.grade || 'N/A'}`)
    lines.push('')
    lines.push('Executive Summary:')
    lines.push(analysis.summary || 'Analysis not available.')
    lines.push('')
    
    // Strengths & Weaknesses
    if (analysis.strengths && analysis.strengths.length > 0) {
      lines.push('STRENGTHS')
      lines.push('-'.repeat(30))
      analysis.strengths.forEach((s, i) => lines.push(`${i + 1}. ${s}`))
      lines.push('')
    }
    
    if (analysis.weaknesses && analysis.weaknesses.length > 0) {
      lines.push('WEAKNESSES')
      lines.push('-'.repeat(30))
      analysis.weaknesses.forEach((w, i) => lines.push(`${i + 1}. ${w}`))
      lines.push('')
    }
    
    // Structure
    if (structure.score) {
      lines.push('STRUCTURE BREAKDOWN')
      lines.push('-'.repeat(30))
      lines.push(`Section Score: ${structure.score}%`)
      lines.push('')
      Object.entries((structure.breakdown || {}) as Record<string, any>).forEach(([key, data]) => {
        const label = key.replace(/([A-Z])/g, ' $1').trim()
        lines.push(`${label}: ${data.score}/100 ${data.present ? '✓' : '✗'}`)
        lines.push(`  ${data.feedback}`)
      })
      lines.push('')
    }
    
    // Clarity
    if (clarity.score) {
      lines.push('CLARITY')
      lines.push('-'.repeat(30))
      lines.push(`Score: ${clarity.score}%`)
      if (clarity.metrics) {
        lines.push(`Jargon Density: ${clarity.metrics.buzzwordDensity || 'N/A'}`)
        lines.push(`Avg Sentence Length: ${clarity.metrics.averageSentenceLength || 'N/A'}`)
      }
      if (clarity.feedback && clarity.feedback.length > 0) {
        lines.push('Feedback:')
        clarity.feedback.forEach(f => lines.push(`  - ${f}`))
      }
      lines.push('')
    }
    
    // Logic
    if (logic.flowScore) {
      lines.push('LOGIC FLOW')
      lines.push('-'.repeat(30))
      lines.push(`Flow Score: ${logic.flowScore}%`)
      if (logic.gaps && logic.gaps.length > 0) {
        lines.push('Gaps:')
        logic.gaps.forEach(g => lines.push(`  - ${g}`))
      }
      lines.push('')
    }
    
    // Persuasion
    if (persuasion.elements) {
      lines.push('PERSUASION DRIVERS')
      lines.push('-'.repeat(30))
      lines.push(`Evidence Based: ${persuasion.elements.evidenceBased}/100`)
      lines.push(`Differentiation: ${persuasion.elements.differentiation}/100`)
      lines.push(`Urgency: ${persuasion.elements.urgency}/100`)
      lines.push(`Social Proof: ${persuasion.elements.socialProof}/100`)
      lines.push('')
    }
    
    // Risks
    if (analysis.risks && analysis.risks.length > 0) {
      lines.push('INVESTOR RED FLAGS')
      lines.push('-'.repeat(30))
      analysis.risks.forEach((r, i) => lines.push(`${i + 1}. ${r}`))
      lines.push('')
    }
    
    // Action Items
    if (analysis.actionItems && analysis.actionItems.length > 0) {
      lines.push('ACTION ITEMS')
      lines.push('-'.repeat(30))
      analysis.actionItems.forEach((item, i) => lines.push(`${i + 1}. ${item}`))
      lines.push('')
    }
    
    // Investor Questions
    if (analysis.investorQuestions && analysis.investorQuestions.length > 0) {
      lines.push('RECOMMENDED PREP QUESTIONS')
      lines.push('-'.repeat(30))
      analysis.investorQuestions.forEach((q, i) => lines.push(`${i + 1}. ${q}`))
      lines.push('')
    }
    
    // Assets
    if (analysis.assets) {
      if (analysis.assets.elevatorPitch) {
        lines.push('30-SECOND ELEVATOR PITCH')
        lines.push('-'.repeat(30))
        lines.push(analysis.assets.elevatorPitch)
        lines.push('')
      }
      
      if (analysis.assets.coldEmail) {
        lines.push('INVESTOR COLD EMAIL')
        lines.push('-'.repeat(30))
        lines.push(analysis.assets.coldEmail)
        lines.push('')
      }
    }
    
    // Transcript
    if (transcript) {
      lines.push('TRANSCRIPT')
      lines.push('-'.repeat(30))
      lines.push(transcript)
      lines.push('')
    }
    
    return lines.join('\n')
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
            <h2 className="text-sm font-semibold text-white tracking-tight">Analysis Report</h2>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{new Date().toLocaleDateString()}</p>
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
            onClick={handleDownloadDoc}
            className="p-2 text-zinc-500 hover:text-white transition-colors print:hidden"
            title="Download Report"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onReset}
            className="p-2 text-zinc-500 hover:text-white transition-colors print:hidden"
            title="Reset Analysis"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <Button onClick={onStartQnA} size="sm" className="bg-white text-black hover:bg-zinc-200 border-none text-xs font-semibold px-4 rounded-full">
            Start Roleplay <ArrowRight className="w-3 h-3 ml-2" />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative scrollbar-hide">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-zinc-950/0 to-zinc-950/0 pointer-events-none" />

        <div className="p-8 max-w-5xl mx-auto space-y-12 pb-24">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

              {/* Hero Score Section */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="col-span-12 md:col-span-4 flex flex-col justify-center">
                  <div className="relative aspect-square flex items-center justify-center">
                    {/* Decorative Rings */}
                    <div className="absolute inset-0 border border-white/5 rounded-full" />
                    <div className="absolute inset-4 border border-white/5 rounded-full border-dashed animate-[spin_60s_linear_infinite]" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full blur-2xl" />

                    <div className="text-center relative z-10">
                      <span className="text-8xl font-light text-white tracking-tighter block leading-none">
                        {analysis.overallScore || 0}
                      </span>
                      <span className="text-sm text-zinc-500 font-medium uppercase tracking-widest mt-2 block">
                        Score
                      </span>
                    </div>

                    {/* Grade Badge */}
                    <div className="absolute top-0 right-0">
                      <div className="glass-panel px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white font-mono text-sm">
                        Grade {analysis.grade || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-8 flex flex-col justify-center space-y-6">
                  <div>
                    <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3">Executive Summary</h3>
                    <p className="text-xl text-zinc-200 font-light leading-relaxed">
                      {analysis.summary || "Analysis not available."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <h4 className="flex items-center gap-2 text-white text-xs font-bold uppercase mb-2">
                        <CheckCircle2 className="w-4 h-4" /> Strength
                      </h4>
                      <p className="text-sm text-zinc-300">{(analysis.strengths && analysis.strengths[0]) || "N/A"}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <h4 className="flex items-center gap-2 text-white text-xs font-bold uppercase mb-2">
                        <AlertCircle className="w-4 h-4" /> Weakness
                      </h4>
                      <p className="text-sm text-zinc-300">{(analysis.weaknesses && analysis.weaknesses[0]) || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investor Questions */}
              <div className="space-y-4 pt-8 border-t border-white/5">
                <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Recommended Prep Questions</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {(analysis.investorQuestions || []).map((q: string, i: number) => (
                    <div key={i} className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors">
                      <p className="text-sm text-zinc-300 leading-snug">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STRUCTURE TAB */}
          {activeTab === 'structure' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="flex items-end justify-between border-b border-white/5 pb-6">
                <div>
                  <h3 className="text-2xl font-light text-white">Structure Breakdown</h3>
                  <p className="text-zinc-500 text-sm mt-1">Foundational elements check</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-light text-white">{structure.score}%</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Section Score</div>
                </div>
              </div>

              <div className="grid gap-3">
                {Object.entries((structure.breakdown || {}) as Record<string, any>).map(([key, data], i) => (
                  <div key={key} className="group p-5 rounded-2xl bg-zinc-900/40 border border-white/5 hover:bg-zinc-900/60 transition-all flex items-start gap-4">
                    <div className={cn("mt-1 w-2 h-2 rounded-full shrink-0", data.present ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-zinc-700")} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                        <span className="text-xs font-mono text-zinc-500">{data.score}/100</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{data.feedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* CONTENT TAB */}
          {activeTab === 'content' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-8">
              {/* Clarity Column */}
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-300" /> Clarity
                    </h3>
                    <span className="text-2xl font-light text-white">{clarity.score}%</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm py-2 border-b border-white/5">
                      <span className="text-zinc-500">Jargon Density</span>
                      <span className="text-white font-mono">{clarity.metrics?.buzzwordDensity || 'Low'}</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-white/5">
                      <span className="text-zinc-500">Avg Sentence Length</span>
                      <span className="text-white font-mono">{clarity.metrics?.averageSentenceLength || 'Optimal'}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/5">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3">Feedback</h4>
                    <ul className="space-y-2">
                      {(clarity.feedback || []).map((f: string, i: number) => (
                        <li key={i} className="text-xs text-zinc-400 pl-3 border-l border-zinc-700">{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Logic Column */}
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-300" /> Logic Flow
                    </h3>
                    <span className="text-2xl font-light text-white">{logic.flowScore}%</span>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Gap Analysis</h4>
                    {(logic.gaps && logic.gaps.length > 0) ? (
                      logic.gaps.map((g: string, i: number) => (
                        <div key={i} className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                          <p className="text-xs text-red-200">{g}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 border border-dashed border-zinc-800 rounded-lg text-center text-xs text-zinc-500">
                        No major logic gaps detected.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PERSUASION TAB */}
          {activeTab === 'persuasion' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-8">Persuasion Drivers</h3>
                <div className="space-y-8">
                  {[
                    { label: 'Evidence Based', val: persuasion.elements?.evidenceBased },
                    { label: 'Differentiation', val: persuasion.elements?.differentiation },
                    { label: 'Urgency', val: persuasion.elements?.urgency },
                    { label: 'Social Proof', val: persuasion.elements?.socialProof }
                  ].map((item, i) => (
                    <div key={i} className="relative">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-base text-white font-medium">{item.label}</span>
                        <span className="text-sm text-zinc-500 font-mono">{item.val}/100</span>
                      </div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.val}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ACTION PLAN TAB */}
          {activeTab === 'action_plan' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

              {/* Risks Section (Skeptic Mode) */}
              <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10">
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <AlertTriangle className="w-4 h-4" /> Investor Red Flags (Skeptic Mode)
                </h3>
                <div className="grid gap-3">
                  {(analysis.risks && analysis.risks.length > 0) ? (
                    analysis.risks.map((risk: string, i: number) => (
                      <div key={i} className="flex gap-3 items-start p-3 bg-red-500/5 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        <span className="text-sm text-red-200/80">{risk}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-zinc-500 py-4 italic">No major red flags detected. Good job!</div>
                  )}
                </div>
              </div>

              {/* Action Items (Fix-It Roadmap) */}
              <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <CheckSquare className="w-4 h-4" /> Fix-It Roadmap
                </h3>
                <div className="space-y-3">
                  {(analysis.actionItems && analysis.actionItems.length > 0) ? (
                    analysis.actionItems.map((item: string, i: number) => (
                      <div key={i} className="flex gap-3 items-start group">
                        <div className="mt-1 w-4 h-4 rounded-full border border-indigo-500/30 group-hover:bg-indigo-500/20 transition-colors shrink-0" />
                        <p className="text-sm text-zinc-300">{item}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-zinc-500 py-4 italic">No specific action items generated.</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ASSETS TAB */}
          {activeTab === 'assets' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-6">

              {/* Elevator Pitch */}
              <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    30s Elevator Pitch
                  </h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(analysis.assets?.elevatorPitch || '')}
                    className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1 bg-black/20 rounded-xl p-4 text-sm text-zinc-300 leading-relaxed font-serif italic border border-white/5">
                  &quot;{analysis.assets?.elevatorPitch || 'Not generated.'}&quot;
                </div>
              </div>

              {/* Cold Email */}
              <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> Investor Cold Email
                  </h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(analysis.assets?.coldEmail || '')}
                    className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1 bg-black/20 rounded-xl p-4 text-xs text-zinc-400 font-mono whitespace-pre-wrap border border-white/5">
                  {analysis.assets?.coldEmail || 'Not generated.'}
                </div>
              </div>

            </motion.div>
          )}

          {/* TRANSCRIPT TAB (Removed as per instruction) */}
          {/* The original transcript tab content is removed here. */}

        </div>
      </div>
    </div>
  )
}

