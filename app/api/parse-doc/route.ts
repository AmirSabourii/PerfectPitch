import { NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import { withTimeout, TIMEOUTS } from '@/lib/timeout'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // Validate file size (max 10MB for PDF parsing)
        const fileSize = file.size || 0
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
        console.error('Parse error:', error.message)
        
        // Handle timeout errors
        if (error.message?.includes('timed out') || error.message?.includes('timeout')) {
            return NextResponse.json(
                { error: 'PDF parsing timed out. Please try with a smaller file.' },
                { status: 504 }
            )
        }
        
        return NextResponse.json(
            { error: error.message || 'Failed to parse document' },
            { status: 500 }
        )
    }
}
