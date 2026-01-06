'use client'

import { cn } from '@/lib/utils'
import { Briefcase, Lightbulb, GraduationCap, Zap, Crown } from 'lucide-react'
import { motion } from 'framer-motion'

export type RoleType = 'vc' | 'mentor' | 'brainstorm' | 'practice' | 'founder_test'

interface RoleSelectorProps {
    selectedRole: RoleType
    onSelect: (role: RoleType) => void
}

export function RoleSelector({ selectedRole, onSelect }: RoleSelectorProps) {
    const roles = [
        {
            id: 'vc',
            title: 'VC Partner',
            desc: 'Ruthless, critical, focused on ROI.',
            icon: Briefcase,
        },
        {
            id: 'mentor',
            title: 'Startup Mentor',
            desc: 'Helpful, constructive, focuses on growth.',
            icon: GraduationCap,
        },
        {
            id: 'brainstorm',
            title: 'Co-Founder',
            desc: 'Creative, explores ideas, plays devil\'s advocate.',
            icon: Lightbulb,
        },
        {
            id: 'practice',
            title: 'Practice Mode',
            desc: 'Rapid-fire questions only. No chit-chat.',
            icon: Zap,
        },
        {
            id: 'founder_test',
            title: 'Founder Test',
            desc: 'High-pressure rigorous vetting.',
            icon: Crown,
            isPremium: true
        },
    ] as const

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {roles.map((role) => {
                const isSelected = selectedRole === role.id
                const Icon = role.icon
                // @ts-ignore
                const isPremium = role.isPremium

                return (
                    <motion.div
                        key={role.id}
                        onClick={() => onSelect(role.id as RoleType)}
                        whileHover={{ y: -2 }}
                        className={cn(
                            "group p-4 rounded-xl border cursor-pointer transition-all relative overflow-hidden flex flex-col items-center text-center",
                            isSelected
                                ? "bg-white text-black border-white shadow-xl ring-1 ring-white/50 z-10"
                                : "bg-black text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900",
                            isPremium && !isSelected && "border-amber-900/30 bg-amber-950/5 hover:border-amber-700/50"
                        )}
                    >
                        {isPremium && (
                            <>
                                <div className="absolute top-2 right-2">
                                    <Crown className="w-3 h-3 text-amber-500" />
                                </div>
                                <div className="absolute -top-10 -right-10 w-20 h-20 bg-amber-500/10 blur-2xl" />
                            </>
                        )}

                        <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
                            isSelected ? "bg-black/5" : "bg-zinc-900 group-hover:bg-zinc-800",
                            isPremium && !isSelected && "bg-amber-950/20"
                        )}>
                            <Icon className={cn("w-5 h-5", isSelected ? "text-black" : isPremium ? "text-amber-500" : "text-white")} />
                        </div>

                        <h3 className={cn("font-semibold text-sm mb-1", isSelected ? "text-black" : "text-zinc-200")}>{role.title}</h3>
                        <p className={cn("text-[10px] leading-relaxed max-w-[120px]", isSelected ? "text-zinc-500" : "text-zinc-500")}>
                            {role.desc}
                        </p>
                    </motion.div>
                )
            })}
        </div>
    )
}
