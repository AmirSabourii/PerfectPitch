'use client'

import { useRef, useEffect } from 'react'

interface AudioVisualizerProps {
    stream?: MediaStream | null
    isActive: boolean
}

export const AudioVisualizer = ({ stream, isActive }: AudioVisualizerProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
    const analyzerRef = useRef<AnalyserNode | null>(null)
    const animationParamsRef = useRef({
        rotation: 0,
        pulses: [0, 0, 0]
    })

    useEffect(() => {
        if (!stream || !isActive || !canvasRef.current) return

        // Setup Audio
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        audioContextRef.current = audioContext
        const analyzer = audioContext.createAnalyser()
        analyzer.fftSize = 256
        analyzerRef.current = analyzer

        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyzer)
        sourceRef.current = source

        // Start Animation
        draw()

        return () => {
            audioContext.close()
        }
    }, [stream, isActive])

    const draw = () => {
        if (!canvasRef.current || !analyzerRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // High DPI fix
        const dpr = window.devicePixelRatio || 1
        canvas.width = canvas.clientWidth * dpr
        canvas.height = canvas.clientHeight * dpr
        ctx.scale(dpr, dpr)

        const bufferLength = analyzerRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        const render = () => {
            if (!isActive) return
            requestAnimationFrame(render)

            analyzerRef.current!.getByteFrequencyData(dataArray)

            // Calculate average volume
            let sum = 0
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i]
            }
            const average = sum / bufferLength
            const normalizedVol = average / 255

            // Clear
            ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)

            const centerX = canvas.clientWidth / 2
            const centerY = canvas.clientHeight / 2

            // Update Pulse Physics
            animationParamsRef.current.rotation += 0.002

            // Draw Orb
            // Core
            ctx.beginPath()
            const coreBase = 30
            const coreExpansion = normalizedVol * 30
            ctx.arc(centerX, centerY, coreBase + coreExpansion, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + normalizedVol * 0.5})`
            ctx.shadowBlur = 20 + normalizedVol * 50
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'
            ctx.fill()

            // Rings
            for (let i = 0; i < 3; i++) {
                ctx.beginPath()
                const offset = i * 20
                const ringRad = coreBase + coreExpansion + offset + (Math.sin(Date.now() / 1000 + i) * 5)

                ctx.arc(centerX, centerY, ringRad, 0, Math.PI * 2)
                ctx.strokeStyle = `rgba(100, 100, 100, ${0.2 - i * 0.05})`
                ctx.lineWidth = 1
                ctx.stroke()
            }

            // Particles (optional, keep minimal for now)
        }

        render()
    }

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full absolute inset-0 pointer-events-none"
        />
    )
}
