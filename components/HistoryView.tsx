'use client'

import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

export interface HistoryItem {
    id: string
    name: string
    date: string
    score: number
    summary: string
}

interface HistoryViewProps {
    history: HistoryItem[]
    onSelect: (item: HistoryItem) => void
}

export function HistoryView({ history, onSelect }: HistoryViewProps) {
    if (history.length === 0) {
        return (
            <div className="text-center text-zinc-500 py-20">
                <p>No history found. Start your first pitch!</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4">
            {history.map((item, i) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <Card className="p-4 bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 transition-colors cursor-pointer group" onClick={() => onSelect(item)}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-white text-lg">{item.name}</h3>
                                <div className="flex items-center gap-4 text-xs text-zinc-500 mt-2">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(item.date).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(item.date).toLocaleTimeString()}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-zinc-300">{item.score}</div>
                                <div className="text-[10px] text-zinc-600 font-mono">SCORED</div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            ))}
        </div>
    )
}
