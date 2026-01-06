'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Video, Square, Download, ChevronLeft, ChevronRight, Mic, Play, MonitorPlay } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useMediaRecorder } from '@/hooks/useMediaRecorder'
import * as pdfjsLib from 'pdfjs-dist'

// Set worker source - this is critical for Next.js
// using local file from public/ to avoid CDN issues
if (typeof window !== 'undefined' && 'Worker' in window) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-worker.min.js'
}

export default function PitchRecorder() {
    const [file, setFile] = useState<File | null>(null)
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
    const [pageNum, setPageNum] = useState(1)
    const [numPages, setNumPages] = useState(0)

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const requestRef = useRef<number>()
    const timerRef = useRef<NodeJS.Timeout>()
    const currentPdfCanvasRef = useRef<HTMLCanvasElement | null>(null)

    // Constants
    const CANVAS_WIDTH = 1920
    const CANVAS_HEIGHT = 1080

    // Use custom hook
    const {
        isRecording,
        recordingTime,
        mediaBlob: recordedBlob,
        startRecording: startRecordingHook,
        stopRecording: stopRecordingHook,
        resetRecording: resetRecordingHook,
        formatTime
    } = useMediaRecorder({
        onError: (err) => console.error(err)
    })

    // Wrapper for setting recorded blob (handling reset)
    const setRecordedBlob = (blob: Blob | null) => {
        if (blob === null) {
            resetRecordingHook()
        }
    }

    // --- PDF & Camera Logic ---
    const draw = () => {
        if (!canvasRef.current || !videoRef.current) return

        const ctx = canvasRef.current.getContext('2d')
        if (!ctx) return

        // 1. Draw PDF Background (or black if loading)
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

        if (currentPdfCanvasRef.current) {
            // Fit PDF to canvas (contain)
            const pdf = currentPdfCanvasRef.current
            const scale = Math.min(CANVAS_WIDTH / pdf.width, CANVAS_HEIGHT / pdf.height)
            const w = pdf.width * scale
            const h = pdf.height * scale
            const x = (CANVAS_WIDTH - w) / 2
            const y = (CANVAS_HEIGHT - h) / 2
            ctx.drawImage(pdf, x, y, w, h)
        }

        // 2. Draw Webcam PiP (Bottom Right)
        if (streamRef.current && videoRef.current.readyState === 4) {
            const pipWidth = 480
            const pipHeight = 270 // 16:9
            const padding = 40
            const x = CANVAS_WIDTH - pipWidth - padding
            const y = CANVAS_HEIGHT - pipHeight - padding

            ctx.save()
            ctx.strokeStyle = 'white'
            ctx.lineWidth = 4
            ctx.strokeRect(x, y, pipWidth, pipHeight)
            ctx.drawImage(videoRef.current, x, y, pipWidth, pipHeight)
            ctx.restore()
        }

        requestRef.current = requestAnimationFrame(draw)
    }

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: 'user' },
                audio: true
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                await videoRef.current.play().catch(e => console.error("Error playing video:", e))
            }
            streamRef.current = stream

            // Start composition loop
            draw()
        } catch (err: any) {
            console.error("Error accessing camera:", err)
            let msg = "Could not access camera"
            if (err.name === 'NotReadableError') msg = "Camera is in use by another app"
            if (err.name === 'NotAllowedError') msg = "Camera permission denied"
            alert(`${msg}: ${err.message || err.name}`)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return
        if (selectedFile.type !== 'application/pdf') {
            alert('Please upload a PDF file')
            return
        }

        setFile(selectedFile)

        try {
            const arrayBuffer = await selectedFile.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
            setPdfDoc(pdf)
            setNumPages(pdf.numPages)
            setPageNum(1)
        } catch (error) {
            console.error('Error loading PDF:', error)
            alert('Error loading PDF')
        }
    }

    const renderPage = async (pageNumber: number) => {
        if (!pdfDoc) return null
        try {
            const page = await pdfDoc.getPage(pageNumber)
            const viewport = page.getViewport({ scale: 2.0 }) // High res

            // Create an offscreen canvas for the PDF page
            const offscreenCanvas = document.createElement('canvas')
            offscreenCanvas.width = viewport.width
            offscreenCanvas.height = viewport.height
            const ctx = offscreenCanvas.getContext('2d')

            if (!ctx) return null

            await page.render({ canvasContext: ctx, viewport }).promise
            return offscreenCanvas
        } catch (err) {
            console.error("Error rendering page:", err)
            return null
        }
    }

    useEffect(() => {
        let active = true
        const loadPage = async () => {
            if (pdfDoc && active) {
                const canvas = await renderPage(pageNum)
                if (active) currentPdfCanvasRef.current = canvas
            }
        }
        loadPage()
        return () => { active = false }
    }, [pdfDoc, pageNum])

    // --- Recording Controls ---
    const handleStart = () => {
        if (!canvasRef.current || !streamRef.current) return

        try {
            const canvasStream = canvasRef.current.captureStream(30) // 30 FPS
            const audioTrack = streamRef.current.getAudioTracks()[0]

            // We only want the mixed stream
            const combinedStream = new MediaStream([
                ...canvasStream.getVideoTracks(),
                ...(audioTrack ? [audioTrack] : [])
            ])

            startRecordingHook(combinedStream, 'video/webm')
        } catch (e) {
            console.error("Error starting stream composition:", e)
        }
    }

    const handleStop = () => {
        stopRecordingHook()
    }

    // --- Effects ---

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
            if (requestRef.current) cancelAnimationFrame(requestRef.current)
        }
    }, [])

    // Auto-start camera when file is loaded
    useEffect(() => {
        if (file) {
            startCamera()
        }
    }, [file])


    if (!file) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="p-6 bg-zinc-900 rounded-full border border-zinc-800 shadow-xl mb-4">
                    <MonitorPlay className="w-12 h-12 text-zinc-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Pitch Recorder</h2>
                    <p className="text-zinc-500 max-w-md mx-auto">
                        Upload your Pitch Deck (PDF) to start recording. Your video will be overlaid automatically.
                    </p>
                </div>

                <label className="cursor-pointer group relative">
                    <input type="file" onChange={handleFileChange} accept=".pdf" className="hidden" />
                    <div className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-zinc-200 transition-all shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] group-hover:scale-105">
                        <Upload className="w-5 h-5" />
                        <span>Upload PDF Deck</span>
                    </div>
                </label>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-black p-4 gap-4">
            {/* Top Bar */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    {!recordedBlob ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800">
                            <span className="text-zinc-400 text-sm font-medium">Slide {pageNum} / {numPages}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
                            <span className="text-green-500 text-sm font-medium">Recording Complete</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {isRecording && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full animate-pulse border border-red-500/20">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-red-500 font-mono font-medium">{formatTime(recordingTime)}</span>
                        </div>
                    )}

                    {!isRecording && !recordedBlob && (
                        <Button onClick={() => setFile(null)} variant="ghost" className="text-zinc-500 hover:text-white">
                            Change File
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Preview Area */}
            <div className="flex-1 relative bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
                {/* Hidden internal video for webcam feed */}
                <video ref={videoRef} muted playsInline autoPlay className="hidden" />

                {recordedBlob ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                        <video
                            src={URL.createObjectURL(recordedBlob)}
                            controls
                            className="max-h-[70%] rounded-lg border border-white/10 shadow-2xl"
                        />
                        <a
                            href={URL.createObjectURL(recordedBlob)}
                            download={`pitch-recording-${new Date().toISOString()}.webm`}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-transform hover:scale-105"
                        >
                            <Download className="w-5 h-5" /> Download Recording
                        </a>
                        <Button
                            variant="ghost"
                            onClick={() => { resetRecordingHook(); setFile(null); }}
                            className="text-zinc-500 hover:text-white"
                        >
                            Record Another
                        </Button>
                    </div>
                ) : (
                    <>
                        <canvas
                            ref={canvasRef}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            className="w-full h-full object-contain shadow-2xl"
                        />

                        {/* Navigation Overlays (Hover) */}
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
                            <button
                                onClick={() => setPageNum(p => Math.max(1, p - 1))}
                                className="pointer-events-auto p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur transition-all disabled:opacity-0"
                                disabled={pageNum <= 1}
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => setPageNum(p => Math.min(numPages, p + 1))}
                                className="pointer-events-auto p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur transition-all disabled:opacity-0"
                                disabled={pageNum >= numPages}
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Footer Controls */}
            {!recordedBlob && (
                <div className="h-24 flex items-center justify-center shrink-0">
                    {!isRecording ? (
                        <button
                            onClick={handleStart}
                            disabled={!file}
                            className="group flex flex-col items-center gap-2 disabled:opacity-50"
                        >
                            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <div className="w-6 h-6 bg-white rounded-full" />
                            </div>
                            <span className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Start Recording</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleStop}
                            className="group flex flex-col items-center gap-2"
                        >
                            <div className="w-16 h-16 rounded-full bg-zinc-800 border items-center justify-center flex border-zinc-700 shadow-lg group-hover:bg-zinc-700 transition-colors">
                                <Square className="w-6 h-6 text-red-500 fill-current" />
                            </div>
                            <span className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Stop & Finish</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
