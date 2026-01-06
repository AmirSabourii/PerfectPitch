'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
    ArrowRight, Play, Check, AlertTriangle, BarChart3, 
    Brain, Target, Shield, Clock, Users, TrendingUp,
    FileText, Mic, MessageSquare, CheckCircle2, XCircle,
    Building2, Rocket, Globe, Briefcase, Loader2, Send
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

// --- Animation Components ---
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

// --- Navigation ---
const VCNav = () => (
    <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none"
    >
        <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-full py-2 px-6 flex items-center gap-8 shadow-2xl pointer-events-auto">
            <Link href="/" className="text-white font-bold tracking-tight">PerfectPitch</Link>
            <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
                <a href="#problem" className="hover:text-white transition-colors">Problem</a>
                <a href="#solution" className="hover:text-white transition-colors">Solution</a>
                <a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a>
            </div>
            <a href="#cta" className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors">
                Request Access
            </a>
        </div>
    </motion.nav>
)

// --- Solution Card ---
const SolutionCard = ({ icon: Icon, title, description, delay }: any) => (
    <FadeIn delay={delay} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all group">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
            <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-zinc-400 leading-relaxed">{description}</p>
    </FadeIn>
)

// --- Use Case Card ---
const UseCaseCard = ({ icon: Icon, title, description }: any) => (
    <div className="flex gap-4 p-6 bg-zinc-900/30 border border-white/5 rounded-xl hover:bg-zinc-900/50 transition-colors">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <h4 className="text-white font-medium mb-1">{title}</h4>
            <p className="text-zinc-500 text-sm">{description}</p>
        </div>
    </div>
)

