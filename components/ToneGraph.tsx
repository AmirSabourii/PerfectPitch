'use client'

import { useEffect, useRef } from 'react'

export function ToneGraph({ stream }: { stream: MediaStream | null }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!stream || !canvasRef.current) return

        const audioContext = new AudioContext()
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')!

        let animationId: number

        // Simulated "History" of confidence/energy
        const history: number[] = new Array(50).fill(0)

        const draw = () => {
            animationId = requestAnimationFrame(draw)
            analyser.getByteFrequencyData(dataArray)

            // Calculate average volume (Energy)
            let sum = 0
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i]
            }
            const average = sum / bufferLength

            // Update history
            history.push(average)
            history.shift()

            // Render
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            ctx.beginPath()
            ctx.moveTo(0, canvas.height)

            for (let i = 0; i < history.length; i++) {
                const x = (i / history.length) * canvas.width
                const y = canvas.height - (history[i] / 255) * canvas.height

                ctx.lineTo(x, y)
            }

            ctx.strokeStyle = '#10b981' // Emerald
            ctx.lineWidth = 2
            ctx.stroke()

            // Gradient fill
            ctx.lineTo(canvas.width, canvas.height)
            ctx.lineTo(0, canvas.height)
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.5)')
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0)')
            ctx.fillStyle = gradient
            ctx.fill()

            // Label
            ctx.font = '10px monospace'
            ctx.fillStyle = '#6b7280'
            ctx.fillText('LIVE ENERGY / CONFIDENCE', 10, 20)
        }

        draw()

        return () => {
            cancelAnimationFrame(animationId)
            audioContext.close()
        }
    }, [stream])

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={80}
            className="w-full h-full"
        />
    )
}
