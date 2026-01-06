'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Check, Sparkles, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function PricingView() {
    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="text-center mb-12 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl -z-10" />
                <h2 className="text-3xl md:text-5xl font-medium mb-4 text-white">
                    Start Your Validation
                </h2>
                <p className="text-zinc-500 text-lg max-w-2xl mx-auto leading-relaxed">
                    Choose the plan that fits your fundraising stage. No hidden fees.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Free Tier */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 flex flex-col h-full hover:border-white/20 transition-colors">
                        <div className="mb-8">
                            <h3 className="text-2xl font-semibold text-white">Starter</h3>
                            <div className="mt-4 flex items-baseline text-zinc-400">
                                <span className="text-4xl font-bold tracking-tight text-white">$0</span>
                                <span className="ml-1 text-xl font-semibold">/month</span>
                            </div>
                            <p className="mt-4 text-zinc-500 text-sm">For founders just starting to shape their narrative.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-zinc-300">
                                <Check className="w-4 h-4 text-white" /> 1 Full Analysis
                            </li>
                            <li className="flex items-center gap-3 text-zinc-300">
                                <Check className="w-4 h-4 text-white" /> 1 Minute AI Roleplay
                            </li>
                            <li className="flex items-center gap-3 text-zinc-300">
                                <Check className="w-4 h-4 text-white" /> Basic Report
                            </li>
                        </ul>
                        <Button variant="outline" className="w-full py-6 rounded-full border-white/10 text-white hover:bg-white/5 transition-colors">
                            Current Plan
                        </Button>
                    </div>
                </motion.div>

                {/* Pro Tier (Popular) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                >
                    <div className="absolute inset-0 border border-white/20 rounded-3xl z-10 pointer-events-none" />
                    <div className="bg-[#0A0A0A] rounded-3xl p-8 flex flex-col h-full relative overflow-hidden">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none opacity-50" />

                        <div className="relative z-20 mb-8">
                            <div className="flex justify-between items-start">
                                <h3 className="text-2xl font-semibold text-white">Pro</h3>
                                <div className="px-3 py-1 rounded-full bg-white text-black text-xs font-bold uppercase">Popular</div>
                            </div>
                            <div className="mt-4 flex items-baseline text-zinc-400">
                                <span className="text-4xl font-bold tracking-tight text-white">$9.99</span>
                                <span className="ml-1 text-xl font-semibold">/month</span>
                            </div>
                            <p className="mt-4 text-zinc-400 text-sm">For serious founders raising Seed or Series A.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1 relative z-20">
                            <li className="flex items-center gap-3 text-white">
                                <Check className="w-4 h-4 text-white" /> 20 Full Analyses
                            </li>
                            <li className="flex items-center gap-3 text-white">
                                <Check className="w-4 h-4 text-white" /> 60 Minutes AI Roleplay
                            </li>
                            <li className="flex items-center gap-3 text-white">
                                <Check className="w-4 h-4 text-white" /> Founder Stress Test Mode
                            </li>
                            <li className="flex items-center gap-3 text-white">
                                <Check className="w-4 h-4 text-white" /> Priority Support
                            </li>
                        </ul>
                        <Button className="relative z-20 w-full py-6 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors font-bold border-0">
                            Upgrade Now
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
