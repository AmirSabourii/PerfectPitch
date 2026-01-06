'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { Mic, ArrowRight } from 'lucide-react'

interface SetupViewProps {
    onStart: (name: string) => void
}

export function SetupView({ onStart }: SetupViewProps) {
    const [name, setName] = useState('')

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto w-full pt-20"
        >
            <Card className="p-8 bg-zinc-900 border-zinc-800">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-700">
                        <Mic className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">New Pitch Session</h2>
                    <p className="text-zinc-400 text-sm">Give your session a name to save it to history.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Project / Founder Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Acme Corp - Series A"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                            autoFocus
                        />
                    </div>

                    <Button
                        onClick={() => onStart(name)}
                        disabled={!name.trim()}
                        className="w-full h-12 text-lg"
                    >
                        Start Recording <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </Card>
        </motion.div>
    )
}
