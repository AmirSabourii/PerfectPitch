'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Target, Briefcase, BarChart } from 'lucide-react'
import { cn } from '@/lib/utils'

import { ContextData } from '@/lib/types'

interface ContextCollectionProps {
    onComplete: (data: ContextData) => void
    onBack: () => void
}

const STAGES = [
    { id: 'Idea', label: 'Idea Stage', desc: 'No product, just a concept.' },
    { id: 'Pre-Seed', label: 'Pre-Seed', desc: 'MVP, early traction, <$10k MRR.' },
    { id: 'Seed', label: 'Seed', desc: 'Product-market fit, growing, <$50k MRR.' },
    { id: 'Series A', label: 'Series A', desc: 'Scaling, proven unit economics.' },
]

const INDUSTRIES = [
    'SaaS / B2B',
    'Consumer App',
    'Fintech',
    'HealthTech',
    'E-commerce',
    'Marketplace',
    'Deep Tech / AI',
    'Hardware',
    'Other'
]

const AUDIENCES = [
    { id: 'VCs', label: 'Venture Capitalists', desc: 'ROI & Exit focused.' },
    { id: 'Angels', label: 'Angel Investors', desc: 'Team & Vision focused.' },
    { id: 'Customers', label: 'Potential Customers', desc: 'Value & Problem focused.' },
    { id: 'Partners', label: 'Strategic Partners', desc: 'Synergy focused.' },
]

export default function ContextCollection({ onComplete, onBack }: ContextCollectionProps) {
    const [stage, setStage] = useState('')
    const [industry, setIndustry] = useState('')
    const [targetAudience, setTargetAudience] = useState('VCs')

    const isComplete = stage && industry && targetAudience

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto w-full"
        >
            <div className="text-center mb-10">
                <h2 className="text-3xl font-medium text-white mb-3">Context Matters</h2>
                <p className="text-zinc-400">Tell us about your startup so we can analyze it with the right lens.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Stage & Audience */}
                <div className="space-y-8">

                    {/* Stage Section */}
                    <div className="space-y-4">
                        <h3 className="text-zinc-200 font-medium flex items-center gap-2">
                            <BarChart className="w-4 h-4 text-white" /> Current Stage
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {STAGES.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setStage(s.id)}
                                    className={cn(
                                        "p-3 rounded-xl border text-left transition-all",
                                        stage === s.id
                                            ? "bg-white/10 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                            : "bg-[#0A0A0A] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900"
                                    )}
                                >
                                    <div className="font-medium text-sm">{s.label}</div>
                                    <div className="text-[10px] text-zinc-500 mt-1">{s.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Audience Section */}
                    <div className="space-y-4">
                        <h3 className="text-zinc-200 font-medium flex items-center gap-2">
                            <Target className="w-4 h-4 text-white" /> Who are you pitching to?
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {AUDIENCES.map((a) => (
                                <button
                                    key={a.id}
                                    onClick={() => setTargetAudience(a.id)}
                                    className={cn(
                                        "p-3 rounded-xl border text-left transition-all",
                                        targetAudience === a.id
                                            ? "bg-white/10 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                            : "bg-[#0A0A0A] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900"
                                    )}
                                >
                                    <div className="font-medium text-sm">{a.label}</div>
                                    <div className="text-[10px] text-zinc-500 mt-1">{a.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Industry & Confirmation */}
                <div className="flex flex-col h-full space-y-8">

                    {/* Industry Section */}
                    <div className="space-y-4 flex-1">
                        <h3 className="text-zinc-200 font-medium flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-white" /> Industry
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {INDUSTRIES.map((ind) => (
                                <button
                                    key={ind}
                                    onClick={() => setIndustry(ind)}
                                    className={cn(
                                        "px-3 py-2 rounded-lg border text-xs font-medium transition-all text-center truncate",
                                        industry === ind
                                            ? "bg-white/10 border-white text-white"
                                            : "bg-[#0A0A0A] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900"
                                    )}
                                >
                                    {ind}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="pt-8 border-t border-white/5 flex items-center justify-between mt-auto">
                        <button
                            onClick={onBack}
                            className="text-sm text-zinc-500 hover:text-white transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => isComplete && onComplete({ stage, industry, targetAudience })}
                            disabled={!isComplete}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
                                isComplete
                                    ? "bg-white text-black hover:scale-105 shadow-lg shadow-white/10"
                                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                            )}
                        >
                            Start Analysis <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
