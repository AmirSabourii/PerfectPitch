import { HTMLAttributes, forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLMotionProps<"div"> {
    gradient?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, gradient, children, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    'rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl overflow-hidden',
                    gradient && 'bg-gradient-to-br from-slate-900/80 to-slate-800/80',
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        )
    }
)
Card.displayName = 'Card'

export { Card }
