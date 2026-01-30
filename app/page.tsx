'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Upload, Mic, Users, Award, Check, Zap, MonitorPlay, Briefcase, GraduationCap, Lightbulb, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLandingCopy } from '@/hooks/useCopy'
import { PricingSlider } from '@/components/PricingSlider'

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

const FloatingNav = ({ brand, process, boardroom, pricing, cta }: { brand: string, process: string, boardroom: string, pricing: string, cta: string }) => (
  <motion.nav
    initial={{ y: -100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.8, delay: 0.5 }}
    className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none"
  >
    <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-full py-2 pl-6 pr-3 flex items-center gap-4 shadow-2xl pointer-events-auto">
      <span className="text-white font-bold tracking-tight">{brand}</span>
      <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
        <a href="#how-it-works" className="hover:text-white transition-colors">{process}</a>
        <a href="#whats-next" className="hover:text-white transition-colors">What&apos;s Next</a>
        <a href="#pricing" className="hover:text-white transition-colors">{pricing}</a>
      </div>
      <Link href="/login" className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors">
        {cta}
      </Link>
    </div>
  </motion.nav>
)

const StepCard = ({ number, title, description, icon: Icon, delay, label }: any) => (
  <FadeIn delay={delay} className="group relative bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors overflow-hidden h-full flex flex-col">
    <div className="flex justify-between items-start mb-8">
      <div className="border border-white/10 rounded-full px-3 py-1 text-xs text-zinc-500 group-hover:text-white group-hover:border-white/20 transition-colors">
        {label} {number}
      </div>
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
    </div>

    <div className="mt-auto">
      <h3 className="text-xl font-medium text-white mb-3">{title}</h3>
      <p className="text-zinc-500 leading-relaxed text-sm">{description}</p>
    </div>

    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
  </FadeIn>
)

