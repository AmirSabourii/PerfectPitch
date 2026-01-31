'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Edit2 } from 'lucide-react'

export interface ExtractedPitchData {
    problem: string
    solution: string
    market: string
    competitors: string
    businessModel: string
    traction: string
    team: string
    financials: string
    ask: string
    stage: string
    industry: string
    additionalInfo: string
}

export interface ExtractedDataReviewConfirmOptions {
    useDeepResearch?: boolean
}

interface ExtractedDataReviewProps {
    extractedData: ExtractedPitchData
    onConfirm: (data: ExtractedPitchData, options?: ExtractedDataReviewConfirmOptions) => void
    onCancel: () => void
}

// Capsule button style - same size (aligned with PerfectPitch)
const BTN_CLASS = 'h-11 w-[180px] rounded-full text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors'

const FIELDS: Array<{ key: keyof ExtractedPitchData; label: string }> = [
    { key: 'problem', label: 'Problem' },
    { key: 'solution', label: 'Solution' },
    { key: 'market', label: 'Market' },
    { key: 'competitors', label: 'Competitors' },
    { key: 'businessModel', label: 'Business Model' },
    { key: 'traction', label: 'Traction' },
    { key: 'team', label: 'Team' },
    { key: 'financials', label: 'Financials' },
    { key: 'ask', label: 'The Ask' },
    { key: 'stage', label: 'Stage' },
    { key: 'industry', label: 'Industry' },
    { key: 'additionalInfo', label: 'Additional Info' }
]

export default function ExtractedDataReview({
    extractedData,
    onConfirm,
    onCancel
}: ExtractedDataReviewProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedData, setEditedData] = useState<ExtractedPitchData>(extractedData)
    const [deepResearchEnabled, setDeepResearchEnabled] = useState(false)

    const handleConfirm = () => {
        onConfirm(editedData, { useDeepResearch: deepResearchEnabled })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full w-full max-w-6xl mx-auto flex flex-col min-h-0"
        >
            {/* Notice - no header */}
            <div className="shrink-0 mb-4 px-5 py-3 rounded-2xl border border-white/10 bg-white/[0.02]">
                <p className="text-sm text-white/70">
                    AI has extracted this information from your pitch deck. Verify accuracy and correct any errors before proceeding.
                </p>
            </div>

            {/* Options + Edit */}
            <div className="shrink-0 flex flex-wrap items-center justify-between gap-4 mb-4">
                <label className="flex items-center gap-3 cursor-pointer select-none px-4 py-2.5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-colors">
                    <input
                        type="checkbox"
                        checked={deepResearchEnabled}
                        onChange={(e) => setDeepResearchEnabled(e.target.checked)}
                        className="w-4 h-4 rounded border-white/30 bg-white/5 text-white focus:ring-white/30 accent-zinc-400"
                    />
                    <span className="text-sm text-white/80">Enable Deep Research (real web research – slower, more accurate)</span>
                </label>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`${BTN_CLASS} bg-white text-black hover:bg-zinc-200`}
                >
                    <Edit2 className="w-4 h-4" />
                    {isEditing ? 'View' : 'Edit'}
                </button>
            </div>

            {/* Scrollable fields - fills available space */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
                    {FIELDS.map(({ key, label }) => (
                        <fieldset key={key} className="space-y-2">
                            <label className="block text-xs font-medium uppercase tracking-wider text-white/60">
                                {label}
                            </label>
                            {isEditing ? (
                                <textarea
                                    value={editedData[key]}
                                    onChange={(e) => setEditedData({ ...editedData, [key]: e.target.value })}
                                    rows={key === 'additionalInfo' ? 4 : 3}
                                    className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
                                />
                            ) : (
                                <div className="px-5 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-sm text-white/90 whitespace-pre-wrap min-h-[72px]">
                                    {editedData[key] || (
                                        <span className="text-white/40 italic">Not specified</span>
                                    )}
                                </div>
                            )}
                        </fieldset>
                    ))}
                </div>
            </div>

            {/* Footer - capsule buttons */}
            <footer className="shrink-0 flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                <button
                    onClick={onCancel}
                    className={`${BTN_CLASS} border border-white/20 bg-transparent text-white/60 hover:text-white hover:bg-white/5`}
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirm}
                    className={`${BTN_CLASS} bg-white text-black hover:bg-zinc-200`}
                >
                    <Check className="w-4 h-4" />
                    Confirm & Analyze
                </button>
            </footer>
        </motion.div>
    )
}
