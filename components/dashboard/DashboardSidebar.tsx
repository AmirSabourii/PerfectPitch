'use client'

import { useDashboard } from '@/contexts/DashboardContext'
import { useAuth } from '@/contexts/AuthContext'
import { View } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Mic, Video, LayoutGrid, User, Crown, LogOut } from 'lucide-react'

export function DashboardSidebar() {
    const { currentView, setCurrentView, analysisResult } = useDashboard()
    const { logout } = useAuth()

    const SidebarItem = ({ view, icon: Icon, label, isPremium }: { view: View, icon: any, label: string, isPremium?: boolean }) => (
        <div
            onClick={() => {
                if (isPremium) {
                    setCurrentView('dashboard')
                    // Logic for premium redirect if needed
                } else {
                    setCurrentView(view)
                }
            }}
            className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-full transition-colors cursor-pointer group mb-1",
                currentView === view ? "bg-white text-black font-medium" : "text-zinc-500 hover:text-white hover:bg-white/5",
                isPremium && "text-amber-500 hover:text-amber-400"
            )}
        >
            <Icon className={cn("w-4 h-4", currentView === view ? "text-black" : "group-hover:text-white", isPremium && "text-amber-500 group-hover:text-amber-400")} />
            <span className="hidden md:block text-sm">{label}</span>
            {isPremium && <Crown className="w-3 h-3 text-amber-500 ml-auto hidden md:block" />}
        </div>
    )

    return (
        <aside className="hidden md:flex flex-col w-64 p-4 z-20">
            <div className="flex items-center gap-3 px-4 py-4 mb-8">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-[#030303] rounded-sm" />
                </div>
                <span className="font-bold text-lg tracking-tight">PerfectPitch</span>
            </div>

            <nav className="flex-1 space-y-1">
                <SidebarItem view="dashboard" icon={Mic} label="Practice" />
                <SidebarItem view="pitch_recorder" icon={Video} label="Pitch Recorder" />
                <SidebarItem view="history" icon={LayoutGrid} label="History" />
                <SidebarItem view="profile" icon={User} label="Profile" />
            </nav>

            <div className="pt-4 border-t border-white/5 space-y-2">
                <div
                    onClick={() => setCurrentView('pricing')}
                    className={cn("flex items-center gap-3 text-white cursor-pointer transition-colors px-3 py-2 rounded-full border border-white/10 hover:bg-white/5", currentView === 'pricing' && "bg-white/10")}
                >
                    <Crown className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium">Upgrade Plan</span>
                </div>

                <div
                    onClick={() => logout()}
                    className="flex items-center gap-3 text-zinc-500 hover:text-white cursor-pointer transition-colors px-3 py-2 rounded-full hover:bg-white/5"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                </div>
            </div>
        </aside>
    )
}
