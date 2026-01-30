'use client'

import { useDashboard } from '@/contexts/DashboardContext'
import { useAuth } from '@/contexts/AuthContext'
import { View } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Mic, Video, LayoutGrid, User, Crown, LogOut, Zap } from 'lucide-react'
import { useDashboardCopy } from '@/hooks/useCopy'

export function DashboardSidebar() {
    const { currentView, setCurrentView } = useDashboard()
    const { logout } = useAuth()
    const { copy } = useDashboardCopy()

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
                <span className="font-bold text-lg tracking-tight">{copy.sidebar.brand}</span>
            </div>

            <nav className="flex-1 space-y-1">
                <SidebarItem view="dashboard" icon={Mic} label={copy.sidebar.practice} />
                <SidebarItem view="pitch_recorder" icon={Video} label={copy.sidebar.recorder} />
                <SidebarItem view="credits" icon={Zap} label="Credits" />
                <SidebarItem view="history" icon={LayoutGrid} label={copy.sidebar.history} />
                <SidebarItem view="profile" icon={User} label={copy.sidebar.profile} />
            </nav>

            <div className="pt-4 border-t border-white/5 space-y-2">
                <div
                    onClick={() => logout()}
                    className="flex items-center gap-3 text-zinc-500 hover:text-white cursor-pointer transition-colors px-3 py-2 rounded-full hover:bg-white/5"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">{copy.sidebar.signOut}</span>
                </div>
            </div>
        </aside>
    )
}
