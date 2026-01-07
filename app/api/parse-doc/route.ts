import { NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import { withTimeout, TIMEOUTS } from '@/lib/timeout'

export const runtime = 'nodejs'
export const maxDuration = 120 // 2 minutes for PDF parsing

export async function POST(request: Request) {
    let fileSize = 0
    let fileName = 'unknown'
    
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // Validate file size (max 10MB for PDF parsing)
        fileSize = file.size || 0
        fileName = file.name || 'unknown'
        
        if (fileSize > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 10MB.' },
                { status: 400 }
            )
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        let text = ''

        if (file.name.endsWith('.pdf')) {
            const data = await withTimeout(
                pdfParse(buffer),
                TIMEOUTS.PDF_PARSE,
                'PDF parsing timed out. Please try with a smaller file.'
            )
            text = data.text
        } else {
            // Fallback
            return NextResponse.json({ error: 'Only PDF files are currently supported' }, { status: 400 })
        }

        // Clean text - NO LIMITS
        const cleanText = text.replace(/\s+/g, ' ').trim()

        if (!cleanText.length) {
            // Instead of erroring, return a placeholder so the flow continues.
            // The AI will see this text and can respond "I see you uploaded a PDF but I cannot read the text..."
            return NextResponse.json({
                text: "[SYSTEM DETECTED UNREADABLE PDF CONTENT - THIS DOCUMENT APPEARS TO BE A SCANNED IMAGE. THE ANALYSIS MAY BE LIMITED.]"
            })
        }

        return NextResponse.json({ text: cleanText })
    } catch (error: any) {
        const isTimeout = error.message?.includes('timed out') || error.message?.includes('timeout')
        
        // Full logging for 504 errors
        if (isTimeout) {
            console.error('='.repeat(80))
            console.error('[parse-doc] 504 TIMEOUT ERROR - FULL DETAILS:')
            console.error('='.repeat(80))
            console.error('Error message:', error.message)
            console.error('Error stack:', error.stack)
            console.error('Error name:', error.name)
            console.error('Error code:', error.code)
            console.error('File size:', fileSize, 'bytes')
            console.error('File name:', fileName)
            console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
            console.error('TIMEOUTS.PDF_PARSE:', TIMEOUTS.PDF_PARSE, 'ms')
            console.error('='.repeat(80))
            
            return NextResponse.json(
                { 
                    error: 'PDF parsing timed out. Please try with a smaller file.',
                    details: {
                        error: error.message,
                        timeout: TIMEOUTS.PDF_PARSE,
                        fileSize: fileSize,
                        fileName: fileName
                    }
                },
                { status: 504 }
            )
        }
        
        console.error('[parse-doc] Error:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code,
            fileSize: fileSize,
            fileName: fileName
        })
        
        return NextResponse.json(
            { error: error.message || 'Failed to parse document' },
            { status: 500 }
        )
    }
}
