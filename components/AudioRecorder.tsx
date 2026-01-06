'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Upload, FileText, X, ArrowRight, Loader2, Video } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useMediaRecorder } from '@/hooks/useMediaRecorder'

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob | null, fileContext?: string) => void
  onError: (errorMessage: string) => void
  mode: 'file' | 'video' | 'both'
}

export default function AudioRecorder({
  onRecordingComplete,
  onError,
  mode
}: AudioRecorderProps) {

  // -- Missing Refs & State ---
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [parsedContext, setParsedContext] = useState<string>('')
  const [isProcessingFile, setIsProcessingFile] = useState(false)

  // Use hook
  const {
    isRecording,
    recordingTime,
    startRecording: startRecordingHook,
    stopRecording: stopRecordingHook,
    formatTime
  } = useMediaRecorder({
    onRecordingComplete: (blob) => onRecordingComplete(blob, parsedContext),
    onError: (err) => onError(err)
  })

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      if (fileUrl) URL.revokeObjectURL(fileUrl)
    }
  }, [fileUrl])

  // -- Handlers --

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    const url = URL.createObjectURL(file)
    setFileUrl(url)
    setIsProcessingFile(true)

    // Simulate PDF parsing or call API
    // In a real app, you'd send formData to /api/parse-pdf
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/parse-doc', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error("Parse doc failed:", errText)
        throw new Error("Failed to parse document")
      }

      let data;
      try {
        data = await response.json()
      } catch (e) {
        throw new Error("Invalid JSON from parse-doc")
      }

      if (data.error) throw new Error(data.error)

      setParsedContext(data.text || "")
    } catch (err: any) {
      console.error("PDF parse error", err)
      onError(err.message || "Failed to parse PDF")
      setParsedContext('')
      // Clear file selection on error so user can try again
      setUploadedFile(null)
      setFileUrl(null)
    } finally {
      setIsProcessingFile(false)
    }
  }

  const startRecording = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: mode !== 'file' // Enable video if mode is 'video' or 'both'
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      const mime = mode === 'file' ? 'audio/webm' : 'video/webm'
      startRecordingHook(stream, mime)

    } catch (err: any) {
      console.error("Media access error:", err)
      let msg = "Microphone/Camera access denied"
      if (err.name === 'NotReadableError') msg = "Camera/Mic is in use by another app"
      if (err.name === 'NotAllowedError') msg = "Permission denied. Please allow access."
      if (err.name === 'OverConstrainedError') msg = "No camera found with requested settings"
      onError(`${msg} (${err.name || err.message})`)
    }
  }

  const stopRecording = () => {
    stopRecordingHook()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
  }

  // Effect to attach stream to video when it mounts (since it's conditional)
  useEffect(() => {
    if (isRecording && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(e => console.error("Error playing video refs:", e))
    }
  }, [isRecording])

  // Active Presentation Mode (Recording + File) OR Preview Mode (File Uploaded + Both Mode)
  if (mode === 'both' && fileUrl) {
    return (
      <div className="w-full h-full relative bg-gray-900 overflow-hidden">
        {/* Full Screen PDF Preview */}
        <object
          data={fileUrl}
          type="application/pdf"
          className="w-full h-full block"
        >
          <iframe src={fileUrl} className="w-full h-full border-none" title="PDF Preview">
            <p>This browser does not support PDFs. Please download the PDF to view it: <a href={fileUrl}>Download PDF</a>.</p>
          </iframe>
        </object>

        {/* Video PiP Overlay - Bottom Right (Visible during recording) */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-6 right-6 w-48 h-36 md:w-64 md:h-48 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black z-20"
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
            />
          </motion.div>
        )}

        {/* Recording Controls Overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="group relative flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500" />
              <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform duration-300">
                <Video className="w-8 h-8" />
              </div>
              <span className="absolute -bottom-10 text-sm text-zinc-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 text-center w-40 bg-black/50 px-2 py-1 rounded">
                Start Presentation
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-4 bg-zinc-900/90 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-xl">
              <div className="relative flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono text-white text-lg font-medium tracking-widest block min-w-[60px]">
                  {formatTime(recordingTime)}
                </span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-medium transition-colors"
              >
                <Square className="w-3 h-3 fill-current" /> Stop
              </button>
            </div>
          )}
        </div>

        {/* Helper text for preview mode */}
        {!isRecording && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur text-white/80 px-4 py-2 rounded-full text-sm pointer-events-none z-20 border border-white/5">
            Preview Mode - Click Record to Start
          </div>
        )}
        {/* Change File Button */}
        {!isRecording && (
          <button
            onClick={() => { setUploadedFile(null); setFileUrl(null); }}
            className="absolute top-6 right-6 bg-black/60 hover:bg-black/80 backdrop-blur text-white px-4 py-2 rounded-full text-sm z-30 border border-white/10 transition-colors"
          >
            Change File
          </button>
        )}
      </div>
    )
  }

  // Video Only Recording Mode UI
  if (isRecording && mode === 'video') {
    return (
      <div className="w-full h-full relative bg-black flex flex-col items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <div className="mb-8 p-4 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/5 text-center">
            <div className="text-5xl font-mono font-light text-white tracking-widest mb-2">
              {formatTime(recordingTime)}
            </div>
            <div className="text-red-400 text-xs font-medium uppercase tracking-widest animate-pulse">Recording active</div>
          </div>
        </div>

        <div className="absolute bottom-10 z-20">
          <button
            onClick={stopRecording}
            className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full text-lg font-medium shadow-lg hover:scale-105 transition-all w-48 justify-center"
          >
            <Square className="w-5 h-5 fill-current" /> Stop
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />

      {/* Main Interaction Area */}
      <div className="w-full max-w-md space-y-8 relative z-10">

        {/* File Upload Section */}
        {mode !== 'video' && (
          <AnimatePresence mode="wait">
            {!uploadedFile ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => fileInputRef.current?.click()}
                className="group cursor-pointer border border-dashed border-white/10 rounded-2xl p-8 hover:bg-white/5 transition-all text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto group-hover:bg-zinc-800 transition-colors">
                  <Upload className="w-5 h-5 text-zinc-500 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-300">Upload Pitch Deck</p>
                  <p className="text-xs text-zinc-500 mt-1">PDF format only</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-zinc-500">
                    {isProcessingFile ? 'Processing...' : 'Ready for analysis'}
                  </p>
                </div>
                {isProcessingFile ? (
                  <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setParsedContext(''); }}
                    className="p-2 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Recording Trigger Section - NOT for File Only mode */}
        {(mode === 'video' || (mode === 'both' && uploadedFile)) && (
          <div className="flex flex-col items-center justify-center min-h-[160px]">
            {isRecording ? (
              // Simple Audio Only Recording State (fallback/file only)
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />
                  <div className="font-mono text-4xl font-light text-white relative z-10 tracking-widest">
                    {formatTime(recordingTime)}
                  </div>
                </div>
                <button
                  onClick={stopRecording}
                  className="mx-auto flex items-center gap-2 px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full border border-red-500/20 transition-all text-sm"
                >
                  <Square className="w-4 h-4 fill-current" /> Stop Recording
                </button>
              </div>
            ) : (
              <button
                onClick={startRecording}
                disabled={mode === 'both' && !uploadedFile}
                className="group relative flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500" />
                <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform duration-300">
                  <Video className="w-8 h-8" />
                </div>
                <span className="absolute -bottom-10 text-sm text-zinc-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 text-center w-40">
                  {mode === 'both' && !uploadedFile ? 'Upload file first' : 'Start Recording'}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Start Analysis Button (File Only Mode with File Uploaded and NO Recording) */}
        {(mode === 'file' && uploadedFile && !isRecording) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              onClick={() => onRecordingComplete(null, parsedContext)}
              disabled={isProcessingFile}
              className="w-full h-14 bg-white text-black hover:bg-zinc-200 text-base font-medium rounded-xl shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
            >
              {isProcessingFile ? 'Processing File...' : 'Start Analysis'}
              {!isProcessingFile && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </motion.div>
        )}

      </div>
    </div>
  )
}