// --- Contact Form Component ---
const VCContactForm = () => {
    const [formData, setFormData] = useState({
        organization: '',
        role: '',
        phone: '',
        email: '',
        notes: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        try {
            await addDoc(collection(db, 'vc_leads'), {
                ...formData,
                createdAt: serverTimestamp(),
                status: 'new'
            })
            setIsSubmitted(true)
        } catch (err) {
            console.error('Error submitting form:', err)
            setError('Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">Thank you!</h3>
                <p className="text-zinc-400">We&apos;ll be in touch within 24 hours.</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Organization Name *</label>
                    <input
                        type="text"
                        required
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                        placeholder="Sequoia Capital"
                    />
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Your Role *</label>
                    <input
                        type="text"
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                        placeholder="Partner"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Email *</label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                        placeholder="partner@vc.com"
                    />
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Phone Number</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                        placeholder="+1 (555) 000-0000"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm text-zinc-400 mb-2">Notes (optional)</label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors resize-none"
                    placeholder="Tell us about your portfolio size, use case, or any questions..."
                />
            </div>

            {error && (
                <div className="text-red-400 text-sm">{error}</div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-white text-black py-4 rounded-full font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    <>
                        <Send className="w-5 h-5" />
                        Request VC Access
                    </>
                )}
            </button>
        </form>
    )
}

export default function VCLandingPage() {
    return (
        <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-white/20">
            <VCNav />

            {/* ========== HERO SECTION ========== */}
            <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
                {/* Background Effects */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/5 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100vw] h-[40vh] bg-white/[0.02] blur-[80px] rounded-[100%] pointer-events-none" />

                <div className="relative z-10 text-center max-w-5xl mx-auto">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-300 mb-8">
                            <Building2 className="w-4 h-4" />
                            For Venture Capital Firms
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.1}>
                        <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-8 leading-[1.1]">
                            Most startups don&apos;t fail<br />
                            because of ideas.<br />
                            <span className="text-zinc-500">They fail because of bad pitches.</span>
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
                            PerfectPitch is an AI-powered pitch simulator that trains founders before they face real investors.
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.3}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a href="#walkthrough" className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-zinc-200 transition-colors">
                                <Play className="w-5 h-5" />
                                See how it works
                                <span className="text-zinc-500 text-sm">(2-min demo)</span>
                            </a>
                            <a href="#cta" className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-white hover:bg-white/5 transition-colors">
                                Use it with your portfolio
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </FadeIn>
                </div>

                {/* Scroll Indicator */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2"
                >
                    <div className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-2">
                        <motion.div 
                            animate={{ y: [0, 12, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-1 h-2 bg-white/50 rounded-full"
                        />
                    </div>
                </motion.div>
            </section>

            {/* ========== PROBLEM SECTION ========== */}
            <section id="problem" className="py-32 px-6 bg-[#030303] border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <FadeIn className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs text-red-400 mb-6">
                            <AlertTriangle className="w-3 h-3" />
                            THE HIDDEN COST
                        </div>
                        <h2 className="text-4xl md:text-5xl font-medium mb-6">
                            The hidden cost of bad pitches<br />
                            <span className="text-zinc-500">for VCs</span>
                        </h2>
                    </FadeIn>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <FadeIn delay={0.1}>
                            <div className="flex gap-4 p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                    <XCircle className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white mb-2">70%</div>
                                    <p className="text-zinc-400">of pitch decks are rejected in the first 5 minutes</p>
                                </div>
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.2}>
                            <div className="flex gap-4 p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                    <Clock className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white mb-2">Hours</div>
                                    <p className="text-zinc-400">Partners waste time filtering unprepared founders</p>
                                </div>
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.3}>
                            <div className="flex gap-4 p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                    <Users className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white mb-2">Demo Days</div>
                                    <p className="text-zinc-400">showcase presentation skill, not startup quality</p>
                                </div>
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.4}>
                            <div className="flex gap-4 p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                    <MessageSquare className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white mb-2">Feedback</div>
                                    <p className="text-zinc-400">is subjective, inconsistent, and non-scalable</p>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* ========== SOLUTION SECTION ========== */}
            <section id="solution" className="py-32 px-6 bg-black relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-white/5 blur-[150px] rounded-full pointer-events-none" />
                
                <div className="max-w-6xl mx-auto relative z-10">
                    <FadeIn className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-medium mb-6">
                            PerfectPitch turns pitch quality<br />
                            <span className="text-zinc-400">into a measurable, improvable signal</span>
                        </h2>
                    </FadeIn>

                    <div className="grid md:grid-cols-3 gap-8">
                        <SolutionCard
                            icon={BarChart3}
                            title="AI Pitch Analysis"
                            description="Objective scoring across structure, clarity, logic, and persuasion. No more gut feelings."
                            delay={0.1}
                        />
                        <SolutionCard
                            icon={Brain}
                            title="Investor Simulation"
                            description="Founders practice against a skeptical AI VC that challenges assumptions in real-time."
                            delay={0.2}
                        />
                        <SolutionCard
                            icon={Target}
                            title="Founder Readiness Score"
                            description="A standardized readiness metric across your entire deal flow pipeline."
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* ========== PRODUCT WALKTHROUGH ========== */}
            <section id="walkthrough" className="py-32 px-6 bg-[#030303] border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <FadeIn className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 mb-6">
                            <Play className="w-3 h-3" />
                            PRODUCT WALKTHROUGH
                        </div>
                        <h2 className="text-4xl md:text-5xl font-medium mb-6">How it works</h2>
                        <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
                            You don&apos;t guess founder readiness. <span className="text-white">You measure it.</span>
                        </p>
                    </FadeIn>

                    {/* Steps */}
                    <div className="grid md:grid-cols-4 gap-6 mb-16">
                        <FadeIn delay={0.1} className="relative">
                            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 h-full">
                                <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center font-bold mb-4">1</div>
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                                    <FileText className="w-6 h-6 text-zinc-400" />
                                </div>
                                <h4 className="text-white font-medium mb-2">Upload & Present</h4>
                                <p className="text-zinc-500 text-sm">Founder uploads deck and records their pitch presentation</p>
                            </div>
                            <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-[2px] bg-zinc-800" />
                        </FadeIn>

                        <FadeIn delay={0.2} className="relative">
                            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 h-full">
                                <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center font-bold mb-4">2</div>
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                                    <BarChart3 className="w-6 h-6 text-zinc-400" />
                                </div>
                                <h4 className="text-white font-medium mb-2">AI Analysis</h4>
                                <p className="text-zinc-500 text-sm">AI analyzes slides + speech consistency in real-time</p>
                            </div>
                            <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-[2px] bg-zinc-800" />
                        </FadeIn>

                        <FadeIn delay={0.3} className="relative">
                            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 h-full">
                                <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center font-bold mb-4">3</div>
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                                    <Brain className="w-6 h-6 text-zinc-400" />
                                </div>
                                <h4 className="text-white font-medium mb-2">AI VC Challenge</h4>
                                <p className="text-zinc-500 text-sm">AI VC challenges assumptions and asks tough questions live</p>
                            </div>
                            <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-[2px] bg-zinc-800" />
                        </FadeIn>

                        <FadeIn delay={0.4}>
                            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 h-full">
                                <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center font-bold mb-4">4</div>
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-6 h-6 text-zinc-400" />
                                </div>
                                <h4 className="text-white font-medium mb-2">Results</h4>
                                <p className="text-zinc-500 text-sm">Pitch Score, Risk Flags, and Improvement Actions</p>
                            </div>
                        </FadeIn>
                    </div>

                    {/* Visual Demo Placeholder */}
                    <FadeIn delay={0.5}>
                        <div className="relative aspect-video bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 hover:bg-white/20 transition-colors cursor-pointer group">
                                        <Play className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-zinc-500">Watch 2-minute demo</p>
                                </div>
                            </div>
                            {/* Abstract UI Elements */}
                            <div className="absolute top-6 left-6 right-6 h-12 bg-black/50 rounded-lg border border-white/5" />
                            <div className="absolute bottom-6 left-6 right-6 h-16 bg-black/50 rounded-lg border border-white/5 flex items-center justify-center gap-2">
                                {[...Array(40)].map((_, i) => (
                                    <div key={i} className="w-1 bg-white/30 rounded-full" style={{ height: `${Math.random() * 30 + 10}px` }} />
                                ))}
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* ========== WHY VCs CARE ========== */}
            <section className="py-32 px-6 bg-black border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <FadeIn className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-medium mb-6">
                            Why top funds use<br />
                            <span className="text-zinc-400">PerfectPitch</span>
                        </h2>
                    </FadeIn>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {[
                            { title: 'Better signal before meetings', desc: 'Know founder readiness before you invest time' },
                            { title: 'Cleaner pipeline', desc: 'Filter out unprepared founders automatically' },
                            { title: 'Faster decision-making', desc: 'Standardized metrics speed up evaluation' },
                            { title: 'Stronger Demo Days', desc: 'Better prepared founders = better outcomes' },
                            { title: 'Scalable founder coaching', desc: 'Without human cost or time investment' },
                            { title: 'Competitive advantage', desc: 'Differentiate your fund with better tools' },
                        ].map((item, i) => (
                            <FadeIn key={i} delay={0.1 + i * 0.05}>
                                <div className="flex items-start gap-4 p-6 bg-zinc-900/30 border border-white/5 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                        <Check className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium mb-1">{item.title}</h4>
                                        <p className="text-zinc-500 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== USE CASES ========== */}
            <section id="use-cases" className="py-32 px-6 bg-[#030303] border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <FadeIn className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 mb-6">
                            USE CASES
                        </div>
                        <h2 className="text-4xl md:text-5xl font-medium mb-6">
                            Built for VC workflows
                        </h2>
                    </FadeIn>

                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <FadeIn delay={0.1}>
                            <UseCaseCard
                                icon={Target}
                                title="Pre-screening applicants"
                                description="Evaluate pitch quality before partner meetings"
                            />
                        </FadeIn>
                        <FadeIn delay={0.15}>
                            <UseCaseCard
                                icon={Rocket}
                                title="Accelerator demo day prep"
                                description="Get your cohort ready for investor presentations"
                            />
                        </FadeIn>
                        <FadeIn delay={0.2}>
                            <UseCaseCard
                                icon={Users}
                                title="Founder coaching at scale"
                                description="Provide consistent feedback without partner time"
                            />
                        </FadeIn>
                        <FadeIn delay={0.25}>
                            <UseCaseCard
                                icon={TrendingUp}
                                title="Post-investment development"
                                description="Help portfolio founders improve continuously"
                            />
                        </FadeIn>
                        <FadeIn delay={0.3} className="md:col-span-2">
                            <UseCaseCard
                                icon={Globe}
                                title="Emerging market founders training"
                                description="Level the playing field for founders who lack access to pitch coaching"
                            />
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* ========== TRUST & CREDIBILITY ========== */}
            <section className="py-32 px-6 bg-black border-t border-white/5">
                <div className="max-w-4xl mx-auto">
                    <FadeIn className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-medium mb-6">
                            Built for trust
                        </h2>
                    </FadeIn>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { icon: Brain, text: 'Built with GPT-4o + real-time voice' },
                            { icon: Briefcase, text: 'Designed by product & startup operators' },
                            { icon: Shield, text: 'Privacy-first (no data retention)' },
                            { icon: FileText, text: 'No pitch decks used for training models' },
                        ].map((item, i) => (
                            <FadeIn key={i} delay={0.1 + i * 0.05}>
                                <div className="flex items-center gap-4 p-5 bg-zinc-900/30 border border-white/5 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                        <item.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-white font-medium">{item.text}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== FINAL CTA WITH FORM ========== */}
            <section id="cta" className="py-32 px-6 bg-[#030303] border-t border-white/5 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/10 blur-[150px] rounded-full pointer-events-none" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <FadeIn className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-medium mb-6">
                            Turn pitch quality into a<br />
                            <span className="text-zinc-400">competitive advantage</span>
                        </h2>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                            Request access and we&apos;ll set up a pilot for your portfolio.
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <VCContactForm />
                    </FadeIn>
                </div>
            </section>

            {/* ========== FOOTER ========== */}
            <footer className="py-16 border-t border-white/5 bg-[#030303]">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-white rounded-sm" />
                            <span className="font-bold tracking-tight">PerfectPitch</span>
                            <span className="text-zinc-600 text-sm ml-2">for VCs</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-zinc-500">
                            <Link href="/" className="hover:text-white transition-colors">Founder Landing</Link>
                            <a href="#problem" className="hover:text-white transition-colors">Problem</a>
                            <a href="#solution" className="hover:text-white transition-colors">Solution</a>
                            <a href="#cta" className="hover:text-white transition-colors">Contact</a>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/5 text-center text-zinc-600 text-sm">
                        © 2024 PerfectPitch Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}
