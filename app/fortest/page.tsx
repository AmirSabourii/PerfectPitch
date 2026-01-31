'use client'

import { useState } from 'react'
import { Check, Edit2, RotateCcw } from 'lucide-react'

// Shared capsule button style - all same size (aligned with PerfectPitch nav/CTA)
const BTN_CLASS = 'h-11 w-[180px] rounded-full text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors'

// Sample extracted data - AI has "read" the file and returned this
const MOCK_EXTRACTED_DATA = {
    problem: 'Small businesses struggle to manage inventory across multiple sales channels, leading to overselling, stockouts, and lost revenue. Manual reconciliation takes hours each week.',
    solution: 'A unified inventory platform that syncs stock levels in real-time across Amazon, Shopify, eBay, and retail POS. Automated restock alerts and one-click reordering.',
    market: 'TAM: $4.2B (SMB inventory software). SAM: $890M (multi-channel retailers). SOM: $45M in Year 3. Target: e-commerce sellers doing $500K–$5M/year.',
    competitors: 'Main: Cin7, TradeGecko (QuickBooks Commerce). We differentiate with native Amazon FBA integration, lower price point, and 2-hour setup vs 2-week onboarding.',
    businessModel: 'SaaS subscription: $99/mo (Starter), $249/mo (Pro), $499/mo (Enterprise). 18% gross margin on Starter, 72% on Enterprise. Target: 40% from Enterprise by Year 2.',
    traction: '420 paying customers, $38K MRR, 23% MoM growth for 6 months. 94% retention. Pilot with 3 Amazon Top 1000 sellers.',
    team: 'CEO: ex-Amazon logistics (5 yrs). CTO: ex-Stripe engineer. Head of Sales: 12 yrs in SMB SaaS. 2 engineers, 1 support.',
    financials: 'Current burn: $42K/mo. Runway: 14 months. Projected $1.2M ARR by EoY. Path to profitability at 1,800 customers.',
    ask: 'Seeking $800K seed. Use: 50% product (hiring 3 engineers), 30% sales/marketing, 20% ops. Milestone: 2,000 customers, $2M ARR in 18 months.',
    stage: 'Seed',
    industry: 'SaaS / Supply Chain Tech',
    additionalInfo: 'Nominated for Shopify App of the Year 2024. Two patents filed for cross-channel sync algorithm. Open to strategic partnership with logistics providers.'
}

type ExtractedPitchData = typeof MOCK_EXTRACTED_DATA

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

export default function ForTestPage() {
    const [isEditing, setIsEditing] = useState(false)
    const [data, setData] = useState<ExtractedPitchData>(MOCK_EXTRACTED_DATA)

    const resetData = () => setData({ ...MOCK_EXTRACTED_DATA })

    return (
        <div className="fixed inset-0 min-h-screen w-screen bg-[#030303] text-white overflow-hidden flex flex-col">
            {/* Header - capsule bar like PerfectPitch nav */}
            <header className="shrink-0 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 rounded-full bg-white/[0.03] border border-white/10 py-2.5 pl-6 pr-3">
                    <div className="min-w-0">
                        <h1 className="text-base font-medium tracking-tight">Extracted Pitch Data</h1>
                        <p className="text-xs text-white/50 mt-0.5">Review and edit before analysis</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={resetData}
                            className={`${BTN_CLASS} border border-white/20 bg-transparent text-white/80 hover:bg-white/5 hover:text-white`}
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`${BTN_CLASS} bg-white text-black hover:bg-zinc-200`}
                        >
                            <Edit2 className="w-4 h-4" />
                            {isEditing ? 'View' : 'Edit'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Scrollable content */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    {/* Notice - capsule badge style */}
                    <div className="mb-6 px-5 py-4 rounded-2xl border border-white/10 bg-white/[0.02]">
                        <p className="text-sm text-white/70">
                            AI has extracted this information from your pitch deck. Verify accuracy and correct any errors before proceeding.
                        </p>
                    </div>

                    {/* Fields grid - rounded-2xl cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {FIELDS.map(({ key, label }) => (
                            <fieldset key={key} className="space-y-2">
                                <label className="block text-xs font-medium uppercase tracking-wider text-white/60">
                                    {label}
                                </label>
                                {isEditing ? (
                                    <textarea
                                        value={data[key]}
                                        onChange={(e) => setData({ ...data, [key]: e.target.value })}
                                        rows={key === 'additionalInfo' ? 4 : 3}
                                        className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
                                    />
                                ) : (
                                    <div className="px-5 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-sm text-white/90 whitespace-pre-wrap min-h-[72px]">
                                        {data[key] || (
                                            <span className="text-white/40 italic">Not specified</span>
                                        )}
                                    </div>
                                )}
                            </fieldset>
                        ))}
                    </div>

                    <div className="h-24" />
                </div>
            </main>

            {/* Footer - same capsule buttons */}
            <footer className="shrink-0 border-t border-white/10 px-6 py-4 flex items-center justify-between bg-[#030303]">
                <button className={`${BTN_CLASS} border border-white/20 bg-transparent text-white/60 hover:text-white hover:bg-white/5`}>
                    Cancel
                </button>
                <button className={`${BTN_CLASS} bg-white text-black hover:bg-zinc-200`}>
                    <Check className="w-4 h-4" />
                    Confirm & Analyze
                </button>
            </footer>
        </div>
    )
}