const PersonaCard = ({ title, type, icon: Icon, description, colorClass, isPremium, badge }: any) => (
  <FadeIn className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 relative overflow-hidden group h-full flex flex-col">
    <div className={cn("absolute top-0 right-0 p-32 opacity-10 bg-gradient-to-br rounded-full blur-3xl -mr-16 -mt-16 transition-opacity duration-700", colorClass)} />

    {isPremium && (
      <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
        <Crown className="w-3 h-3" />
        <span>{badge}</span>
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
  const { copy, isRTL } = useLandingCopy()

  const stepIcons = [Users, Upload, Mic, Award]
  const personaConfig = [
    { id: 'vc', icon: Briefcase, colorClass: 'from-red-500 to-orange-500', premium: false },
    { id: 'mentor', icon: GraduationCap, colorClass: 'from-green-500 to-emerald-500', premium: false },
    { id: 'brainstorm', icon: Lightbulb, colorClass: 'from-blue-500 to-cyan-500', premium: false },
    { id: 'practice', icon: Zap, colorClass: 'from-purple-500 to-pink-500', premium: false },
    { id: 'founder_test', icon: Crown, colorClass: 'from-amber-500 to-yellow-500', premium: true },
  ] as const

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-white/20" dir={isRTL ? 'rtl' : 'ltr'}>
      <FloatingNav
        brand={copy.nav.brand}
        process={copy.nav.process}
        boardroom={copy.nav.boardroom}
        pricing={copy.nav.pricing}
        cta={copy.nav.cta}
      />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150vw] h-[50vh] bg-white/[0.05] blur-[100px] rounded-[100%] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[30vh] bg-white/[0.08] blur-[80px] rounded-[100%] pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-[-5vh]">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 mb-8 mx-auto hover:bg-white/10 transition-colors cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> {copy.hero.badge}
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h1 className="text-5xl md:text-8xl font-medium tracking-tight mb-8 text-white">
              {copy.hero.heading}
            </h1>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              {copy.hero.subheading}
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-white/10 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                <Link href="/login" className="relative flex items-center bg-black text-white px-8 py-4 rounded-full border border-white/10 hover:bg-zinc-900 transition-colors">
                  {copy.hero.cta}
                  <ArrowRight className={cn("w-4 h-4 ml-2 text-zinc-400 group-hover:text-white transition-colors", isRTL && 'rotate-180 mr-2 ml-0')} />
                </Link>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-center gap-4 text-xs text-zinc-600">
              <div>{copy.hero.highlights[0]}</div>
              <div className="w-1 h-1 rounded-full bg-zinc-800" />
              <div>{copy.hero.highlights[1]}</div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Process Grid Section */}
      <section id="how-it-works" className="py-32 px-6 bg-[#030303] relative z-20">
        <div className="max-w-[1400px] mx-auto">
          <FadeIn className="mb-24 text-center">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">{copy.process.heading}</h2>
            <p className="text-zinc-500 max-w-lg mx-auto">{copy.process.subheading}</p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr mb-32">
            {copy.process.steps.map((step, index) => (
              <StepCard
                key={step.title}
                number={`0${index + 1}`}
                title={step.title}
                description={step.description}
                icon={stepIcons[index]}
                delay={0.1 * (index + 1)}
                label={isRTL ? 'گام' : 'Step'}
              />
            ))}
          </div>

          {/* Deep Analysis Feature */}
          <div className="grid md:grid-cols-2 gap-16 items-center py-24 border-t border-white/5">
            <FadeIn>
              <div className="inline-flex items-center gap-2 text-green-400 mb-6 font-mono text-xs uppercase tracking-wider">
                <MonitorPlay className="w-4 h-4" /> {copy.process.deepEyebrow}
              </div>
              <h3 className="text-4xl md:text-5xl font-medium mb-6 leading-tight">{copy.process.deepHeading}</h3>
              <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
                {copy.process.deepBody}
              </p>
              <ul className="space-y-4">
                {copy.process.deepBullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3 text-zinc-300">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>
                    {bullet}
                  </li>
                ))}
              </ul>
            </FadeIn>
            <FadeIn delay={0.2} className="relative aspect-video bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-x-8 top-8 bottom-24 bg-zinc-900/50 rounded-lg border border-white/5 p-4 flex gap-4">
                <div className="w-3/4 h-full bg-zinc-800/50 rounded flex items-center justify-center text-zinc-600 text-xs">SLIDE PREVIEW</div>
                <div className="w-1/4 h-full space-y-2">
                  <div className="h-full bg-zinc-800/30 rounded relative overflow-hidden">
                    <div className="absolute bottom-0 inset-x-0 h-1/2 bg-green-500/20" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 h-20 bg-[#050505] border-t border-white/5 flex items-center justify-center gap-1">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className="w-1 bg-zinc-500 rounded-full" style={{ height: `${Math.random() * 40 + 10}%` }} />
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* COMMENTED OUT - AI Boardroom Section - Will be enabled later */}
      {/* <section id="boardroom" className="py-32 px-6 bg-black relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-[1400px] mx-auto relative z-10">
          <FadeIn className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-medium mb-6">{copy.boardroom.heading}</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              {copy.boardroom.subheading}
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {personaConfig.map(({ id, icon, colorClass, premium }) => {
              const persona = copy.boardroom.personas[id as keyof typeof copy.boardroom.personas]
              return (
                <PersonaCard
                  key={id}
                  title={persona.title}
                  type={persona.type}
                  icon={icon}
                  description={persona.description}
                  colorClass={colorClass}
                  isPremium={premium}
                  badge={persona.badge}
                />
              )
            })}
          </div>
        </div>
      </section> */}

      {/* What's Next Section */}
      <section id="whats-next" className="py-32 px-6 bg-black relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Zap className="w-4 h-4" />
              Coming Soon
            </div>
            <h2 className="text-4xl md:text-6xl font-medium mb-6">What&apos;s Next</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              We&apos;re constantly improving to give you the best pitch analysis experience
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Role Play Feature */}
            <FadeIn delay={0.1} className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 opacity-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">AI Role Play</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Practice your pitch with different AI personas - from tough VCs to supportive mentors
                </p>
              </div>
            </FadeIn>

            {/* Video Input Feature */}
            <FadeIn delay={0.2} className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 opacity-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                  <MonitorPlay className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Video Analysis</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Upload video presentations and get comprehensive feedback on delivery and content
                </p>
              </div>
            </FadeIn>

            {/* Audio Output Feature */}
            <FadeIn delay={0.3} className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 opacity-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                  <Mic className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Voice Feedback</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Receive analysis results as natural voice feedback for a more interactive experience
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-[#030303] border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-medium mb-6">Simple Pricing</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">Pay per analysis. No subscription required.</p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <PricingSlider />
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-white/5 bg-[#030303] text-center">
        <div className="flex items-center justify-center gap-2 mb-6 opacity-50">
          <div className="w-4 h-4 bg-white rounded-sm" />
          <span className="font-bold tracking-tight">{copy.nav.brand}</span>
        </div>
        <p className="text-zinc-600 text-sm">{copy.footer.rights}</p>
      </footer>
    </div>
  )
}
