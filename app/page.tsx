'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Upload, Mic, Users, Award, Play, Check, Zap, BrainCircuit, ShieldAlert, MonitorPlay, Briefcase, GraduationCap, Lightbulb, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

// --- Components ---

const FadeIn = ({ children, delay = 0, className }: { children: React.ReactNode, delay?: number, className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        className={className}
    >
        {children}
    </motion.div>
)

const FloatingNav = () => (
    <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none"
    >
        <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-full py-2 px-6 flex items-center gap-8 shadow-2xl pointer-events-auto">
            <span className="text-white font-bold tracking-tight">PerfectPitch</span>
            <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
                <a href="#how-it-works" className="hover:text-white transition-colors">Process</a>
                <a href="#boardroom" className="hover:text-white transition-colors">Boardroom</a>
                <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            </div>
            <Link href="/login" className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors">
                Get Started
            </Link>
        </div>
    </motion.nav>
)

const StepCard = ({ number, title, description, icon: Icon, delay }: any) => (
    <FadeIn delay={delay} className="group relative bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors overflow-hidden h-full flex flex-col">
        <div className="flex justify-between items-start mb-8">
            <div className="border border-white/10 rounded-full px-3 py-1 text-xs text-zinc-500 group-hover:text-white group-hover:border-white/20 transition-colors">
                Step {number}
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                <Icon className="w-5 h-5" />
            </div>
        </div>

        <div className="mt-auto">
            <h3 className="text-xl font-medium text-white mb-3">{title}</h3>
            <p className="text-zinc-500 leading-relaxed text-sm">{description}</p>
        </div>

        {/* Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </FadeIn>
)

const PersonaCard = ({ title, type, icon: Icon, description, colorClass, isPremium }: any) => (
    <FadeIn className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 relative overflow-hidden group h-full flex flex-col">
        <div className={cn("absolute top-0 right-0 p-32 opacity-10 bg-gradient-to-br rounded-full blur-3xl -mr-16 -mt-16 transition-opacity duration-700", colorClass)} />

        {isPremium && (
            <div className="absolute top-4 right-4">
                <Crown className="w-4 h-4 text-amber-500" />
            </div>
        )}

        <div className="relative z-10 flex flex-col h-full">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Icon className={cn("w-6 h-6", isPremium ? "text-amber-500" : "text-white")} />
            </div>
            <h3 className="text-2xl font-semibold mb-1">{title}</h3>
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-medium mb-4 block">{type}</span>
            <p className="text-zinc-400 text-sm leading-relaxed flex-1">{description}</p>

            <div className="flex items-center gap-2 text-xs text-white/50 bg-white/5 p-3 rounded-lg border border-white/5 mt-6">
                <Mic className="w-3 h-3 animate-pulse text-white" />
                <span>Voice-enabled interaction</span>
            </div>
        </div>
    </FadeIn>
)

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-white/20">
            <FloatingNav />

            {/* Hero Section */}
            <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
                {/* Horizon Glow Effect */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150vw] h-[50vh] bg-white/[0.05] blur-[100px] rounded-[100%] pointer-events-none" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[30vh] bg-white/[0.08] blur-[80px] rounded-[100%] pointer-events-none" />

                <div className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-[-5vh]">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 mb-8 mx-auto hover:bg-white/10 transition-colors cursor-default">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> v2.0 Public Beta Included
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <h1 className="text-6xl md:text-9xl font-medium tracking-tight mb-8 text-white">
                            PerfectPitch
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.3}>
                        <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                            Validate your narrative, delivery, and slide deck with AI investors <br className="hidden md:block" /> <span className="text-white">before you pitch.</span>
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.4}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-white/10 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                                <Link href="/login" className="relative flex items-center bg-black text-white px-8 py-4 rounded-full border border-white/10 hover:bg-zinc-900 transition-colors">
                                    Start Validation <ArrowRight className="w-4 h-4 ml-2 text-zinc-400 group-hover:text-white transition-colors" />
                                </Link>
                            </div>
                        </div>
                        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-zinc-600">
                            <div>No credit card required</div>
                            <div className="w-1 h-1 rounded-full bg-zinc-800" />
                            <div>Free initial analysis</div>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Process Grid Section */}
            <section id="how-it-works" className="py-32 px-6 bg-[#030303] relative z-20">
                <div className="max-w-[1400px] mx-auto">
                    <FadeIn className="mb-24 text-center">
                        <h2 className="text-3xl md:text-4xl font-medium mb-4">From Deck to Deal</h2>
                        <p className="text-zinc-500 max-w-lg mx-auto">A streamlined, scientific process designed to maximize your funding probability.</p>
                    </FadeIn>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr mb-32">
                        <StepCard
                            number="01"
                            title="Subscribe"
                            description="Create your account and choose your specific founder sector for tailored advice."
                            icon={Users}
                            delay={0.1}
                        />
                        <StepCard
                            number="02"
                            title="Upload & Sync"
                            description="Upload your PDF deck. Our system parses slide context to match your speech."
                            icon={Upload}
                            delay={0.2}
                        />
                        <StepCard
                            number="03"
                            title="Active Roleplay"
                            description="Pitch naturally to AI investors who challenge your assumptions in real-time."
                            icon={Mic}
                            delay={0.3}
                        />
                        <StepCard
                            number="04"
                            title="Score & Iterate"
                            description="Receive your 0-100 Funding Readiness Score and actionable improvement tips."
                            icon={Award}
                            delay={0.4}
                        />
                    </div>

                    {/* Deep Analysis Feature */}
                    <div className="grid md:grid-cols-2 gap-16 items-center py-24 border-t border-white/5">
                        <FadeIn>
                            <div className="inline-flex items-center gap-2 text-green-400 mb-6 font-mono text-xs uppercase tracking-wider">
                                <MonitorPlay className="w-4 h-4" /> Deep Analysis Engine
                            </div>
                            <h3 className="text-4xl md:text-5xl font-medium mb-6">We see what you say.<br /><span className="text-zinc-500">Literally.</span></h3>
                            <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
                                Upload your pitch deck and record your presentation video/audio. Our AI analyzes your delivery in sync with your slides, identifying weak narratives, poor pacing, and confusing slides.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-zinc-300">
                                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>
                                    Slide-by-slide Sentiment Analysis
                                </li>
                                <li className="flex items-center gap-3 text-zinc-300">
                                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>
                                    Visual & Verbal Consistency Check
                                </li>
                            </ul>
                        </FadeIn>
                        <FadeIn delay={0.2} className="relative aspect-video bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            {/* Abstract UI for Analysis */}
                            <div className="absolute inset-x-8 top-8 bottom-24 bg-zinc-900/50 rounded-lg border border-white/5 p-4 flex gap-4">
                                <div className="w-3/4 h-full bg-zinc-800/50 rounded flex items-center justify-center text-zinc-600 text-xs">SLIDE PREVIEW</div>
                                <div className="w-1/4 h-full space-y-2">
                                    <div className="h-full bg-zinc-800/30 rounded relative overflow-hidden">
                                        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-green-500/20" />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-0 inset-x-0 h-20 bg-[#050505] border-t border-white/5 flex items-center justify-center gap-1">
                                {/* Audio Wave */}
                                {[...Array(30)].map((_, i) => (
                                    <div key={i} className="w-1 bg-zinc-500 rounded-full" style={{ height: `${Math.random() * 40 + 10}%` }} />
                                ))}
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* AI Boardroom Section */}
            <section id="boardroom" className="py-32 px-6 bg-black relative">
                {/* Background accent */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

                <div className="max-w-[1400px] mx-auto relative z-10">
                    <FadeIn className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-medium mb-6">The AI Boardroom</h2>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                            Practice with voice-based, real-time AI personas designed to pressure test your logic, not just your lines.
                        </p>
                    </FadeIn>

                    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                        <PersonaCard
                            title="VC Partner"
                            type="Pressure Test"
                            icon={Briefcase}
                            description="Ruthless, critical, focused on ROI. Will challenge your unit economics and market sizing."
                            colorClass="from-red-500 to-orange-500"
                        />
                        <PersonaCard
                            title="Startup Mentor"
                            type="Growth Focus"
                            icon={GraduationCap}
                            description="Helpful, constructive, focuses on growth. Guides you to refine your strategy and positioning."
                            colorClass="from-green-500 to-emerald-500"
                        />
                        <PersonaCard
                            title="Co-Founder"
                            type="Brainstorming"
                            icon={Lightbulb}
                            description="Creative, explores ideas, plays devil's advocate. Helps you think through blind spots."
                            colorClass="from-blue-500 to-cyan-500"
                        />
                        <PersonaCard
                            title="Practice Mode"
                            type="Rapid Fire"
                            icon={Zap}
                            description="Rapid-fire questions only. No chit-chat. Perfect for quick rehearsals before the real thing."
                            colorClass="from-purple-500 to-pink-500"
                        />
                        <PersonaCard
                            title="Founder Test"
                            type="Premium"
                            icon={Crown}
                            description="High-pressure rigorous vetting. The ultimate stress test for serious founders."
                            colorClass="from-amber-500 to-yellow-500"
                            isPremium={true}
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-32 px-6 bg-[#030303] border-t border-white/5">
                <div className="max-w-4xl mx-auto">
                    <FadeIn className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-medium mb-6">Simple, Transparent Pricing</h2>
                    </FadeIn>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Free Plan */}
                        <FadeIn delay={0.1} className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 flex flex-col">
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
                            </ul>
                            <Link href="/login" className="w-full block text-center py-3 rounded-full border border-white/10 text-white hover:bg-white/5 transition-colors font-medium">
                                Get Started
                            </Link>
                        </FadeIn>

                        {/* Pro Plan */}
                        <FadeIn delay={0.2} className="relative bg-[#0A0A0A] rounded-3xl p-8 flex flex-col overflow-hidden">
                            <div className="absolute inset-0 border border-white/20 rounded-3xl z-10 pointer-events-none" />
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
                            <Link href="/login" className="relative z-20 w-full block text-center py-3 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors font-bold">
                                Upgrade Knowledge
                            </Link>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-24 border-t border-white/5 bg-[#030303] text-center">
                <div className="flex items-center justify-center gap-2 mb-6 opacity-50">
                    <div className="w-4 h-4 bg-white rounded-sm" />
                    <span className="font-bold tracking-tight">PerfectPitch</span>
                </div>
                <p className="text-zinc-600 text-sm">© 2024 PerfectPitch Inc. All rights reserved.</p>
            </footer>
        </div>
    )
}
