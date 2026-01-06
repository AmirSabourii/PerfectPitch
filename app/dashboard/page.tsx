'use client'

import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import { AnimatePresence, motion } from 'framer-motion'

function DashboardLayout() {
  const { error, setError } = useDashboard()

  return (
    <div className="flex h-screen bg-[#030303] text-white font-sans selection:bg-white/20 overflow-hidden">

      <DashboardSidebar />

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col min-w-0">
        {/* Background Glows matching Landing Page */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100vw] h-[50vh] bg-white/[0.03] blur-[100px] rounded-[100%] pointer-events-none" />

        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-white/5 flex items-center justify-between px-4 bg-[#030303]/50 backdrop-blur-sm z-30 sticky top-0">
          <div className="font-bold">PerfectPitch</div>
          <div className="flex items-center gap-4">
            {/* Mobile Menu trigger can be added here */}
          </div>
        </header>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-full shadow-xl backdrop-blur-md flex items-center gap-3"
            >
              <span className="font-medium text-sm">{error}</span>
              <button onClick={() => setError(null)} className="ml-2 hover:bg-white/20 rounded-full p-1">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Container */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative z-10 scrollbar-none">
          <DashboardContent />
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardLayout />
    </DashboardProvider>
  )
}
